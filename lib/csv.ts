import { Employee, Payslip } from './types';
import { store } from './store';
import { formatCurrency } from './payroll';

export function exportEmployeesCSV(employees: Employee[]): string {
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Department',
    'Role',
    'Hire Date',
    'Base Salary',
    'Status',
    'Bank Name',
    'Account No'
  ];

  const rows = employees.map(emp => [
    `${emp.firstName} ${emp.lastName}`,
    emp.email,
    emp.phone,
    emp.department,
    emp.role,
    emp.hireDate,
    emp.baseSalary.toString(),
    emp.status,
    emp.bankName || '',
    emp.bankAccountNo || ''
  ]);

  return [headers, ...rows].map(row => 
    row.map(field => `"${field}"`).join(',')
  ).join('\n');
}

export function exportPayslipsCSV(payslips: Payslip[]): string {
  const state = store.getState();
  
  const headers = [
    'Employee',
    'Base Salary',
    'Earnings Total',
    'Gross Pay',
    'Tax',
    'Pension',
    'Other Deductions',
    'Total Deductions',
    'Net Pay'
  ];

  const rows = payslips.map(slip => {
    const employee = state.employees.find(emp => emp.id === slip.employeeId);
    const earningsTotal = slip.earnings.reduce((sum, earning) => sum + earning.amount, 0);
    const tax = slip.grossPay * 0.1;
    const pension = employee ? employee.baseSalary * 0.08 : 0;
    const otherDeductions = slip.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);

    return [
      employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
      employee ? employee.baseSalary.toString() : '0',
      earningsTotal.toString(),
      slip.grossPay.toString(),
      tax.toFixed(2),
      pension.toFixed(2),
      otherDeductions.toString(),
      slip.totalDeductions.toString(),
      slip.netPay.toString()
    ];
  });

  return [headers, ...rows].map(row => 
    row.map(field => `"${field}"`).join(',')
  ).join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}