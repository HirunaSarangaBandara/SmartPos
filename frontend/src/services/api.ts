import axios from 'axios';
import { auth } from '../config/firebase';

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8080/api/v1',

  timeout: 15000,
});

api.interceptors.request.use(async (config) => {

  // Wait until Firebase restores the login session
  await auth.authStateReady();

  // Get the currently authenticated employee
  const user = auth.currentUser;

  if (user) {
    // Retrieve the Firebase ID token
    const token = await user.getIdToken();

    // Attach token to protected backend requests
    config.headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  return config;
});