import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { employee, loading, error, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  if (loading) return <p className="p-8">Loading session...</p>;
  if (employee) return <Navigate to="/dashboard" replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await login(email, password);
    } catch {
      setMessage('Login failed. Check your email and password.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="min-h-screen bg-slate-950 flex items-center justify-center p-5 text-slate-900">
    <form onSubmit={submit} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-5">
      <h1 className="text-3xl font-bold">SmartPOS</h1>
      <p className="text-sm text-slate-500">Employee sign in</p>
      <label className="block text-sm font-medium">Email
        <input className="mt-1 w-full p-3 border rounded-lg" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} />
      </label>
      <label className="block text-sm font-medium">Password
        <input className="mt-1 w-full p-3 border rounded-lg" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} />
      </label>
      {(message || error) && <p role="alert" className="text-sm text-red-600">{message || error}</p>}
      <button disabled={busy} className="w-full rounded-lg bg-blue-600 text-white p-3 disabled:opacity-50">{busy ? 'Signing in...' : 'Sign in'}</button>
    </form>
  </main>;
}