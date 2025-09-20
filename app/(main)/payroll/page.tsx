"use client";

import React, { useMemo, useState } from 'react';
import { useStore } from '@/hooks/use-store';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formatCurrency, generatePayslipsForRun, calcTotals, formatDate } from '@/lib/payroll';
import { Earning, Deduction } from '@/lib/types';

export default function PayrollPage() {
  const { state, actions } = useStore();
  const employees = state.employees.filter(e => e.status === 'Active');
  const draftRuns = state.payrollRuns.filter(r => r.status === 'Draft');
  const processedRuns = state.payrollRuns.filter(r => r.status === 'Processed');

  // Local builder state for creating/editing a draft
  const [editingRunId, setEditingRunId] = useState<string | null>(null);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [payDate, setPayDate] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // adjustments per employee while drafting
  const [adjustments, setAdjustments] = useState<Record<string,{earnings:Earning[];deductions:Deduction[]}>>({});

  // Dialog state
  const [openEditorFor, setOpenEditorFor] = useState<string | null>(null);

  // Validation
  const validDates = useMemo(() => {
    if (!periodStart || !periodEnd || !payDate) return false;
    const ps = new Date(periodStart);
    const pe = new Date(periodEnd);
    const pd = new Date(payDate);
    return ps <= pe && pd >= pe; // pay date on/after period end
  }, [periodStart, periodEnd, payDate]);

  const validSelection = selectedEmployeeIds.length > 0;

  const perEmployeeTotals = useMemo(() => {
    const map: Record<string, {gross:number;deductions:number;net:number}> = {};
    for (const id of selectedEmployeeIds) {
      const emp = state.employees.find(e => e.id === id)!;
      const adj = adjustments[id] || { earnings: [], deductions: [] };
      const totals = calcTotals(emp.baseSalary, adj.earnings, adj.deductions);
      map[id] = { gross: totals.grossPay, deductions: totals.totalDeductions, net: totals.netPay };
    }
    return map;
  }, [selectedEmployeeIds, adjustments, state.employees]);

  const grandTotal = useMemo(() => {
    return Object.values(perEmployeeTotals).reduce((s, v) => s + v.net, 0);
  }, [perEmployeeTotals]);

  function toggleEmployeeSelection(id: string) {
    setSelectedEmployeeIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  function bulkAddLineItem(type: 'earning' | 'deduction', label: string, amount: number) {
    for (const id of selectedEmployeeIds) {
      setAdjustments(prev => {
        const current = prev[id] || { earnings: [], deductions: [] };
        const copy = { ...prev };
        if (type === 'earning') {
          copy[id] = { ...current, earnings: [...current.earnings, { type: label, amount }] };
        } else {
          copy[id] = { ...current, deductions: [...current.deductions, { type: label, amount }] };
        }
        return copy;
      });
    }
  }

  function openEditor(id: string) {
    setOpenEditorFor(id);
  }

  function saveEmployeeAdjustments(id: string, earnings: Earning[], deductions: Deduction[]) {
    setAdjustments(prev => ({ ...prev, [id]: { earnings, deductions } }));
    setOpenEditorFor(null);
  }

  function processRun() {
    if (!validDates || !validSelection) return;

    const run = {
      periodStart,
      periodEnd,
      payDate,
      status: 'Processed' as const,
      notes,
      employeeIds: selectedEmployeeIds,
      adjustments,
    };

    // add run (store will generate id)
    const newRun = actions.addPayrollRun(run as any);

    // generate payslips using adjustments
    const employeesForRun = state.employees.filter(e => selectedEmployeeIds.includes(e.id));
    const payslips = generatePayslipsForRun(newRun.id, employeesForRun, Object.fromEntries(Object.entries(adjustments).map(([k,v])=>[k,v.earnings])), Object.fromEntries(Object.entries(adjustments).map(([k,v])=>[k,v.deductions])));

    actions.addPayslips(payslips as any);

    // reset local builder
    setPeriodStart(''); setPeriodEnd(''); setPayDate(''); setSelectedEmployeeIds([]); setAdjustments({}); setNotes('');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payroll</h1>

      <Tabs defaultValue="runs">
        <TabsList>
          <TabsTrigger value="runs">Runs</TabsTrigger>
          <TabsTrigger value="draft">Draft Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="runs">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Processed Runs</h2>
            <div className="grid gap-2">
              {processedRuns.length === 0 && <div className="text-sm text-muted-foreground">No processed runs</div>}
              {processedRuns.map(run => (
                <div key={run.id} className="p-3 border rounded">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{formatDate(run.payDate)}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(run.periodStart)} — {formatDate(run.periodEnd)}</div>
                      <div className="text-sm">Notes: {run.notes}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Employees: {run.employeeIds.length}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="draft">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Draft Builder</h2>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm">Period Start</label>
                <Input type="date" value={periodStart} onChange={e=>setPeriodStart(e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Period End</label>
                <Input type="date" value={periodEnd} onChange={e=>setPeriodEnd(e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Pay Date</label>
                <Input type="date" value={payDate} onChange={e=>setPayDate(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-sm">Notes</label>
              <Input value={notes} onChange={e=>setNotes(e.target.value)} />
            </div>

            <div>
              <h3 className="font-medium">Employees</h3>
              <div className="grid gap-2 max-h-72 overflow-auto">
                {employees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                      <div className="text-sm text-muted-foreground">{emp.department} — {formatCurrency(emp.baseSalary)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={selectedEmployeeIds.includes(emp.id)} onChange={()=>toggleEmployeeSelection(emp.id)} />
                      <Button size="sm" onClick={()=>openEditor(emp.id)} variant="ghost">Edit</Button>
                      <div className="text-sm">Net: {perEmployeeTotals[emp.id] ? formatCurrency(perEmployeeTotals[emp.id].net) : formatCurrency(emp.baseSalary - (emp.baseSalary*0.18))}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <h4 className="font-medium">Bulk add line item</h4>
                <BulkAddForm onAdd={bulkAddLineItem} />
              </div>

              <div>
                <h4 className="font-medium">Totals</h4>
                <div>Selected: {selectedEmployeeIds.length}</div>
                <div>Grand Net: {formatCurrency(grandTotal)}</div>
                <div className="text-sm text-muted-foreground">Date validation: {validDates ? 'OK' : 'Invalid'}</div>
              </div>

              <div className="flex flex-col justify-end items-end">
                <Button onClick={processRun} disabled={!validDates || !validSelection}>Process Run</Button>
              </div>
            </div>

          </div>
        </TabsContent>
      </Tabs>

      {/* Employee editor dialog */}
      {openEditorFor && (
        <EmployeeEditorDialog
          employee={state.employees.find(e=>e.id===openEditorFor)!}
          initial={adjustments[openEditorFor] || { earnings: [], deductions: [] }}
          onClose={() => setOpenEditorFor(null)}
          onSave={(earnings, deductions) => saveEmployeeAdjustments(openEditorFor, earnings, deductions)}
        />
      )}

    </div>
  );
}

function BulkAddForm({ onAdd }: { onAdd: (type: 'earning'|'deduction', label: string, amount: number) => void }) {
  const [type, setType] = useState<'earning'|'deduction'>('earning');
  const [label, setLabel] = useState('Bonus');
  const [amount, setAmount] = useState<number>(0);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select value={type} onChange={e=>setType(e.target.value as any)} className="rounded border p-1">
          <option value="earning">Earning</option>
          <option value="deduction">Deduction</option>
        </select>
        <Input value={label} onChange={e=>setLabel(e.target.value)} />
        <Input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} />
      </div>
      <Button onClick={()=>onAdd(type, label, amount)}>Add to selected</Button>
    </div>
  );
}

function EmployeeEditorDialog({ employee, initial, onClose, onSave }: { employee: any; initial: { earnings: Earning[]; deductions: Deduction[] }; onClose: ()=>void; onSave: (earnings: Earning[], deductions: Deduction[])=>void }) {
  const [earnings, setEarnings] = useState<Earning[]>(initial.earnings);
  const [deductions, setDeductions] = useState<Deduction[]>(initial.deductions);

  function addEarning() {
    setEarnings(prev => [...prev, { type: 'Custom', amount: 0 }]);
  }
  function addDeduction() {
    setDeductions(prev => [...prev, { type: 'Custom', amount: 0 }]);
  }

  return (
    <Dialog open onOpenChange={(open)=>{ if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit adjustments for {employee.firstName} {employee.lastName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Earnings</h4>
            <div className="space-y-2">
              {earnings.map((e, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={e.type} onChange={(ev)=>{ const copy = [...earnings]; copy[idx] = { ...copy[idx], type: ev.target.value }; setEarnings(copy); }} />
                  <Input type="number" value={e.amount} onChange={(ev)=>{ const copy = [...earnings]; copy[idx] = { ...copy[idx], amount: Number(ev.target.value) }; setEarnings(copy); }} />
                  <Button variant="ghost" onClick={()=>setEarnings(prev=>prev.filter((_,i)=>i!==idx))}>Remove</Button>
                </div>
              ))}
              <Button onClick={addEarning}>Add earning</Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium">Deductions</h4>
            <div className="space-y-2">
              {deductions.map((d, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={d.type} onChange={(ev)=>{ const copy = [...deductions]; copy[idx] = { ...copy[idx], type: ev.target.value }; setDeductions(copy); }} />
                  <Input type="number" value={d.amount} onChange={(ev)=>{ const copy = [...deductions]; copy[idx] = { ...copy[idx], amount: Number(ev.target.value) }; setDeductions(copy); }} />
                  <Button variant="ghost" onClick={()=>setDeductions(prev=>prev.filter((_,i)=>i!==idx))}>Remove</Button>
                </div>
              ))}
              <Button onClick={addDeduction}>Add deduction</Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={()=>onSave(earnings, deductions)}>Save</Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
