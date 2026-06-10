import type { AxiosResponse } from 'axios';
import type { Schemas } from '@/api/types';
import { ERP_MAPPING } from '@/constants/ConstantsAndParams';
import type { IErpFieldMappingService } from '@/models/interfaces/services/IErpFieldMappingService';
import { http } from '@/services/AxiosConfigService';

const buildNotificationConfig = (
  suppressError?: boolean,
  extras?: { successMessage?: string; successDescription?: string },
) => ({
  key: ERP_MAPPING.KEY,
  suppressErrorNotification: suppressError ?? false,
  ...extras,
});

const ErpFieldMappingService: IErpFieldMappingService = {
  async getMapping(
    entityType: string,
    suppressError?: boolean,
  ): Promise<Schemas['ErpFieldMappingDTO'][]> {
    try {
      const response: AxiosResponse<Schemas['ErpFieldMappingDTO'][]> = await http.get(
        '/erp/field-mapping',
        {
          params: { entityType },
          notificationConfig: buildNotificationConfig(suppressError),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async replaceMapping(
    payload: Schemas['ErpFieldMappingUpdateRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['ErpFieldMappingDTO'][]> {
    try {
      const response: AxiosResponse<Schemas['ErpFieldMappingDTO'][]> = await http.put(
        '/erp/field-mapping',
        payload,
        {
          notificationConfig: buildNotificationConfig(suppressError, {
            successMessage: ERP_MAPPING.NOTIFICATIONS.SUCCESS.TITLES.UPDATED,
            successDescription: ERP_MAPPING.NOTIFICATIONS.SUCCESS.MESSAGES.UPDATED,
          }),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default ErpFieldMappingService;
