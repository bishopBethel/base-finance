import { describe, it, expect } from 'vitest';
import {
  calcGross,
  calcTax,
  calcPension,
  calcTotals,
  generatePayslipsForRun,
  formatCurrency,
  formatDate,
} from '../../lib/payroll';
import { Employee, Earning, Deduction } from '../../lib/types';

describe('calcGross', () => {
  it('calculates gross pay with base salary and earnings', () => {
    const baseSalary = 50000;
    const earnings: Earning[] = [
      { type: 'bonus', amount: 5000 },
      { type: 'overtime', amount: 2000 },
    ];
    expect(calcGross(baseSalary, earnings)).toBe(57000);
  });

  it('handles zero earnings', () => {
    const baseSalary = 50000;
    const earnings: Earning[] = [];
    expect(calcGross(baseSalary, earnings)).toBe(50000);
  });

  it('handles large numbers', () => {
    const baseSalary = 1000000;
    const earnings: Earning[] = [
      { type: 'bonus', amount: 500000 },
    ];
    expect(calcGross(baseSalary, earnings)).toBe(1500000);
  });

  it('handles zero base salary', () => {
    const baseSalary = 0;
    const earnings: Earning[] = [
      { type: 'bonus', amount: 1000 },
    ];
    expect(calcGross(baseSalary, earnings)).toBe(1000);
  });
});

describe('calcTax', () => {
  it('calculates 10% tax and rounds to 2 decimals', () => {
    expect(calcTax(50000)).toBe(5000);
    expect(calcTax(50000.5)).toBe(5000.05);
    expect(calcTax(50000.123)).toBe(5000.01); // rounds down
    expect(calcTax(50000.125)).toBe(5000.13); // rounds up
  });

  it('handles zero gross pay', () => {
    expect(calcTax(0)).toBe(0);
  });

  it('handles large gross pay', () => {
    expect(calcTax(1000000)).toBe(100000);
  });
});

describe('calcPension', () => {
  it('calculates 8% pension on base salary and rounds to 2 decimals', () => {
    expect(calcPension(50000)).toBe(4000);
    expect(calcPension(50000.5)).toBe(4000.04);
    expect(calcPension(50000.123)).toBe(4000.01);
    expect(calcPension(50000.125)).toBe(4000.01);
  });

  it('handles zero base salary', () => {
    expect(calcPension(0)).toBe(0);
  });

  it('handles large base salary', () => {
    expect(calcPension(1000000)).toBe(80000);
  });
});

describe('calcTotals', () => {
  it('calculates totals correctly', () => {
    const baseSalary = 50000;
    const earnings: Earning[] = [{ type: 'bonus', amount: 5000 }];
    const deductions: Deduction[] = [{ type: 'loan', amount: 1000 }];
    const result = calcTotals(baseSalary, earnings, deductions);
    expect(result.grossPay).toBe(55000);
    expect(result.totalDeductions).toBe(9500); // tax 5500 + pension 4000 + deductions 1000
    expect(result.netPay).toBe(45500);
  });

  it('handles zero earnings and deductions', () => {
    const baseSalary = 50000;
    const earnings: Earning[] = [];
    const deductions: Deduction[] = [];
    const result = calcTotals(baseSalary, earnings, deductions);
    expect(result.grossPay).toBe(50000);
    expect(result.totalDeductions).toBe(9000); // tax 5000 + pension 4000
    expect(result.netPay).toBe(41000);
  });

  it('handles large deductions exceeding gross pay', () => {
    const baseSalary = 1000;
    const earnings: Earning[] = [];
    const deductions: Deduction[] = [{ type: 'large', amount: 2000 }];
    const result = calcTotals(baseSalary, earnings, deductions);
    expect(result.grossPay).toBe(1000);
    expect(result.totalDeductions).toBe(2100); // tax 100 + pension 80 + 2000
    expect(result.netPay).toBe(-1100);
  });

  it('rounds all values to 2 decimals', () => {
    const baseSalary = 50000.123;
    const earnings: Earning[] = [{ type: 'bonus', amount: 5000.456 }];
    const deductions: Deduction[] = [{ type: 'loan', amount: 1000.789 }];
    const result = calcTotals(baseSalary, earnings, deductions);
    expect(result.grossPay).toBe(55000.58); // 50000.123 + 5000.456 = 55000.579 -> 55000.58
    expect(result.totalDeductions).toBe(9500.86); // tax 5500.06 + pension 4000.01 + 1000.79 = 9500.86
    expect(result.netPay).toBe(45499.72); // 55000.58 - 9500.86 = 45499.72
  });
});

describe('generatePayslipsForRun', () => {
  const employees: Employee[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      department: 'Engineering',
      role: 'Developer',
      hireDate: '2023-01-01',
      baseSalary: 50000,
      status: 'Active',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '098-765-4321',
      department: 'HR',
      role: 'Manager',
      hireDate: '2023-02-01',
      baseSalary: 60000,
      status: 'Active',
    },
  ];

  it('generates payslips for multiple employees', () => {
    const payrollRunId = 'run-1';
    const payslips = generatePayslipsForRun(payrollRunId, employees);
    expect(payslips).toHaveLength(2);
    expect(payslips[0].id).toBe('payslip-run-1-1');
    expect(payslips[0].grossPay).toBe(50000);
    expect(payslips[0].totalDeductions).toBe(9000);
    expect(payslips[0].netPay).toBe(41000);
    expect(payslips[1].id).toBe('payslip-run-1-2');
    expect(payslips[1].grossPay).toBe(60000);
    expect(payslips[1].totalDeductions).toBe(10800); // tax 6000 + pension 4800
    expect(payslips[1].netPay).toBe(49200);
  });

  it('includes earnings and deductions', () => {
    const payrollRunId = 'run-2';
    const existingEarnings: Record<string, Earning[]> = {
      '1': [{ type: 'bonus', amount: 5000 }],
    };
    const existingDeductions: Record<string, Deduction[]> = {
      '1': [{ type: 'loan', amount: 1000 }],
    };
    const payslips = generatePayslipsForRun(payrollRunId, employees, existingEarnings, existingDeductions);
    expect(payslips[0].earnings).toEqual([{ type: 'bonus', amount: 5000 }]);
    expect(payslips[0].deductions).toEqual([{ type: 'loan', amount: 1000 }]);
    expect(payslips[0].grossPay).toBe(55000);
    expect(payslips[0].totalDeductions).toBe(9500);
    expect(payslips[0].netPay).toBe(45500);
    expect(payslips[1].earnings).toEqual([]);
    expect(payslips[1].deductions).toEqual([]);
  });
});

describe('formatCurrency', () => {
  it('formats amounts as USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(-100)).toBe('-$100.00');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });
});

describe('formatDate', () => {
  it('formats dates in short format', () => {
    expect(formatDate('2023-01-15')).toBe('Jan 15, 2023');
    expect(formatDate('2026-02-03')).toBe('Feb 3, 2026');
  });
});
  });

  it('handles large numbers', () => {
    const baseSalary = 1000000;
    const earnings: Earning[] = [
      { type: 'bonus', amount: 500000 },
    ];
    expect(calcGross(baseSalary, earnings)).toBe(1500000);
  });

  it('handles zero base salary', () => {
    const baseSalary = 0;
    const earnings: Earning[] = [
      { type: 'bonus', amount: 1000 },
    ];
    expect(calcGross(baseSalary, earnings)).toBe(1000);
  });
});

describe('calcTax', () => {
  it('calculates 10% tax and rounds to 2 decimals', () => {
    expect(calcTax(50000)).toBe(5000);
    expect(calcTax(50000.5)).toBe(5000.05);
    expect(calcTax(50000.123)).toBe(5000.01); // rounds down
    expect(calcTax(50000.125)).toBe(5000.13); // rounds up
  });

  it('handles zero gross pay', () => {
    expect(calcTax(0)).toBe(0);
  });

  it('handles large gross pay', () => {
    expect(calcTax(1000000)).toBe(100000);
  });
});

describe('calcPension', () => {
  it('calculates 8% pension on base salary and rounds to 2 decimals', () => {
    expect(calcPension(50000)).toBe(4000);
    expect(calcPension(50000.5)).toBe(4000.04);
    expect(calcPension(50000.123)).toBe(4000.01);
    expect(calcPension(50000.125)).toBe(4000.01);
  });

  it('handles zero base salary', () => {
    expect(calcPension(0)).toBe(0);
  });

  it('handles large base salary', () => {
    expect(calcPension(1000000)).toBe(80000);
  });
});

describe('calcTotals', () => {
  it('calculates totals correctly', () => {
    const baseSalary = 50000;
    const earnings: Earning[] = [{ type: 'bonus', amount: 5000 }];
    const deductions: Deduction[] = [{ type: 'loan', amount: 1000 }];
    const result = calcTotals(baseSalary, earnings, deductions);
    expect(result.grossPay).toBe(55000);
    expect(result.totalDeductions).toBe(9500); // tax 5500 + pension 4000 + deductions 1000
    expect(result.netPay).toBe(45500);
  });

  it('handles zero earnings and deductions', () => {
    const baseSalary = 50000;
    const earnings: Earning[] = [];
    const deductions: Deduction[] = [];
    const result = calcTotals(baseSalary, earnings, deductions);
    expect(result.grossPay).toBe(50000);
    expect(result.totalDeductions).toBe(9000); // tax 5000 + pension 4000
    expect(result.netPay).toBe(41000);
  });

  it('handles large deductions exceeding gross pay', () => {
    const baseSalary = 1000;
    const earnings: Earning[] = [];
    const deductions: Deduction[] = [{ type: 'large', amount: 2000 }];
    const result = calcTotals(baseSalary, earnings, deductions);
    expect(result.grossPay).toBe(1000);
    expect(result.totalDeductions).toBe(2100); // tax 100 + pension 80 + 2000
    expect(result.netPay).toBe(-1100);
  });

  it('rounds all values to 2 decimals', () => {
    const baseSalary = 50000.123;
    const earnings: Earning[] = [{ type: 'bonus', amount: 5000.456 }];
    const deductions: Deduction[] = [{ type: 'loan', amount: 1000.789 }];
    const result = calcTotals(baseSalary, earnings, deductions);
    expect(result.grossPay).toBe(55000.58); // 50000.123 + 5000.456 = 55000.579 -> 55000.58
    expect(result.totalDeductions).toBe(9500.86); // tax 5500.06 + pension 4000.01 + 1000.79 = 9500.86
    expect(result.netPay).toBe(45499.72); // 55000.58 - 9500.86 = 45499.72
  });
});

describe('generatePayslipsForRun', () => {
  const employees: Employee[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      department: 'Engineering',
      role: 'Developer',
      hireDate: '2023-01-01',
      baseSalary: 50000,
      status: 'Active',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '098-765-4321',
      department: 'HR',
      role: 'Manager',
      hireDate: '2023-02-01',
      baseSalary: 60000,
      status: 'Active',
    },
  ];

  it('generates payslips for multiple employees', () => {
    const payrollRunId = 'run-1';
    const payslips = generatePayslipsForRun(payrollRunId, employees);
    expect(payslips).toHaveLength(2);
    expect(payslips[0].id).toBe('payslip-run-1-1');
    expect(payslips[0].grossPay).toBe(50000);
    expect(payslips[0].totalDeductions).toBe(9000);
    expect(payslips[0].netPay).toBe(41000);
    expect(payslips[1].id).toBe('payslip-run-1-2');
    expect(payslips[1].grossPay).toBe(60000);
    expect(payslips[1].totalDeductions).toBe(10800); // tax 6000 + pension 4800
    expect(payslips[1].netPay).toBe(49200);
  });

  it('includes earnings and deductions', () => {
    const payrollRunId = 'run-2';
    const existingEarnings: Record<string, Earning[]> = {
      '1': [{ type: 'bonus', amount: 5000 }],
    };
    const existingDeductions: Record<string, Deduction[]> = {
      '1': [{ type: 'loan', amount: 1000 }],
    };
    const payslips = generatePayslipsForRun(payrollRunId, employees, existingEarnings, existingDeductions);
    expect(payslips[0].earnings).toEqual([{ type: 'bonus', amount: 5000 }]);
    expect(payslips[0].deductions).toEqual([{ type: 'loan', amount: 1000 }]);
    expect(payslips[0].grossPay).toBe(55000);
    expect(payslips[0].totalDeductions).toBe(9500);
    expect(payslips[0].netPay).toBe(45500);
    expect(payslips[1].earnings).toEqual([]);
    expect(payslips[1].deductions).toEqual([]);
  });
});

describe('formatCurrency', () => {
  it('formats amounts as USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(-100)).toBe('-$100.00');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });
});

describe('formatDate', () => {
  it('formats dates in short format', () => {
    expect(formatDate('2023-01-15')).toBe('Jan 15, 2023');
    expect(formatDate('2026-02-03')).toBe('Feb 3, 2026');
  });
});
  });

  it('handles large numbers', () => {
    const baseSalary = 1000000;
    const earnings: Earning[] = [
      { type: 'bonus', amount: 500000 },
    ];
    expect(calcGross(baseSalary, earnings)).toBe(1500000);
  });

  it('handles zero base salary', () => {
    const baseSalary = 0;
    const earnings: Earning[] = [
      { type: 'bonus', amount: 1000 },
    ];
    expect(calcGross(baseSalary, earnings)).toBe(1000);
  });
});

describe('calcTax', () => {
  it('calculates 10% tax and rounds to 2 decimals', () => {
    expect(calcTax(50000)).toBe(5000);
    expect(calcTax(50000.5)).toBe(5000.05);
    expect(calcTax(50000.123)).toBe(5000.01); // rounds down
    expect(calcTax(50000.125)).toBe(5000.13); // rounds up
  });

  it('handles zero gross pay', () => {
    expect(calcTax(0)).toBe(0);
  });

  it('handles large gross pay', () => {
    expect(calcTax(1000000)).toBe(100000);
  });
});

describe('calcPension', () => {
  it('calculates 8% pension on base salary and rounds to 2 decimals', () => {
    expect(calcPension(50000)).toBe(4000);
    expect(calcPension(50000.5)).toBe(4000.04);
    expect(calcPension(50000.123)).toBe(4000.01);
    expect(calcPension(50000.125)).toBe(4000.01);
  });

  it('handles zero base salary', () => {
    expect(calcPension(0)).toBe(0);
  });

  it('handles large base salary', () => {
    expect(calcPension(1000000)).toBe(80000);
  });
});

describe('calcTotals', () => {
  it('calculates totals correctly', () => {
    const baseSalary = 50000;
    const earnings: Earning[] = [{ type: 'bonus', amount: 5000 }];
    const deductions: Deduction[] = [{ type: 'loan', amount: 1000 }];
    const result = calcTotals(baseSalary, earnings, deductions);
    expect(result.grossPay).toBe(55000);
    expect(result.totalDeductions).toBe(9500); // tax 5500 + pension 4000 + deductions 1000
    expect(result.netPay).toBe(45500);
  });

  it('handles zero earnings and deductions', () => {
    const baseSalary = 50000;
    const earnings: Earning[] = [];
    const deductions: Deduction[] = [];
    const result = calcTotals(baseSalary, earnings, deductions);
    expect(result.grossPay).toBe(50000);
    expect(result.totalDeductions).toBe(9000); // tax 5000 + pension 4000
    expect(result.netPay).toBe(41000);
  });

  it('handles large deductions exceeding gross pay', () => {
    const baseSalary = 1000;
    const earnings: Earning[] = [];
    const deductions: Deduction[] = [{ type: 'large', amount: 2000 }];
    const result = calcTotals(baseSalary, earnings, deductions);
    expect(result.grossPay).toBe(1000);
    expect(result.totalDeductions).toBe(2100); // tax 100 + pension 80 + 2000
    expect(result.netPay).toBe(-1100);
  });

  it('rounds all values to 2 decimals', () => {
    const baseSalary = 50000.123;
    const earnings: Earning[] = [{ type: 'bonus', amount: 5000.456 }];
    const deductions: Deduction[] = [{ type: 'loan', amount: 1000.789 }];
    const result = calcTotals(baseSalary, earnings, deductions);
    expect(result.grossPay).toBe(55000.58); // 50000.123 + 5000.456 = 55000.579 -> 55000.58
    expect(result.totalDeductions).toBe(9500.58); // tax 5500.06 + pension 4000.01 + 1000.79 = 9500.86 -> wait, let's calculate properly
    // Actually, tax on 55000.58 = 5500.06, pension on 50000.123 = 4000.01, deductions 1000.79, total 9500.86, rounded to 9500.86
    // But in code, it's Math.round(totalDeductions * 100) / 100
    // 9500.86 * 100 = 950086, round to 950086, /100 = 9500.86
    expect(result.totalDeductions).toBe(9500.86);
    expect(result.netPay).toBe(45499.72); // 55000.58 - 9500.86 = 45499.72
  });
});

describe('generatePayslipsForRun', () => {
  const employees: Employee[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      department: 'Engineering',
      role: 'Developer',
      hireDate: '2023-01-01',
      baseSalary: 50000,
      status: 'Active',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '098-765-4321',
      department: 'HR',
      role: 'Manager',
      hireDate: '2023-02-01',
      baseSalary: 60000,
      status: 'Active',
    },
  ];

  it('generates payslips for multiple employees', () => {
    const payrollRunId = 'run-1';
    const payslips = generatePayslipsForRun(payrollRunId, employees);
    expect(payslips).toHaveLength(2);
    expect(payslips[0].id).toBe('payslip-run-1-1');
    expect(payslips[0].grossPay).toBe(50000);
    expect(payslips[0].totalDeductions).toBe(9000);
    expect(payslips[0].netPay).toBe(41000);
    expect(payslips[1].id).toBe('payslip-run-1-2');
    expect(payslips[1].grossPay).toBe(60000);
    expect(payslips[1].totalDeductions).toBe(10800); // tax 6000 + pension 4800
    expect(payslips[1].netPay).toBe(49200);
  });

  it('includes earnings and deductions', () => {
    const payrollRunId = 'run-2';
    const existingEarnings: Record<string, Earning[]> = {
      '1': [{ type: 'bonus', amount: 5000 }],
    };
    const existingDeductions: Record<string, Deduction[]> = {
      '1': [{ type: 'loan', amount: 1000 }],
    };
    const payslips = generatePayslipsForRun(payrollRunId, employees, existingEarnings, existingDeductions);
    expect(payslips[0].earnings).toEqual([{ type: 'bonus', amount: 5000 }]);
    expect(payslips[0].deductions).toEqual([{ type: 'loan', amount: 1000 }]);
    expect(payslips[0].grossPay).toBe(55000);
    expect(payslips[0].totalDeductions).toBe(9500);
    expect(payslips[0].netPay).toBe(45500);
    expect(payslips[1].earnings).toEqual([]);
    expect(payslips[1].deductions).toEqual([]);
  });
});

describe('formatCurrency', () => {
  it('formats amounts as USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(-100)).toBe('-$100.00');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });
});

describe('formatDate', () => {
  it('formats dates in short format', () => {
    expect(formatDate('2023-01-15')).toBe('Jan 15, 2023');
    expect(formatDate('2026-02-03')).toBe('Feb 3, 2026');
  });
});