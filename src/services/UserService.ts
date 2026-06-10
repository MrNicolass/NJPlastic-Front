import type { AxiosResponse } from 'axios';
import type { Schemas } from '@/api/types';
import { USERS } from '@/constants/ConstantsAndParams';
import type { IUserService, UserListFilters } from '@/models/interfaces/services/IUserService';
import type { Page } from '@/models/types/Page';
import type { PageParams } from '@/models/types/PageParams';
import { http } from '@/services/AxiosConfigService';

const buildNotificationConfig = (
  suppressError?: boolean,
  extras?: { successMessage?: string; successDescription?: string },
) => ({
  key: USERS.KEY,
  suppressErrorNotification: suppressError ?? false,
  ...extras,
});

const UserService: IUserService = {
  async list(
    pageable: PageParams,
    filters?: UserListFilters,
    suppressError?: boolean,
  ): Promise<Page<Schemas['UserResponseDTO']>> {
    try {
      const response: AxiosResponse<Page<Schemas['UserResponseDTO']>> = await http.get('/users', {
        params: { ...pageable, ...(filters ?? {}) },
        notificationConfig: buildNotificationConfig(suppressError),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getById(id: string, suppressError?: boolean): Promise<Schemas['UserResponseDTO']> {
    try {
      const response: AxiosResponse<Schemas['UserResponseDTO']> = await http.get(`/users/${id}`, {
        notificationConfig: buildNotificationConfig(suppressError),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async create(
    payload: Schemas['UserRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['UserResponseDTO']> {
    try {
      const response: AxiosResponse<Schemas['UserResponseDTO']> = await http.post('/users', payload, {
        notificationConfig: buildNotificationConfig(suppressError, {
          successMessage: USERS.NOTIFICATIONS.SUCCESS.TITLES.CREATED,
          successDescription: USERS.NOTIFICATIONS.SUCCESS.MESSAGES.CREATED,
        }),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async update(
    id: string,
    payload: Schemas['UserUpdateRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['UserResponseDTO']> {
    try {
      const response: AxiosResponse<Schemas['UserResponseDTO']> = await http.put(
        `/users/${id}`,
        payload,
        {
          notificationConfig: buildNotificationConfig(suppressError, {
            successMessage: USERS.NOTIFICATIONS.SUCCESS.TITLES.UPDATED,
            successDescription: USERS.NOTIFICATIONS.SUCCESS.MESSAGES.UPDATED,
          }),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async softDelete(id: string, suppressError?: boolean): Promise<void> {
    try {
      await http.delete(`/users/${id}`, {
        notificationConfig: buildNotificationConfig(suppressError, {
          successMessage: USERS.NOTIFICATIONS.SUCCESS.TITLES.DEACTIVATED,
          successDescription: USERS.NOTIFICATIONS.SUCCESS.MESSAGES.DEACTIVATED,
        }),
      });
    } catch (error) {
      throw error;
    }
  },
};

export default UserService;
