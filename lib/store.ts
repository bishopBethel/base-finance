import { AppState, Employee, PayrollRun, Payslip } from './types';
import { seedData, createSeed } from './seed';

class Store {
  private state: AppState;
  private listeners: (() => void)[] = [];

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AppState {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('payroll-app-state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { ...seedData, ...parsed };
        } catch (error) {
          console.error('Failed to parse saved state:', error);
        }
      }
    }
    // No saved state found — return deterministic seed
    return createSeed();
  }

  private saveState() {
    if (this.state.useLocalStorage && typeof window !== 'undefined') {
      localStorage.setItem('payroll-app-state', JSON.stringify(this.state));
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): AppState {
    return { ...this.state };
  }

  // Employee operations
  addEmployee(employee: Omit<Employee, 'id'>): Employee {
    const newEmployee: Employee = {
      ...employee,
      id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    this.state.employees.push(newEmployee);
    this.saveState();
    this.notify();
    return newEmployee;
  }

  updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const index = this.state.employees.findIndex(emp => emp.id === id);
    if (index === -1) return null;
    
    this.state.employees[index] = { ...this.state.employees[index], ...updates };
    this.saveState();
    this.notify();
    return this.state.employees[index];
  }

  deleteEmployee(id: string): boolean {
    const initialLength = this.state.employees.length;
    this.state.employees = this.state.employees.filter(emp => emp.id !== id);
    if (this.state.employees.length < initialLength) {
      this.saveState();
      this.notify();
      return true;
    }
    return false;
  }

  // Payroll Run operations
  addPayrollRun(run: Omit<PayrollRun, 'id'>): PayrollRun {
    const newRun: PayrollRun = {
      ...run,
      id: `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    this.state.payrollRuns.push(newRun);
    this.saveState();
    this.notify();
    return newRun;
  }

  updatePayrollRun(id: string, updates: Partial<PayrollRun>): PayrollRun | null {
    const index = this.state.payrollRuns.findIndex(run => run.id === id);
    if (index === -1) return null;
    
    this.state.payrollRuns[index] = { ...this.state.payrollRuns[index], ...updates };
    this.saveState();
    this.notify();
    return this.state.payrollRuns[index];
  }

  deletePayrollRun(id: string): boolean {
    const initialLength = this.state.payrollRuns.length;
    this.state.payrollRuns = this.state.payrollRuns.filter(run => run.id !== id);
    this.state.payslips = this.state.payslips.filter(slip => slip.payrollRunId !== id);
    
    if (this.state.payrollRuns.length < initialLength) {
      this.saveState();
      this.notify();
      return true;
    }
    return false;
  }

  // Payslip operations
  addPayslips(payslips: Payslip[]): void {
    this.state.payslips = this.state.payslips.filter(
      slip => !payslips.some(newSlip => newSlip.id === slip.id)
    );
    this.state.payslips.push(...payslips);
    this.saveState();
    this.notify();
  }

  updatePayslip(id: string, updates: Partial<Payslip>): Payslip | null {
    const index = this.state.payslips.findIndex(slip => slip.id === id);
    if (index === -1) return null;
    
    this.state.payslips[index] = { ...this.state.payslips[index], ...updates };
    this.saveState();
    this.notify();
    return this.state.payslips[index];
  }

  // Settings
  toggleLocalStorage(): void {
    this.state.useLocalStorage = !this.state.useLocalStorage;
    if (this.state.useLocalStorage) {
      this.saveState();
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('payroll-app-state');
    }
    this.notify();
  }

  // Reset the store to deterministic seed. Optionally pass an integer seed for different deterministic data.
  resetToSeed(seed?: number): void {
    const newState = typeof seed === 'number' ? createSeed(seed) : createSeed();
    this.state = newState;
    if (this.state.useLocalStorage && typeof window !== 'undefined') {
      localStorage.setItem('payroll-app-state', JSON.stringify(this.state));
    }
    this.notify();
  }
}

export const store = new Store();