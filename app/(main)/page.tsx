'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Calendar, FileText } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { formatCurrency, formatDate } from '@/lib/payroll';

export default function DashboardPage() {
  const { state } = useStore();

  const activeEmployees = state.employees.filter(emp => emp.status === 'Active');
  const draftRuns = state.payrollRuns.filter(run => run.status === 'Draft');
  const lastProcessedRun = state.payrollRuns
    .filter(run => run.status === 'Processed')
    .sort((a, b) => new Date(b.payDate).getTime() - new Date(a.payDate).getTime())[0];

  const lastRunTotal = lastProcessedRun ? 
    state.payslips
      .filter(slip => slip.payrollRunId === lastProcessedRun.id)
      .reduce((sum, slip) => sum + slip.netPay, 0) : 0;

  const nextPayDate = state.payrollRuns
    .filter(run => new Date(run.payDate) > new Date())
    .sort((a, b) => new Date(a.payDate).getTime() - new Date(b.payDate).getTime())[0]?.payDate;

  const recentActivity = [
    ...state.payrollRuns.slice(-3).map(run => ({
      id: run.id,
      type: 'payroll',
      title: `Payroll Run ${run.status}`,
      description: `Period: ${formatDate(run.periodStart)} - ${formatDate(run.periodEnd)}`,
      date: run.payDate,
      status: run.status,
    })),
    ...state.employees.slice(-2).map(emp => ({
      id: emp.id,
      type: 'employee',
      title: 'Employee Added',
      description: `${emp.firstName} ${emp.lastName} joined ${emp.department}`,
      date: emp.hireDate,
      status: emp.status,
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your payroll system and recent activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees.length}</div>
            <p className="text-xs text-muted-foreground">
              {state.employees.length - activeEmployees.length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Run Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(lastRunTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {lastProcessedRun ? formatDate(lastProcessedRun.payDate) : 'No processed runs'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Pay Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nextPayDate ? formatDate(nextPayDate) : 'Not scheduled'}
            </div>
            <p className="text-xs text-muted-foreground">
              Upcoming payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Runs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftRuns.length}</div>
            <p className="text-xs text-muted-foreground">
              Pending processing
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest changes and updates in your payroll system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={activity.status === 'Active' || activity.status === 'Processed' ? 'default' : 'secondary'}
                  >
                    {activity.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.date)}
                  </span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No recent activity to display.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}