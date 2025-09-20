'use client';

import { useEffect, useState } from 'react';
import { store } from '@/lib/store';
import { AppState } from '@/lib/types';

export function useStore() {
  const [state, setState] = useState<AppState>(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });
    return unsubscribe;
  }, []);

  return {
    state,
    actions: {
      addEmployee: store.addEmployee.bind(store),
      updateEmployee: store.updateEmployee.bind(store),
      deleteEmployee: store.deleteEmployee.bind(store),
      addPayrollRun: store.addPayrollRun.bind(store),
      updatePayrollRun: store.updatePayrollRun.bind(store),
      deletePayrollRun: store.deletePayrollRun.bind(store),
      addPayslips: store.addPayslips.bind(store),
      updatePayslip: store.updatePayslip.bind(store),
      toggleLocalStorage: store.toggleLocalStorage.bind(store),
      resetToSeed: store.resetToSeed.bind(store),
    }
  };
}