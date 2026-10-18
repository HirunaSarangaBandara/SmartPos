import axios from 'axios';
import { auth } from '../config/firebase';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
});

api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});