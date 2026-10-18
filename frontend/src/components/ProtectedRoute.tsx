import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ role }: { role?: 'ADMIN' | 'CASHIER' }) {
  const { employee, loading } = useAuth();
  if (loading) return <p className="p-8">Checking your session...</p>;
  if (!employee) return <Navigate to="/login" replace />;
  if (role && employee.role !== role) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}