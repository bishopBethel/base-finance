export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  hireDate: string;
  baseSalary: number;
  status: 'Active' | 'Inactive';
  bankName?: string;
  bankAccountNo?: string;
}

export interface PayrollRun {
  id: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  status: 'Draft' | 'Processed';
  notes?: string;
  employeeIds: string[];
}

export interface Earning {
  type: string;
  amount: number;
}

export interface Deduction {
  type: string;
  amount: number;
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  earnings: Earning[];
  deductions: Deduction[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
}

export interface Department {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface EarningType {
  id: string;
  name: string;
}

export interface DeductionType {
  id: string;
  name: string;
}

export interface AppState {
  employees: Employee[];
  payrollRuns: PayrollRun[];
  payslips: Payslip[];
  departments: Department[];
  roles: Role[];
  earningTypes: EarningType[];
  deductionTypes: DeductionType[];
  useLocalStorage: boolean;
}