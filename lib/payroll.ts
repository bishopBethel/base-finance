import { Employee, Payslip, Earning, Deduction } from './types';

export function calcGross(baseSalary: number, earnings: Earning[]): number {
  const earningsTotal = earnings.reduce((sum, earning) => sum + earning.amount, 0);
  return baseSalary + earningsTotal;
}

export function calcTax(grossPay: number): number {
  return Math.round(grossPay * 0.1 * 100) / 100; // 10% flat tax
}

export function calcPension(baseSalary: number): number {
  return Math.round(baseSalary * 0.08 * 100) / 100; // 8% of base salary
}

export function calcTotals(
  baseSalary: number,
  earnings: Earning[],
  deductions: Deduction[]
): {
  grossPay: number;
  totalDeductions: number;
  netPay: number;
} {
  const grossPay = calcGross(baseSalary, earnings);
  const tax = calcTax(grossPay);
  const pension = calcPension(baseSalary);
  const otherDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
  
  const totalDeductions = tax + pension + otherDeductions;
  const netPay = grossPay - totalDeductions;

  return {
    grossPay: Math.round(grossPay * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100,
  };
}

export function generatePayslipsForRun(
  payrollRunId: string,
  employees: Employee[],
  existingEarnings: Record<string, Earning[]> = {},
  existingDeductions: Record<string, Deduction[]> = {}
): Payslip[] {
  return employees.map(employee => {
    const earnings = existingEarnings[employee.id] || [];
    const deductions = existingDeductions[employee.id] || [];
    
    const totals = calcTotals(employee.baseSalary, earnings, deductions);

    return {
      id: `payslip-${payrollRunId}-${employee.id}`,
      payrollRunId,
      employeeId: employee.id,
      earnings,
      deductions,
      ...totals,
    };
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}