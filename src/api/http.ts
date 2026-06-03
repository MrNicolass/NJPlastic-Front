import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useSessionStore } from '@/stores/useSessionStore';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8111';

export const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const requestId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  config.headers.set('X-Request-Id', requestId);
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useSessionStore.getState().clear();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  },
);
