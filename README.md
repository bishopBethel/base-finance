# Simple Payroll Web

This is a test project. Ignore any bounty you see!

A local-only demo payroll manager built with Next.js 14, TypeScript, Tailwind, and **shadcn/ui**.
No third-party integrations. Dark mode enforced.

---

## Overview

* Manage employees and run simple payroll cycles locally.
* Draft → process payroll runs and view/download payslips.
* Persist data in memory or (optionally) `localStorage`.
* Uses **pure functions** for payroll math with unit tests.

---

## Tech Stack

* **Framework:** Next.js 14 (App Router) + TypeScript
* **UI:** Tailwind CSS + **shadcn/ui**
* **State/Data:** In-memory store with optional `localStorage` adapter
* **Validation:** Zod (forms)
* **Testing:** Vitest (or Jest) for `lib/payroll.ts` utilities

---

## Features

* **Auth (mock):** Email-only fake login; local session flag.
* **Dashboard:** KPIs (Employees, Last Run Net Total, Next Pay Date, Draft Runs) + recent activity.
* **Employees:** CRUD with filters (department/status).
* **Payroll Runs:** List, duplicate, delete; “Draft Builder” flow; process to lock.
* **Payslips:** Per-employee earnings/deductions; CSV export; print-friendly view.
* **Settings:** Manage reference lists; toggle `localStorage` persistence.

---

## Data Model (TypeScript)

```ts
// /types/index.ts
export type EmployeeStatus = "Active" | "Inactive";
export type RunStatus = "Draft" | "Processed";

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  role: string;
  hireDate: string; // ISO
  baseSalary: number;
  status: EmployeeStatus;
  bankName?: string;
  bankAccountNo?: string;
};

export type LineItem = { type: string; amount: number };

export type PayrollRun = {
  id: string;
  periodStart: string; // ISO
  periodEnd: string;   // ISO
  payDate: string;     // ISO
  status: RunStatus;
  notes?: string;
  employeeIds: string[];
};

export type Payslip = {
  id: string;
  payrollRunId: string;
  employeeId: string;
  earnings: LineItem[];
  deductions: LineItem[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
};
```

---

## Payroll Math (pure functions)

```ts
// /lib/payroll.ts
// Gross = baseSalary + sum(earnings)
// Tax = 10% of Gross
// Pension = 8% of baseSalary
// Net = Gross - (Tax + Pension + other deductions)
```

Utilities:

* `calcGross(baseSalary, earnings)`
* `calcTax(gross)`
* `calcPension(baseSalary)`
* `calcTotals({ baseSalary, earnings, deductions })`
* `generatePayslipsForRun(run, employees, referenceDefaults?)`

---

## Project Structure

```
/app
  /(auth)/login/page.tsx
  /(main)/layout.tsx
  /(main)/page.tsx              # Dashboard
  /(main)/employees/page.tsx
  /(main)/payroll/page.tsx      # Runs + Draft Builder
  /(main)/payroll/[runId]/page.tsx
  /(main)/settings/page.tsx
/components                     # DataTable, Forms, Dialogs, KPIs, etc.
/lib
  /payroll.ts                   # math utils (pure)
  /store.ts                     # in-memory + localStorage adapter
  /seed.ts                      # dummy data
  /csv.ts                       # CSV exports
  /activity.ts                  # recent activity feed
/types                          # shared types
/tests                          # unit tests for payroll utils
```

---

## Getting Started

> Requires Node 18+.

```bash
# Install deps
npm install

# Dev server (http://localhost:3000)
npm run dev

# Type-check
npm run typecheck

# Lint
npm run lint

# Unit tests
npm test

# Build & start
npm run build
npm start
```

---

## shadcn/ui & Tailwind

* Tailwind is configured with **dark mode (class)**; the root layout applies `dark`.
* All interactive components (Dialog, Form, Table, Tabs, DropdownMenu, Card, Toast, Select, DatePicker, Pagination, Alert, Badge, Button, Input) use **shadcn/ui**.

*No extra setup is required beyond `npm install` for this repository.*

---

## Seed Data

* On first run, the app loads `/lib/seed.ts`:

  * \~10–15 employees across Engineering, Operations, HR, Finance.
  * 2–3 historical payroll runs with payslips.
* To reset to seed: turn **off** persistence in **Settings**, reload.

### Deterministic seeding & reset helper

The project includes a deterministic seed generator and a programmatic reset helper:

- `createSeed(seed?: number)` — returns a deterministic `AppState`. Passing an integer `seed` will create a different, repeatable dataset.
- `store.resetToSeed(seed?: number)` — resets the in-memory store and `localStorage` (if enabled) to the deterministic seed and notifies UI subscribers.

You can call the helper from client code via the `useStore` hook (the hook exposes `actions.resetToSeed`). Example:

```tsx
import { useStore } from '@/hooks/use-store';

function ResetButton() {
  const { actions } = useStore();
  return <button onClick={() => actions.resetToSeed()}>Reset to demo seed</button>;
}
```

---

## Persistence

* **Settings → “Save data to localStorage”**

  * **Off (default):** in-memory only; resets on reload.
  * **On:** data saved to `localStorage`; survives reloads.

---

## Using the App

1. **Login:** Enter any email → mock session stored locally.
2. **Employees:** Add/Edit employees (Dialog). Toggle Active/Inactive.
3. **Payroll → Draft Builder:**

   * Set period & pay date.
   * Select employees (filters available).
   * Add bulk line items (e.g., Allowance) or per-employee edits.
   * Review generated table (earnings/deductions).
   * **Process Run** to lock and create final payslips.
4. **Run Details:** View totals, per-employee payslips, export CSV, print payslip.
5. **Settings:** Manage Departments/Roles/EarningTypes/DeductionTypes; toggle persistence.

---

## CSV & Print

* **Payslips CSV (per run):**
  Columns: `Employee, Base, EarningsTotal, Tax, Pension, OtherDeductions, Net`
* **Employees CSV:**
  Columns: basic profile + base salary + status.
* **Print Payslip:** Browser print dialog for a single employee payslip (print-optimized styles).

---

## Testing

* Unit tests cover `calcGross`, `calcTax`, `calcPension`, `calcTotals`.
* Run: `npm test`

---

## Constraints

* Local demo only; **no third-party integrations**.
* Dark mode enforced globally.
* PDF export uses browser print (no server-side PDF).

---


Powered by Stellar Blockchain


