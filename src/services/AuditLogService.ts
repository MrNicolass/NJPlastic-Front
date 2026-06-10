import type { AxiosResponse } from 'axios';
import { AUDIT } from '@/constants/ConstantsAndParams';
import type {
  IAuditLogService,
  AuditLogFilters,
} from '@/models/interfaces/services/IAuditLogService';
import type { Page } from '@/models/types/Page';
import type { PageParams } from '@/models/types/PageParams';
import type { AuditLogResponse } from '@/models/types/AuditLogResponse';
import { http } from '@/services/AxiosConfigService';

const buildNotificationConfig = (suppressError?: boolean) => ({
  key: AUDIT.KEY,
  suppressErrorNotification: suppressError ?? false,
});

const AuditLogService: IAuditLogService = {
  async list(
    pageable: PageParams,
    filters?: AuditLogFilters,
    suppressError?: boolean,
  ): Promise<Page<AuditLogResponse>> {
    try {
      const response: AxiosResponse<Page<AuditLogResponse>> = await http.get('/audit-logs', {
        params: { ...pageable, ...(filters ?? {}) },
        notificationConfig: buildNotificationConfig(suppressError),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default AuditLogService;
