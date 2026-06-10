import { AUTH } from '@/constants/ConstantsAndParams';

jest.mock('@/services/AxiosConfigService', () => ({
  __esModule: true,
  http: { get: jest.fn(), post: jest.fn() },
}));

import { http } from '@/services/AxiosConfigService';
import AuthService from '@/services/AuthService';

const mockedHttp = http as unknown as { get: jest.Mock; post: jest.Mock };

const resolved = <T>(data: T) => Promise.resolve({ data });

describe('AuthService', () => {
  beforeEach(() => {
    mockedHttp.get.mockReset();
    mockedHttp.post.mockReset();
  });

  describe('login', () => {
    it('POSTs /auth/login with the credentials and success+error notifications', async () => {
      mockedHttp.post.mockReturnValueOnce(resolved({ token: 't' }));

      await AuthService.login({ login: 'manager', password: 'manager-dev-123' });

      const call = mockedHttp.post.mock.calls[0];
      expect(call[0]).toBe('/auth/login');
      expect(call[1]).toEqual({ login: 'manager', password: 'manager-dev-123' });
      expect(call[2].notificationConfig).toMatchObject({
        key: AUTH.KEY,
        suppressErrorNotification: false,
        successMessage: AUTH.NOTIFICATIONS.SUCCESS.TITLES.LOGIN,
        successDescription: AUTH.NOTIFICATIONS.SUCCESS.MESSAGES.LOGIN,
        errorMessage: AUTH.NOTIFICATIONS.ERROR.TITLES.INVALID_CREDENTIALS,
        errorDescription: AUTH.NOTIFICATIONS.ERROR.MESSAGES.INVALID_CREDENTIALS,
      });
    });

    it('forwards suppressErrorNotification when requested', async () => {
      mockedHttp.post.mockReturnValueOnce(resolved({}));

      await AuthService.login({ login: 'x', password: 'y' }, true);

      expect(mockedHttp.post.mock.calls[0][2].notificationConfig.suppressErrorNotification).toBe(true);
    });
  });

  describe('me', () => {
    it('GETs /auth/me with the auth notification key', async () => {
      mockedHttp.get.mockReturnValueOnce(resolved({ id: 'u1' }));

      await AuthService.me();

      expect(mockedHttp.get).toHaveBeenCalledWith('/auth/me', {
        notificationConfig: { key: AUTH.KEY, suppressErrorNotification: false },
      });
    });
  });

  describe('refresh', () => {
    it('POSTs /auth/refresh with notifications suppressed by default', async () => {
      mockedHttp.post.mockReturnValueOnce(resolved({ token: 'r' }));

      await AuthService.refresh();

      expect(mockedHttp.post).toHaveBeenCalledWith('/auth/refresh', undefined, {
        notificationConfig: { key: AUTH.KEY, suppressErrorNotification: true },
      });
    });
  });

  describe('logout', () => {
    it('POSTs /auth/logout with the LOGOUT success texts', async () => {
      mockedHttp.post.mockReturnValueOnce(resolved(undefined));

      await AuthService.logout();

      expect(mockedHttp.post.mock.calls[0][0]).toBe('/auth/logout');
      expect(mockedHttp.post.mock.calls[0][2].notificationConfig).toMatchObject({
        successMessage: AUTH.NOTIFICATIONS.SUCCESS.TITLES.LOGOUT,
        successDescription: AUTH.NOTIFICATIONS.SUCCESS.MESSAGES.LOGOUT,
      });
    });
  });

  describe('requestPasswordReset', () => {
    it('POSTs /auth/password-reset with the request body and password-reset texts', async () => {
      mockedHttp.post.mockReturnValueOnce(resolved(undefined));

      await AuthService.requestPasswordReset({ login: 'manager' });

      expect(mockedHttp.post.mock.calls[0][0]).toBe('/auth/password-reset');
      expect(mockedHttp.post.mock.calls[0][1]).toEqual({ login: 'manager' });
      expect(mockedHttp.post.mock.calls[0][2].notificationConfig).toMatchObject({
        successMessage: AUTH.NOTIFICATIONS.SUCCESS.TITLES.PASSWORD_RESET_REQUESTED,
        successDescription: AUTH.NOTIFICATIONS.SUCCESS.MESSAGES.PASSWORD_RESET_REQUESTED,
      });
    });
  });

  describe('confirmPasswordReset', () => {
    it('POSTs /auth/password-reset/confirm with the reset payload and suppresses error notifications', async () => {
      mockedHttp.post.mockReturnValueOnce(resolved(undefined));

      await AuthService.confirmPasswordReset({ token: 'tok', password: 'new-passphrase' });

      expect(mockedHttp.post.mock.calls[0][0]).toBe('/auth/password-reset/confirm');
      expect(mockedHttp.post.mock.calls[0][2].notificationConfig.suppressErrorNotification).toBe(true);
      expect(mockedHttp.post.mock.calls[0][2].notificationConfig.successMessage)
        .toBe(AUTH.NOTIFICATIONS.SUCCESS.TITLES.PASSWORD_RESET_CONFIRMED);
    });
  });

  it('rethrows the axios error on every operation', async () => {
    const boom = new Error('boom');
    mockedHttp.post.mockRejectedValueOnce(boom);

    await expect(AuthService.login({ login: 'x', password: 'y' })).rejects.toBe(boom);
  });
});
