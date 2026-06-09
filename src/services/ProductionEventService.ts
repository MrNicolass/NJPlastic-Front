import type { AxiosResponse } from 'axios';
import type { Schemas } from '@/api/types';
import { EVENTS } from '@/constants/ConstantsAndParams';
import type { IProductionEventService } from '@/models/interfaces/services/IProductionEventService';
import type { Page } from '@/models/types/Page';
import type { PageParams } from '@/models/types/PageParams';
import type { RecentEventResponse } from '@/models/types/RecentEvent';
import { http } from '@/services/AxiosConfigService';

const buildNotificationConfig = (
  key: string,
  suppressError?: boolean,
  extras?: { successMessage?: string; successDescription?: string },
) => ({
  key,
  suppressErrorNotification: suppressError ?? false,
  ...extras,
});

const ProductionEventService: IProductionEventService = {
  async registerEvent(
    request: Schemas['EventRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['EventResponseDTO']> {
    try {
      const response: AxiosResponse<Schemas['EventResponseDTO']> = await http.post(
        '/events',
        request,
        {
          notificationConfig: buildNotificationConfig(EVENTS.KEY, suppressError, {
            successMessage: EVENTS.NOTIFICATIONS.SUCCESS.TITLES.REGISTERED,
            successDescription: EVENTS.NOTIFICATIONS.SUCCESS.MESSAGES.REGISTERED,
          }),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async listForMachine(
    pageable: PageParams,
    machineId: string,
    from: string | undefined,
    to: string | undefined,
    suppressError?: boolean,
  ): Promise<Page<Schemas['EventResponseDTO']>> {
    try {
      const response: AxiosResponse<Page<Schemas['EventResponseDTO']>> = await http.get(
        `/machines/${machineId}/events`,
        {
          params: { ...pageable, from, to },
          notificationConfig: buildNotificationConfig(EVENTS.KEY, suppressError),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async findRecent(
    limit: number,
    from: string | undefined,
    to: string | undefined,
    suppressError?: boolean,
  ): Promise<RecentEventResponse[]> {
    try {
      const response: AxiosResponse<RecentEventResponse[]> = await http.get('/events/recent', {
        params: { limit, from, to },
        notificationConfig: buildNotificationConfig(EVENTS.KEY, suppressError),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default ProductionEventService;
