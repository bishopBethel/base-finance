import { AppState, Employee, PayrollRun, Payslip, Department, Role, EarningType, DeductionType } from './types';

// Simple deterministic RNG (mulberry32)
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]) {
  return arr[Math.floor(rng() * arr.length)];
}

function moneyRound(n: number) {
  return Math.round(n);
}

export function createSeed(seed = 12345): AppState {
  const rng = mulberry32(seed);

  const departments: Department[] = [
    { id: 'dept-1', name: 'Engineering' },
    { id: 'dept-2', name: 'Operations' },
    { id: 'dept-3', name: 'HR' },
    { id: 'dept-4', name: 'Finance' },
  ];

  const roles: Role[] = [
    { id: 'role-1', name: 'Junior Developer' },
    { id: 'role-2', name: 'Senior Developer' },
    { id: 'role-3', name: 'Tech Lead' },
    { id: 'role-4', name: 'DevOps Engineer' },
    { id: 'role-5', name: 'Operations Coordinator' },
    { id: 'role-6', name: 'Operations Manager' },
    { id: 'role-7', name: 'HR Specialist' },
    { id: 'role-8', name: 'HR Manager' },
    { id: 'role-9', name: 'Financial Analyst' },
    { id: 'role-10', name: 'Finance Manager' },
  ];

  const earningTypes: EarningType[] = [
    { id: 'earning-1', name: 'Base Salary' },
    { id: 'earning-2', name: 'Overtime' },
    { id: 'earning-3', name: 'Allowance' },
    { id: 'earning-4', name: 'Bonus' },
    { id: 'earning-5', name: 'Holiday Bonus' },
    { id: 'earning-6', name: 'Commission' },
  ];

  const deductionTypes: DeductionType[] = [
    { id: 'deduction-1', name: 'Tax' },
    { id: 'deduction-2', name: 'Pension' },
    { id: 'deduction-3', name: 'Health Insurance' },
    { id: 'deduction-4', name: 'Loan Repayment' },
    { id: 'deduction-5', name: 'Union Dues' },
    { id: 'deduction-6', name: 'Parking' },
  ];

  const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Amanda', 'Chris', 'Jessica', 'Carlos', 'Priya', 'Noah', 'Zoe'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Martinez', 'Taylor', 'Anderson', 'Thomas', 'Garcia', 'Lee', 'Singh', 'Nguyen', 'Patel'];

  const employees: Employee[] = [];
  const count = 12; // 10-15 desired
  for (let i = 1; i <= count; i++) {
    const first = pick(rng, firstNames);
    const last = pick(rng, lastNames);
    const dept = pick(rng, departments).name;
    const role = pick(rng, roles).name;
    const hireYear = 2018 + Math.floor(rng() * 7); // 2018-2024
    const hireMonth = 1 + Math.floor(rng() * 12);
    const hireDay = 1 + Math.floor(rng() * 28);
    const baseSalary = moneyRound(50000 + rng() * 70000);
    const status = rng() > 0.15 ? 'Active' : 'Inactive';

    employees.push({
      id: `emp-${i}`,
      firstName: first,
      lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@company.com`,
      phone: `+1-555-${1000 + i}`,
      department: dept,
      role,
      hireDate: `${hireYear}-${String(hireMonth).padStart(2, '0')}-${String(hireDay).padStart(2, '0')}`,
      baseSalary,
      status: status as 'Active' | 'Inactive',
      bankName: pick(rng, ['First National Bank', 'City Bank', 'Trust Bank', 'Community Bank', 'Metro Bank', 'Regional Bank']),
      bankAccountNo: `****${Math.floor(rng() * 9000 + 1000)}`,
    });
  }

  // Create 3 payroll runs (2 processed historical, 1 draft)
  const payrollRuns: PayrollRun[] = [
    {
      id: 'run-1',
      periodStart: '2024-11-01',
      periodEnd: '2024-11-30',
      payDate: '2024-12-05',
      status: 'Processed',
      employeeIds: employees.filter(e => e.status === 'Active').slice(0, 10).map(e => e.id),
      notes: 'November 2024 payroll',
    },
    {
      id: 'run-2',
      periodStart: '2024-12-01',
      periodEnd: '2024-12-31',
      payDate: '2025-01-05',
      status: 'Processed',
      employeeIds: employees.filter(e => e.status === 'Active').slice(0, 10).map(e => e.id),
      notes: 'December 2024 payroll with holiday bonuses',
    },
    {
      id: 'run-3',
      periodStart: '2025-01-01',
      periodEnd: '2025-01-31',
      payDate: '2025-02-05',
      status: 'Draft',
      employeeIds: employees.filter(e => e.status === 'Active').slice(0, 10).map(e => e.id),
      notes: 'January 2025 payroll - draft',
    },
  ];

  // Generate payslips for processed runs
  const payslips: Payslip[] = [];
  for (const run of payrollRuns.filter(r => r.status === 'Processed')) {
    for (const empId of run.employeeIds) {
      const emp = employees.find(e => e.id === empId)!;
      const bonus = rng() > 0.8 ? moneyRound(1000 + rng() * 3000) : 0;
      const overtime = rng() > 0.7 ? moneyRound(100 + rng() * 1000) : 0;
      const gross = moneyRound(emp.baseSalary / 12 + bonus + overtime);
      const tax = moneyRound(gross * (0.15 + rng() * 0.05));
      const deductions = tax + 200; // health/pension
      const net = gross - deductions;

      const earnings = [] as { type: string; amount: number }[];
      earnings.push({ type: 'Base Salary', amount: moneyRound(emp.baseSalary / 12) });
      if (bonus) earnings.push({ type: 'Holiday Bonus', amount: bonus });
      if (overtime) earnings.push({ type: 'Overtime', amount: overtime });

      const deductionList = [
        { type: 'Tax', amount: tax },
        { type: 'Health Insurance', amount: 200 },
      ];

      payslips.push({
        id: `payslip-${run.id}-${emp.id}`,
        payrollRunId: run.id,
        employeeId: emp.id,
        earnings,
        deductions: deductionList,
        grossPay: gross,
        totalDeductions: deductions,
        netPay: net,
      });
    }
  }

  const state: AppState = {
    employees,
    payrollRuns,
    payslips,
    departments,
    roles,
    earningTypes,
    deductionTypes,
    useLocalStorage: true,
  };

  return state;
}

// Default deterministic seed export
export const seedData = createSeed();