import type { AxiosResponse } from 'axios';
import type { Schemas } from '@/api/types';
import { AUTH } from '@/constants/ConstantsAndParams';
import type { IAuthService } from '@/models/interfaces/services/IAuthService';
import { http } from '@/services/AxiosConfigService';

const buildNotificationConfig = (
  key: string,
  suppressError?: boolean,
  extras?: {
    successMessage?: string;
    successDescription?: string;
    errorMessage?: string;
    errorDescription?: string;
  },
) => ({
  key,
  suppressErrorNotification: suppressError ?? false,
  ...extras,
});

const AuthService: IAuthService = {
  async login(
    request: Schemas['LoginRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['LoginResponseDTO']> {
    try {
      const response: AxiosResponse<Schemas['LoginResponseDTO']> = await http.post(
        '/auth/login',
        request,
        {
          notificationConfig: buildNotificationConfig(AUTH.KEY, suppressError, {
            successMessage: AUTH.NOTIFICATIONS.SUCCESS.TITLES.LOGIN,
            successDescription: AUTH.NOTIFICATIONS.SUCCESS.MESSAGES.LOGIN,
            errorMessage: AUTH.NOTIFICATIONS.ERROR.TITLES.INVALID_CREDENTIALS,
            errorDescription: AUTH.NOTIFICATIONS.ERROR.MESSAGES.INVALID_CREDENTIALS,
          }),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async me(suppressError?: boolean): Promise<Schemas['UserSummaryDTO']> {
    try {
      const response: AxiosResponse<Schemas['UserSummaryDTO']> = await http.get('/auth/me', {
        notificationConfig: buildNotificationConfig(AUTH.KEY, suppressError),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async refresh(suppressError?: boolean): Promise<Schemas['RefreshResponseDTO']> {
    try {
      const response: AxiosResponse<Schemas['RefreshResponseDTO']> = await http.post(
        '/auth/refresh',
        undefined,
        {
          notificationConfig: buildNotificationConfig(AUTH.KEY, suppressError ?? true),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout(suppressError?: boolean): Promise<void> {
    try {
      await http.post('/auth/logout', undefined, {
        notificationConfig: buildNotificationConfig(AUTH.KEY, suppressError, {
          successMessage: AUTH.NOTIFICATIONS.SUCCESS.TITLES.LOGOUT,
          successDescription: AUTH.NOTIFICATIONS.SUCCESS.MESSAGES.LOGOUT,
        }),
      });
    } catch (error) {
      throw error;
    }
  },

  async requestPasswordReset(
    request: Schemas['PasswordResetRequestDTO'],
    suppressError?: boolean,
  ): Promise<void> {
    try {
      await http.post('/auth/password-reset', request, {
        notificationConfig: buildNotificationConfig(AUTH.KEY, suppressError, {
          successMessage: AUTH.NOTIFICATIONS.SUCCESS.TITLES.PASSWORD_RESET_REQUESTED,
          successDescription: AUTH.NOTIFICATIONS.SUCCESS.MESSAGES.PASSWORD_RESET_REQUESTED,
        }),
      });
    } catch (error) {
      throw error;
    }
  },

  async confirmPasswordReset(
    request: Schemas['PasswordResetConfirmDTO'],
    suppressError?: boolean,
  ): Promise<void> {
    try {
      await http.post('/auth/password-reset/confirm', request, {
        notificationConfig: buildNotificationConfig(AUTH.KEY, suppressError ?? true, {
          successMessage: AUTH.NOTIFICATIONS.SUCCESS.TITLES.PASSWORD_RESET_CONFIRMED,
          successDescription: AUTH.NOTIFICATIONS.SUCCESS.MESSAGES.PASSWORD_RESET_CONFIRMED,
        }),
      });
    } catch (error) {
      throw error;
    }
  },
};

export default AuthService;
