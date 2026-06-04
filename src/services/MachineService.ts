import type { AxiosResponse } from 'axios';
import type { Schemas } from '@/api/types';
import { MACHINES, REPORTS } from '@/constants/ConstantsAndParams';
import type { IMachineService } from '@/models/interfaces/services/IMachineService';
import type { Page } from '@/models/types/Page';
import type { PageParams } from '@/models/types/PageParams';
import type { ProductionCycleResponse } from '@/models/types/ProductionCycleResponse';
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

const MachineService: IMachineService = {
  async listMachines(suppressError?: boolean): Promise<Schemas['MachineSummaryDTO'][]> {
    try {
      const response: AxiosResponse<Schemas['MachineSummaryDTO'][]> = await http.get(
        '/machines',
        { notificationConfig: buildNotificationConfig(MACHINES.KEY, suppressError) },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getStatus(
    machineId: string,
    from: string,
    to: string,
    suppressError?: boolean,
  ): Promise<Schemas['MachineStatusResponseDTO']> {
    try {
      const response: AxiosResponse<Schemas['MachineStatusResponseDTO']> = await http.get(
        `/machines/${machineId}/status`,
        {
          params: { from, to },
          notificationConfig: buildNotificationConfig(MACHINES.KEY, suppressError),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCycles(
    pageable: PageParams,
    machineId: string,
    suppressError?: boolean,
  ): Promise<Page<ProductionCycleResponse>> {
    try {
      const response: AxiosResponse<Page<ProductionCycleResponse>> =
        await http.get(`/machines/${machineId}/cycles`, {
          params: pageable,
          notificationConfig: buildNotificationConfig(MACHINES.KEY, suppressError),
        });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async registerPause(
    machineId: string,
    reason: string,
    suppressError?: boolean,
  ): Promise<Schemas['MachineStatusEntryDTO']> {
    try {
      const response: AxiosResponse<Schemas['MachineStatusEntryDTO']> = await http.post(
        `/machines/${machineId}/pauses`,
        { reason },
        {
          notificationConfig: buildNotificationConfig(MACHINES.KEY, suppressError, {
            successMessage: MACHINES.NOTIFICATIONS.SUCCESS.TITLES.PAUSE_CLASSIFIED,
            successDescription: MACHINES.NOTIFICATIONS.SUCCESS.MESSAGES.PAUSE_CLASSIFIED,
          }),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async editStopMessage(
    machineId: string,
    stopId: string,
    message: string,
    suppressError?: boolean,
  ): Promise<Schemas['MachineStatusEntryDTO']> {
    try {
      const response: AxiosResponse<Schemas['MachineStatusEntryDTO']> = await http.put(
        `/machines/${machineId}/stops/${stopId}/message`,
        { message },
        {
          notificationConfig: buildNotificationConfig(MACHINES.KEY, suppressError, {
            successMessage: MACHINES.NOTIFICATIONS.SUCCESS.TITLES.STOP_MESSAGE_UPDATED,
            successDescription: MACHINES.NOTIFICATIONS.SUCCESS.MESSAGES.STOP_MESSAGE_UPDATED,
          }),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getOee(
    machineId: string,
    from: string,
    to: string,
    suppressError?: boolean,
  ): Promise<Schemas['OeeResultDTO']> {
    try {
      const response: AxiosResponse<Schemas['OeeResultDTO']> = await http.get(
        `/machines/${machineId}/oee`,
        {
          params: { from, to },
          notificationConfig: buildNotificationConfig(MACHINES.KEY, suppressError),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async registerQuality(
    machineId: string,
    request: Schemas['QualityRegistrationRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['QualityRecord']> {
    try {
      const response: AxiosResponse<Schemas['QualityRecord']> = await http.post(
        `/machines/${machineId}/quality`,
        request,
        {
          notificationConfig: buildNotificationConfig(MACHINES.KEY, suppressError, {
            successMessage: MACHINES.NOTIFICATIONS.SUCCESS.TITLES.QUALITY_REGISTERED,
            successDescription: MACHINES.NOTIFICATIONS.SUCCESS.MESSAGES.QUALITY_REGISTERED,
          }),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getShiftReport(
    from: string,
    to: string,
    sector: string | undefined,
    shift: string | undefined,
    suppressError?: boolean,
  ): Promise<Schemas['ShiftReportResponseDTO']> {
    try {
      const response: AxiosResponse<Schemas['ShiftReportResponseDTO']> = await http.get(
        '/reports/shift',
        {
          params: { from, to, sector, shift },
          notificationConfig: buildNotificationConfig(REPORTS.KEY, suppressError),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default MachineService;
