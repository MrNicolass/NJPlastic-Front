import { GENERIC_NOTIFICATIONS } from '@/constants/ConstantsAndParams';

jest.mock('@/utils/NotificationUtils', () => ({
  __esModule: true,
  NotificationUtils: jest.fn(),
}));

import { NotificationUtils } from '@/utils/NotificationUtils';
import { http, setupAxiosInterceptors } from '@/services/AxiosConfigService';

const mockedNotificationUtils = NotificationUtils as jest.Mock;

type MockAdapterResponse = {
  status: number;
  data?: unknown;
};

const installMockAdapter = (responder: (url: string | undefined) => MockAdapterResponse) => {
  http.defaults.adapter = jest.fn((config) => {
    const result = responder(config.url);
    const payload = {
      data: result.data ?? null,
      status: result.status,
      statusText: '',
      headers: {},
      config,
    };
    if (result.status >= 200 && result.status < 300) {
      return Promise.resolve(payload);
    }
    const error = Object.assign(new Error(`HTTP ${result.status}`), {
      isAxiosError: true,
      response: payload,
      config,
    });
    return Promise.reject(error);
  });
};

describe('AxiosConfigService', () => {
  const onUnauthorized = jest.fn();

  beforeAll(() => {
    setupAxiosInterceptors({ onUnauthorized });
  });

  beforeEach(() => {
    mockedNotificationUtils.mockClear();
    onUnauthorized.mockClear();
  });

  describe('http instance', () => {
    it('is built with credentials enabled and JSON headers', () => {
      expect(http.defaults.withCredentials).toBe(true);
      expect(http.defaults.headers['Content-Type']).toBe('application/json');
      expect(http.defaults.baseURL).toBeDefined();
    });
  });

  describe('setupAxiosInterceptors', () => {
    it('is idempotent across repeated calls', () => {
      const requestHandlersBefore = (http.interceptors.request as unknown as {
        handlers: unknown[];
      }).handlers.length;
      const responseHandlersBefore = (http.interceptors.response as unknown as {
        handlers: unknown[];
      }).handlers.length;

      setupAxiosInterceptors({ onUnauthorized: jest.fn() });
      setupAxiosInterceptors({ onUnauthorized: jest.fn() });

      expect(
        (http.interceptors.request as unknown as { handlers: unknown[] }).handlers.length,
      ).toBe(requestHandlersBefore);
      expect(
        (http.interceptors.response as unknown as { handlers: unknown[] }).handlers.length,
      ).toBe(responseHandlersBefore);
    });

    it('adds an X-Request-Id header to every outbound request', async () => {
      installMockAdapter(() => ({ status: 200, data: { ok: true } }));

      const response = await http.get('/probe');

      expect(response.config.headers.get('X-Request-Id')).toBeDefined();
      expect(typeof response.config.headers.get('X-Request-Id')).toBe('string');
    });
  });

  describe('success interceptor', () => {
    it('emits the success notification when successMessage is set', async () => {
      installMockAdapter(() => ({ status: 200, data: { id: 'a' } }));

      await http.get('/ok', {
        notificationConfig: {
          key: 'k1',
          successMessage: 'Saved',
          successDescription: 'Resource saved',
        },
      });

      expect(mockedNotificationUtils).toHaveBeenCalledWith({
        key: 'k1',
        type: 'success',
        message: 'Saved',
        description: 'Resource saved',
      });
    });

    it('does nothing on 2xx when no notificationConfig is provided', async () => {
      installMockAdapter(() => ({ status: 200, data: {} }));

      await http.get('/silent');

      expect(mockedNotificationUtils).not.toHaveBeenCalled();
    });

    it('does nothing on 2xx when suppressSuccessNotification is true', async () => {
      installMockAdapter(() => ({ status: 200, data: {} }));

      await http.get('/silent', {
        notificationConfig: {
          successMessage: 'Saved',
          suppressSuccessNotification: true,
        },
      });

      expect(mockedNotificationUtils).not.toHaveBeenCalled();
    });

    it('does nothing on 2xx when successMessage is missing', async () => {
      installMockAdapter(() => ({ status: 200, data: {} }));

      await http.get('/silent', { notificationConfig: { key: 'k' } });

      expect(mockedNotificationUtils).not.toHaveBeenCalled();
    });
  });

  describe('error interceptor', () => {
    it('triggers the unauthorized callback and a session-expired notification on 401', async () => {
      installMockAdapter(() => ({ status: 401 }));

      await expect(http.get('/secured')).rejects.toBeDefined();

      expect(onUnauthorized).toHaveBeenCalledTimes(1);
      expect(mockedNotificationUtils).toHaveBeenCalledWith({
        key: GENERIC_NOTIFICATIONS.KEYS.SESSION_EXPIRED,
        defaultType: 'SESSION_EXPIRED',
      });
    });

    it('still calls onUnauthorized on 401 from /auth/login but skips the session-expired notification', async () => {
      installMockAdapter(() => ({ status: 401 }));

      await expect(http.post('/auth/login', {})).rejects.toBeDefined();

      expect(onUnauthorized).toHaveBeenCalledTimes(1);
      expect(mockedNotificationUtils).not.toHaveBeenCalled();
    });

    it('suppresses the notification when suppressErrorNotification is true', async () => {
      installMockAdapter(() => ({ status: 500 }));

      await expect(
        http.get('/boom', {
          notificationConfig: { suppressErrorNotification: true },
        }),
      ).rejects.toBeDefined();

      expect(mockedNotificationUtils).not.toHaveBeenCalled();
    });

    it('emits a custom error notification when errorMessage is supplied', async () => {
      installMockAdapter(() => ({ status: 422 }));

      await expect(
        http.get('/custom', {
          notificationConfig: {
            key: 'custom-key',
            errorMessage: 'Bad input',
            errorDescription: 'Try again',
          },
        }),
      ).rejects.toBeDefined();

      expect(mockedNotificationUtils).toHaveBeenCalledWith({
        key: 'custom-key',
        type: 'error',
        message: 'Bad input',
        description: 'Try again',
      });
    });

    it('falls back to UNAUTHORIZED notification on 403', async () => {
      installMockAdapter(() => ({ status: 403 }));

      await expect(http.get('/forbidden')).rejects.toBeDefined();

      expect(mockedNotificationUtils).toHaveBeenCalledWith({ defaultType: 'UNAUTHORIZED' });
    });

    it('falls back to INTERNAL_SERVER_ERROR notification on 500+', async () => {
      installMockAdapter(() => ({ status: 503 }));

      await expect(http.get('/down')).rejects.toBeDefined();

      expect(mockedNotificationUtils).toHaveBeenCalledWith({
        defaultType: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('falls back to GENERIC_ERROR for other unhandled statuses', async () => {
      installMockAdapter(() => ({ status: 418 }));

      await expect(http.get('/teapot')).rejects.toBeDefined();

      expect(mockedNotificationUtils).toHaveBeenCalledWith({ defaultType: 'GENERIC_ERROR' });
    });
  });
});
