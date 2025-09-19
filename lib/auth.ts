export interface AuthState {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
  } | null;
}

class AuthService {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
  };

  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('payroll-auth');
      if (saved) {
        try {
          this.state = JSON.parse(saved);
        } catch (error) {
          console.error('Failed to parse auth state:', error);
        }
      }
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  private saveState() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('payroll-auth', JSON.stringify(this.state));
    }
  }

  login(email: string): boolean {
    // Mock login - just check if email is provided
    if (email && email.includes('@')) {
      this.state = {
        isAuthenticated: true,
        user: {
          name: 'Admin User',
          email,
        },
      };
      this.saveState();
      this.notify();
      return true;
    }
    return false;
  }

  logout(): void {
    this.state = {
      isAuthenticated: false,
      user: null,
    };
    if (typeof window !== 'undefined') {
      localStorage.removeItem('payroll-auth');
    }
    this.notify();
  }

  getState(): AuthState {
    return { ...this.state };
  }
}

export const authService = new AuthService();