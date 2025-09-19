'use client';

import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Employee } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/payroll';

interface EmployeeViewDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeViewDialog({ employee, open, onOpenChange }: EmployeeViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogDescription>
            Complete information for {employee.firstName} {employee.lastName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{employee.email}</p>
            </div>
            <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
              {employee.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
              <p>{employee.phone}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Department</h4>
              <p>{employee.department}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Role</h4>
              <p>{employee.role}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Hire Date</h4>
              <p>{formatDate(employee.hireDate)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Base Salary</h4>
              <p className="text-lg font-semibold">{formatCurrency(employee.baseSalary)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
              <p>{employee.status}</p>
            </div>
          </div>
          
          {(employee.bankName || employee.bankAccountNo) && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Banking Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground">Bank Name</h5>
                  <p>{employee.bankName || 'Not provided'}</p>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground">Account Number</h5>
                  <p>{employee.bankAccountNo || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}