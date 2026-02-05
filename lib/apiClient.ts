import axios from 'axios';
import { getAuthToken } from '@/lib/auth';

// Same-origin proxy to avoid CORS issues in the browser.
export const apiClient = axios.create({
  baseURL: '/api/backend',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    // Backend likely expects standard Bearer token.
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});
