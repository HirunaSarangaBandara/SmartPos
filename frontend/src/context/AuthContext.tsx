import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onIdTokenChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { api } from '../services/api';

export type Employee = { uid: string; email: string; name: string; role: 'ADMIN' | 'CASHIER' };
type AuthContextValue = {
  employee: Employee | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
const Context = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let version = 0;
    return onIdTokenChanged(auth, async (user) => {
      const current = ++version;
      setLoading(true);
      setError(null);
      if (!user) {
        setEmployee(null);
        setLoading(false);
        return;
      }
      try {
        const response = await api.get<Employee>('/users/me');
        if (current === version) setEmployee(response.data);
      } catch {
        if (current === version) {
          setEmployee(null);
          setError('Your SmartPOS employee profile is missing, inactive, or unavailable.');
        }
      } finally {
        if (current === version) setLoading(false);
      }
    });
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    await signInWithEmailAndPassword(auth, email, password);
  };
  const logout = () => signOut(auth);
  return <Context.Provider value={{ employee, loading, error, login, logout }}>{children}</Context.Provider>;
}

export function useAuth() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}