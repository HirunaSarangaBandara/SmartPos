import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { employee, logout } = useAuth();
  return <main className="min-h-screen p-8 bg-slate-50 text-slate-900">
    <div className="max-w-4xl mx-auto space-y-5">
      <header className="flex justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">SmartPOS Dashboard</h1>
        <button className="px-4 py-2 border rounded-lg" onClick={() => void logout()}>Sign out</button>
      </header>
      <section className="bg-white rounded-xl border p-6 space-y-2">
        <p>Welcome, <strong>{employee?.name}</strong></p>
        <p>Employee role: <strong>{employee?.role}</strong></p>
        <p className="text-slate-500 text-sm">Day 4 authentication is active. Sales and inventory screens come later.</p>
        {employee?.role === 'ADMIN' && <Link className="text-blue-700 underline block" to="/admin">Open Admin Area</Link>}
      </section>
    </div>
  </main>;
}