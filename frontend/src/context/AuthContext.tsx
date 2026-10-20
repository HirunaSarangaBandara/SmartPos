import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";

import { auth } from "../config/firebase";
import { api } from "../services/api";

export type EmployeeRole = "ADMIN" | "CASHIER";

export interface EmployeeProfile {
  uid: string;
  email: string;
  role: EmployeeRole;
  displayName?: string;
  name?: string;
  active?: boolean;
}

export type Employee = EmployeeProfile;

interface AuthContextValue {
  user: User | null;
  employee: EmployeeProfile | null;
  profile: EmployeeProfile | null;
  role: EmployeeRole | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

async function fetchEmployeeProfile(
  currentUser: User
): Promise<EmployeeProfile> {
  const response = await api.get<
    Partial<EmployeeProfile> & Record<string, unknown>
  >("/users/me");

  const data = response.data;

  const rawRole = String(data.role ?? "").toUpperCase();

  if (rawRole !== "ADMIN" && rawRole !== "CASHIER") {
    throw new Error(
      "Your account does not have a valid employee role."
    );
  }

  return {
    uid: data.uid ?? currentUser.uid,
    email: data.email ?? currentUser.email ?? "",
    role: rawRole,
    displayName:
      data.displayName ??
      data.name ??
      currentUser.displayName ??
      "",
    name:
      data.name ??
      data.displayName ??
      currentUser.displayName ??
      "",
    active: data.active ?? true,
  };
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [employee, setEmployee] =
    useState<EmployeeProfile | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!mounted) {
          return;
        }

        setUser(currentUser);
        setError(null);

        if (!currentUser) {
          setEmployee(null);
          setLoading(false);
          return;
        }

        setLoading(true);

        try {
          const employeeData =
            await fetchEmployeeProfile(currentUser);

          if (mounted) {
            setEmployee(employeeData);
          }
        } catch (err: unknown) {
          if (mounted) {
            setEmployee(null);

            setError(
              err instanceof Error
                ? err.message
                : "Unable to load employee profile."
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  async function login(
    email: string,
    password: string
  ): Promise<void> {
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
    } catch (err: unknown) {
      setLoading(false);

      const message =
        err instanceof Error
          ? err.message
          : "Login failed.";

      setError(message);
      throw err;
    }
  }

  async function logout(): Promise<void> {
    setError(null);

    await firebaseSignOut(auth);

    setUser(null);
    setEmployee(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      employee,
      profile: employee,
      role: employee?.role ?? null,
      loading,
      error,
      login,
      logout,
      signIn: login,
      signOut: logout,
    }),
    // login/logout are defined inside the provider.
    // Their implementations are recreated during render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, employee, loading, error]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Keep this export for existing Day 4 imports.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}