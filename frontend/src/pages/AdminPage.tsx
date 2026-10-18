import { useEffect, useState } from 'react';
import { api } from '../services/api';

export function AdminPage() {
  const [message, setMessage] = useState('Loading...');
  useEffect(() => {
    api.get<{ message: string }>('/admin/overview')
      .then(result => setMessage(result.data.message))
      .catch(() => setMessage('Admin API access denied or unavailable'));
  }, []);
  return <main className="p-8"><h1 className="text-2xl font-bold">Admin area</h1><p>{message}</p></main>;
}