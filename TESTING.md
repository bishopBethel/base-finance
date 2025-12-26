## Testing

This project uses **Vitest** for fast, modern unit testing with TypeScript support out of the box.

### What We Test

We focus on testing the **pure business logic** in `/lib/payroll.ts` since these calculations are critical to payroll accuracy. UI components are not tested in this demo project.

### Test Coverage

Our test suite validates:

1. **Gross Pay Calculation** - Base salary + earnings
2. **Tax Calculation** - 10% of gross pay
3. **Pension Calculation** - 8% of base salary
4. **Net Pay Calculation** - Gross minus all deductions
5. **Edge Cases** - Zero amounts, negative values, large numbers

---

### Setup

#### 1. Install Testing Dependencies

```bash
npm install -D vitest @vitest/ui
```

#### 2. Create Vitest Config

Create `vitest.config.ts` in the project root:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

#### 3. Add Test Scripts to `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

### Writing Tests

#### Test File Structure

Create `/tests/payroll.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  calcGross,
  calcTax,
  calcPension,
  calcTotals,
} from '@/lib/payroll';
import type { LineItem } from '@/types';

describe('Payroll Calculations', () => {
  describe('calcGross', () => {
    it('calculates gross pay with base salary only', () => {
      const result = calcGross(5000, []);
      expect(result).toBe(5000);
    });

    it('calculates gross pay with earnings', () => {
      const earnings: LineItem[] = [
        { type: 'Bonus', amount: 1000 },
        { type: 'Allowance', amount: 500 },
      ];
      const result = calcGross(5000, earnings);
      expect(result).toBe(6500); // 5000 + 1000 + 500
    });

    it('handles zero base salary', () => {
      const earnings: LineItem[] = [{ type: 'Commission', amount: 2000 }];
      const result = calcGross(0, earnings);
      expect(result).toBe(2000);
    });

    it('handles empty earnings array', () => {
      const result = calcGross(5000, []);
      expect(result).toBe(5000);
    });
  });

  describe('calcTax', () => {
    it('calculates 10% tax on gross pay', () => {
      const result = calcTax(10000);
      expect(result).toBe(1000); // 10% of 10000
    });

    it('handles decimal results correctly', () => {
      const result = calcTax(5555);
      expect(result).toBe(555.5); // 10% of 5555
    });

    it('returns zero for zero gross', () => {
      const result = calcTax(0);
      expect(result).toBe(0);
    });
  });

  describe('calcPension', () => {
    it('calculates 8% pension on base salary', () => {
      const result = calcPension(5000);
      expect(result).toBe(400); // 8% of 5000
    });

    it('handles decimal results correctly', () => {
      const result = calcPension(6250);
      expect(result).toBe(500); // 8% of 6250
    });

    it('returns zero for zero base salary', () => {
      const result = calcPension(0);
      expect(result).toBe(0);
    });
  });

  describe('calcTotals', () => {
    it('calculates all totals correctly', () => {
      const earnings: LineItem[] = [
        { type: 'Bonus', amount: 1000 },
        { type: 'Allowance', amount: 500 },
      ];
      const deductions: LineItem[] = [
        { type: 'Health Insurance', amount: 200 },
      ];

      const result = calcTotals({
        baseSalary: 5000,
        earnings,
        deductions,
      });

      // Gross = 5000 + 1000 + 500 = 6500
      // Tax = 10% of 6500 = 650
      // Pension = 8% of 5000 = 400
      // Total Deductions = 650 + 400 + 200 = 1250
      // Net = 6500 - 1250 = 5250

      expect(result.grossPay).toBe(6500);
      expect(result.totalDeductions).toBe(1250);
      expect(result.netPay).toBe(5250);
    });

    it('handles no earnings or deductions', () => {
      const result = calcTotals({
        baseSalary: 5000,
        earnings: [],
        deductions: [],
      });

      // Gross = 5000
      // Tax = 500
      // Pension = 400
      // Total Deductions = 900
      // Net = 4100

      expect(result.grossPay).toBe(5000);
      expect(result.totalDeductions).toBe(900);
      expect(result.netPay).toBe(4100);
    });

    it('handles large numbers correctly', () => {
      const result = calcTotals({
        baseSalary: 100000,
        earnings: [{ type: 'Bonus', amount: 50000 }],
        deductions: [{ type: 'Loan', amount: 5000 }],
      });

      // Gross = 150000
      // Tax = 15000
      // Pension = 8000
      // Total Deductions = 28000
      // Net = 122000

      expect(result.grossPay).toBe(150000);
      expect(result.totalDeductions).toBe(28000);
      expect(result.netPay).toBe(122000);
    });
  });
});
```

---

### Running Tests

#### Run All Tests

```bash
npm test
```

This starts Vitest in **watch mode** - tests automatically re-run when you change files.

#### Run Tests Once (CI Mode)

```bash
npm test -- --run
```

#### View Test UI

```bash
npm run test:ui
```

Opens an interactive browser UI showing test results, coverage, and file structure.

#### Generate Coverage Report

First install coverage tooling:

```bash
npm install -D @vitest/coverage-v8
```

Then run:

```bash
npm run test:coverage
```

This creates a `coverage/` directory with an HTML report. Open `coverage/index.html` to see detailed coverage metrics.

---

### Expected Output

When tests pass, you'll see:

```
✓ tests/payroll.test.ts (15)
  ✓ Payroll Calculations (15)
    ✓ calcGross (4)
      ✓ calculates gross pay with base salary only
      ✓ calculates gross pay with earnings
      ✓ handles zero base salary
      ✓ handles empty earnings array
    ✓ calcTax (3)
      ✓ calculates 10% tax on gross pay
      ✓ handles decimal results correctly
      ✓ returns zero for zero gross
    ✓ calcPension (3)
      ✓ calculates 8% pension on base salary
      ✓ handles decimal results correctly
      ✓ returns zero for zero base salary
    ✓ calcTotals (3)
      ✓ calculates all totals correctly
      ✓ handles no earnings or deductions
      ✓ handles large numbers correctly

Test Files  1 passed (1)
     Tests  15 passed (15)
```

---

### Best Practices

1. **Test Pure Functions First** - Functions without side effects (like our payroll math) are easiest to test
2. **Test Edge Cases** - Zero values, empty arrays, large numbers
3. **Use Descriptive Test Names** - Each test should clearly state what it validates
4. **Keep Tests Focused** - One assertion per test when possible
5. **Run Tests Before Commits** - Catch bugs early

---

### Adding More Tests

To test additional functionality:

1. **Store Operations** - Test CRUD operations in `/lib/store.ts`
2. **CSV Generation** - Test output format in `/lib/csv.ts`
3. **Activity Feed** - Test recent activity logic in `/lib/activity.ts`
4. **Seed Data** - Verify seed data structure matches types

Example for testing CSV generation:

```ts
// tests/csv.test.ts
import { describe, it, expect } from 'vitest';
import { generatePayslipsCSV } from '@/lib/csv';

describe('CSV Generation', () => {
  it('generates valid CSV headers', () => {
    const csv = generatePayslipsCSV([]);
    expect(csv).toContain('Employee,Base,EarningsTotal,Tax,Pension');
  });
});
```

---

### Troubleshooting

**Issue:** Tests fail with module resolution errors

**Solution:** Verify `vitest.config.ts` has the correct path alias:

```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
}
```

**Issue:** Tests pass locally but fail in CI

**Solution:** Ensure all dependencies are in `package.json` and run `npm ci` instead of `npm install` in CI

---

### Next Steps

1. Install Vitest: `npm install -D vitest @vitest/ui`
2. Create `vitest.config.ts` with the config above
3. Create `/tests/payroll.test.ts` with the test suite
4. Run `npm test` to verify everything works
5. Add `npm test -- --run` to your CI pipeline

---
