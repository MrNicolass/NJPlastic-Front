import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { GENERIC_NOTIFICATIONS } from '@/constants/ConstantsAndParams';
import { NotificationUtils } from '@/utils/NotificationUtils';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8111';

export type NotificationConfig = {
  key?: string;
  successMessage?: string;
  successDescription?: string;
  errorMessage?: string;
  errorDescription?: string;
  suppressErrorNotification?: boolean;
  suppressSuccessNotification?: boolean;
};

declare module 'axios' {
  export interface AxiosRequestConfig {
    notificationConfig?: NotificationConfig;
  }
  export interface InternalAxiosRequestConfig {
    notificationConfig?: NotificationConfig;
  }
}

export const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

type InterceptorCallbacks = {
  onUnauthorized: () => void;
};

let interceptorsInstalled = false;

const generateRequestId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const isLoginEndpoint = (url?: string): boolean => Boolean(url && url.endsWith('/auth/login'));

const handleSuccess = (response: AxiosResponse): AxiosResponse => {
  const config = response.config.notificationConfig;
  if (!config || config.suppressSuccessNotification || !config.successMessage) {
    return response;
  }
  NotificationUtils({
    key: config.key,
    type: 'success',
    message: config.successMessage,
    description: config.successDescription,
  });
  return response;
};

const handleError = (callbacks: InterceptorCallbacks) => (error: AxiosError) => {
  const status = error.response?.status;
  const config = error.config?.notificationConfig;
  const url = error.config?.url;

  if (status === 401) {
    callbacks.onUnauthorized();
    if (!isLoginEndpoint(url)) {
      NotificationUtils({
        key: GENERIC_NOTIFICATIONS.KEYS.SESSION_EXPIRED,
        defaultType: 'SESSION_EXPIRED',
      });
    }
    return Promise.reject(error);
  }

  if (config?.suppressErrorNotification) {
    return Promise.reject(error);
  }

  if (config?.errorMessage) {
    NotificationUtils({
      key: config.key,
      type: 'error',
      message: config.errorMessage,
      description: config.errorDescription,
    });
    return Promise.reject(error);
  }

  if (status === 403) {
    NotificationUtils({ defaultType: 'UNAUTHORIZED' });
  } else if (status && status >= 500) {
    NotificationUtils({ defaultType: 'INTERNAL_SERVER_ERROR' });
  } else {
    NotificationUtils({ defaultType: 'GENERIC_ERROR' });
  }
  return Promise.reject(error);
};

/**
 * Install request/response interceptors on the shared {@link http}
 * instance. Idempotent: subsequent calls are no-ops, so React Strict
 * Mode double-invokes are safe. Must be called once from a client
 * boundary (e.g. `providers.tsx`) before any service runs.
 */
export function setupAxiosInterceptors(callbacks: InterceptorCallbacks): void {
  if (interceptorsInstalled) {
    return;
  }
  http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers.set('X-Request-Id', generateRequestId());
    return config;
  });
  http.interceptors.response.use(handleSuccess, handleError(callbacks));
  interceptorsInstalled = true;
}
