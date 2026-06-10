import type { AxiosResponse } from 'axios';
import { REPORTS_LIBRARY } from '@/constants/ConstantsAndParams';
import type { IReportsService } from '@/models/interfaces/services/IReportsService';
import type { Page } from '@/models/types/Page';
import type { PageParams } from '@/models/types/PageParams';
import type {
  ReportHistoryFilters,
  ReportHistoryResponse,
  ReportScheduleRequest,
  ReportScheduleResponse,
} from '@/models/types/ReportTypes';
import { http } from '@/services/AxiosConfigService';

const buildNotificationConfig = (suppressError?: boolean) => ({
  key: REPORTS_LIBRARY.KEY,
  suppressErrorNotification: suppressError ?? false,
});

const ReportsService: IReportsService = {
  async listHistory(
    pageable: PageParams,
    filters?: ReportHistoryFilters,
    suppressError?: boolean,
  ): Promise<Page<ReportHistoryResponse>> {
    const response: AxiosResponse<Page<ReportHistoryResponse>> = await http.get(
      '/reports/history',
      {
        params: { ...pageable, ...(filters ?? {}) },
        notificationConfig: buildNotificationConfig(suppressError),
      },
    );
    return response.data;
  },

  async listSchedules(suppressError?: boolean): Promise<ReportScheduleResponse[]> {
    const response: AxiosResponse<ReportScheduleResponse[]> = await http.get('/reports/schedule', {
      notificationConfig: buildNotificationConfig(suppressError),
    });
    return response.data;
  },

  async createSchedule(
    payload: ReportScheduleRequest,
    suppressError?: boolean,
  ): Promise<ReportScheduleResponse> {
    const response: AxiosResponse<ReportScheduleResponse> = await http.post(
      '/reports/schedule',
      payload,
      {
        notificationConfig: buildNotificationConfig(suppressError),
      },
    );
    return response.data;
  },

  async deleteSchedule(id: string, suppressError?: boolean): Promise<void> {
    await http.delete(`/reports/schedule/${id}`, {
      notificationConfig: buildNotificationConfig(suppressError),
    });
  },

  async downloadArtifact(id: string, suppressError?: boolean): Promise<Blob> {
    const response: AxiosResponse<Blob> = await http.get(`/reports/${id}/download`, {
      responseType: 'blob',
      notificationConfig: buildNotificationConfig(suppressError),
    });
    return response.data;
  },
};

export default ReportsService;
