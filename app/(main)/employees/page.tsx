'use client';

import { useState, useRef, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableRef } from '@/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useStore } from '@/hooks/use-store';
import { Employee } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/payroll';
import { exportEmployeesCSV, downloadCSV } from '@/lib/csv';
import { useToast } from '@/hooks/use-toast';
import { Plus, MoreHorizontal, Edit, Trash2, Download, Eye } from 'lucide-react';
import { EmployeeDialog } from '@/components/employees/employee-dialog';
import { EmployeeViewDialog } from '@/components/employees/employee-view-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function EmployeesPage() {
  const { state, actions } = useStore();
  const { toast } = useToast();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const tableRef = useRef<DataTableRef<Employee>>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [employeeToToggle, setEmployeeToToggle] = useState<Employee | null>(null);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.table.getColumn('department')?.setFilterValue(departmentFilter || undefined);
    }
  }, [departmentFilter]);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.table.getColumn('status')?.setFilterValue(statusFilter || undefined);
    }
  }, [statusFilter]);

  const filters = (
    <div className="flex items-center space-x-2 py-4">
      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Departments</SelectItem>
          {state.departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.name}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const handleExportCSV = () => {
    const csv = exportEmployeesCSV(state.employees);
    downloadCSV(csv, `employees-${new Date().toISOString().split('T')[0]}.csv`);
    toast({
      title: 'Export successful',
      description: 'Employee data has been exported to CSV.',
    });
  };

  const handleToggleStatus = (employee: Employee) => {
    setEmployeeToToggle(employee);
  };

  const confirmToggleStatus = () => {
    if (employeeToToggle) {
      const newStatus = employeeToToggle.status === 'Active' ? 'Inactive' : 'Active';
      actions.updateEmployee(employeeToToggle.id, { status: newStatus });
      toast({
        title: `Employee ${newStatus.toLowerCase()}`,
        description: `${employeeToToggle.firstName} ${employeeToToggle.lastName} has been marked as ${newStatus.toLowerCase()}.`,
      });
      setEmployeeToToggle(null);
    }
  };

  const handleDeleteEmployee = (employee: Employee) => {
    if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      actions.deleteEmployee(employee.id);
      toast({
        title: 'Employee deleted',
        description: `${employee.firstName} ${employee.lastName} has been removed.`,
      });
    }
  };

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
    },
    {
      accessorKey: 'role',
      header: 'Role',
    },
    {
      accessorKey: 'baseSalary',
      header: 'Base Salary',
      cell: ({ row }) => formatCurrency(row.original.baseSalary),
    },
    {
      accessorKey: 'hireDate',
      header: 'Hire Date',
      cell: ({ row }) => formatDate(row.original.hireDate),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'Active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewingEmployee(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingEmployee(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(row.original)}>
              {row.original.status === 'Active' ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteEmployee(row.original)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">
            Manage your company employees and their information.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>
            A complete list of all employees with their details and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            ref={tableRef}
            columns={columns}
            data={state.employees}
            searchKey="name"
            searchPlaceholder="Search employees..."
            filters={filters}
          />
        </CardContent>
      </Card>

      <EmployeeDialog
        employee={null}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={(employee) => {
          actions.addEmployee(employee);
          setIsAddDialogOpen(false);
          toast({
            title: 'Employee added',
            description: `${employee.firstName} ${employee.lastName} has been added successfully.`,
          });
        }}
      />

      {editingEmployee && (
        <EmployeeDialog
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
          onSave={(updatedEmployee) => {
            actions.updateEmployee(editingEmployee.id, updatedEmployee);
            setEditingEmployee(null);
            toast({
              title: 'Employee updated',
              description: `${updatedEmployee.firstName} ${updatedEmployee.lastName} has been updated successfully.`,
            });
          }}
        />
      )}

      {viewingEmployee && (
        <EmployeeViewDialog
          employee={viewingEmployee}
          open={!!viewingEmployee}
          onOpenChange={(open) => !open && setViewingEmployee(null)}
        />
      )}

      <AlertDialog open={!!employeeToToggle} onOpenChange={(open) => !open && setEmployeeToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {employeeToToggle?.status === 'Active' ? 'deactivate' : 'activate'} {employeeToToggle?.firstName} {employeeToToggle?.lastName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus}>
              {employeeToToggle?.status === 'Active' ? 'Deactivate' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}