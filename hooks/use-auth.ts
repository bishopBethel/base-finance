'use client';

import { useEffect, useState } from 'react';
import { authService, AuthState } from '@/lib/auth';

export function useAuth() {
  const [state, setState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(() => {
      setState(authService.getState());
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
  };
}