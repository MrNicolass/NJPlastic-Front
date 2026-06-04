import { MACHINES, REPORTS } from '@/constants/ConstantsAndParams';
import type { Schemas } from '@/api/types';

jest.mock('@/services/AxiosConfigService', () => ({
  __esModule: true,
  http: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

import { http } from '@/services/AxiosConfigService';
import MachineService from '@/services/MachineService';

const mockedHttp = http as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
};

const resolved = <T>(data: T) => Promise.resolve({ data });

describe('MachineService', () => {
  beforeEach(() => {
    mockedHttp.get.mockReset();
    mockedHttp.post.mockReset();
    mockedHttp.put.mockReset();
  });

  describe('listMachines', () => {
    it('GETs /machines with the machines notification key and returns the data array', async () => {
      const payload = [{ id: 'm1' }] as Schemas['MachineSummaryDTO'][];
      mockedHttp.get.mockReturnValueOnce(resolved(payload));

      const result = await MachineService.listMachines();

      expect(mockedHttp.get).toHaveBeenCalledWith('/machines', {
        notificationConfig: {
          key: MACHINES.KEY,
          suppressErrorNotification: false,
        },
      });
      expect(result).toBe(payload);
    });

    it('forwards suppressError=true into suppressErrorNotification', async () => {
      mockedHttp.get.mockReturnValueOnce(resolved([]));

      await MachineService.listMachines(true);

      expect(mockedHttp.get).toHaveBeenCalledWith('/machines', {
        notificationConfig: {
          key: MACHINES.KEY,
          suppressErrorNotification: true,
        },
      });
    });

    it('rethrows when the HTTP call fails', async () => {
      const failure = new Error('boom');
      mockedHttp.get.mockReturnValueOnce(Promise.reject(failure));

      await expect(MachineService.listMachines()).rejects.toBe(failure);
    });
  });

  describe('getStatus', () => {
    it('GETs /machines/{id}/status with the window params', async () => {
      const payload = { state: 'RUNNING' } as unknown as Schemas['MachineStatusResponseDTO'];
      mockedHttp.get.mockReturnValueOnce(resolved(payload));

      const result = await MachineService.getStatus('m1', 'from-iso', 'to-iso', false);

      expect(mockedHttp.get).toHaveBeenCalledWith('/machines/m1/status', {
        params: { from: 'from-iso', to: 'to-iso' },
        notificationConfig: {
          key: MACHINES.KEY,
          suppressErrorNotification: false,
        },
      });
      expect(result).toBe(payload);
    });
  });

  describe('getCycles', () => {
    it('GETs /machines/{id}/cycles with the pagination params', async () => {
      const page = { content: [], totalElements: 0 } as unknown as Awaited<
        ReturnType<typeof MachineService.getCycles>
      >;
      mockedHttp.get.mockReturnValueOnce(resolved(page));

      const result = await MachineService.getCycles(
        { page: 1, size: 25, sort: 'pulseTimestamp,desc' },
        'm2',
        true,
      );

      expect(mockedHttp.get).toHaveBeenCalledWith('/machines/m2/cycles', {
        params: { page: 1, size: 25, sort: 'pulseTimestamp,desc' },
        notificationConfig: {
          key: MACHINES.KEY,
          suppressErrorNotification: true,
        },
      });
      expect(result).toBe(page);
    });
  });

  describe('registerPause', () => {
    it('POSTs /machines/{id}/pauses with the reason body and the PAUSE_CLASSIFIED success copy', async () => {
      const payload = { id: 'entry' } as unknown as Schemas['MachineStatusEntryDTO'];
      mockedHttp.post.mockReturnValueOnce(resolved(payload));

      const result = await MachineService.registerPause('m1', 'maintenance');

      expect(mockedHttp.post).toHaveBeenCalledWith(
        '/machines/m1/pauses',
        { reason: 'maintenance' },
        {
          notificationConfig: {
            key: MACHINES.KEY,
            suppressErrorNotification: false,
            successMessage: MACHINES.NOTIFICATIONS.SUCCESS.TITLES.PAUSE_CLASSIFIED,
            successDescription: MACHINES.NOTIFICATIONS.SUCCESS.MESSAGES.PAUSE_CLASSIFIED,
          },
        },
      );
      expect(result).toBe(payload);
    });
  });

  describe('editStopMessage', () => {
    it('PUTs /machines/{id}/stops/{stopId}/message with the new message and STOP_MESSAGE_UPDATED success copy', async () => {
      const payload = { id: 'entry' } as unknown as Schemas['MachineStatusEntryDTO'];
      mockedHttp.put.mockReturnValueOnce(resolved(payload));

      const result = await MachineService.editStopMessage('m1', 's1', 'fixed', true);

      expect(mockedHttp.put).toHaveBeenCalledWith(
        '/machines/m1/stops/s1/message',
        { message: 'fixed' },
        {
          notificationConfig: {
            key: MACHINES.KEY,
            suppressErrorNotification: true,
            successMessage: MACHINES.NOTIFICATIONS.SUCCESS.TITLES.STOP_MESSAGE_UPDATED,
            successDescription: MACHINES.NOTIFICATIONS.SUCCESS.MESSAGES.STOP_MESSAGE_UPDATED,
          },
        },
      );
      expect(result).toBe(payload);
    });
  });

  describe('getOee', () => {
    it('GETs /machines/{id}/oee with from/to params', async () => {
      const payload = { availability: 0.9 } as unknown as Schemas['OeeResultDTO'];
      mockedHttp.get.mockReturnValueOnce(resolved(payload));

      const result = await MachineService.getOee('m1', 'from', 'to');

      expect(mockedHttp.get).toHaveBeenCalledWith('/machines/m1/oee', {
        params: { from: 'from', to: 'to' },
        notificationConfig: {
          key: MACHINES.KEY,
          suppressErrorNotification: false,
        },
      });
      expect(result).toBe(payload);
    });
  });

  describe('registerQuality', () => {
    it('POSTs /machines/{id}/quality with the request body and QUALITY_REGISTERED success copy', async () => {
      const request = { good: 10, total: 12 } as unknown as Schemas['QualityRegistrationRequestDTO'];
      const payload = { id: 'q1' } as unknown as Schemas['QualityRecord'];
      mockedHttp.post.mockReturnValueOnce(resolved(payload));

      const result = await MachineService.registerQuality('m1', request, false);

      expect(mockedHttp.post).toHaveBeenCalledWith('/machines/m1/quality', request, {
        notificationConfig: {
          key: MACHINES.KEY,
          suppressErrorNotification: false,
          successMessage: MACHINES.NOTIFICATIONS.SUCCESS.TITLES.QUALITY_REGISTERED,
          successDescription: MACHINES.NOTIFICATIONS.SUCCESS.MESSAGES.QUALITY_REGISTERED,
        },
      });
      expect(result).toBe(payload);
    });
  });

  describe('getShiftReport', () => {
    it('GETs /reports/shift with all four query params and the REPORTS key', async () => {
      const payload = {
        confirmedCycles: 0,
      } as unknown as Schemas['ShiftReportResponseDTO'];
      mockedHttp.get.mockReturnValueOnce(resolved(payload));

      const result = await MachineService.getShiftReport(
        'from',
        'to',
        'INJECTION',
        'A',
        false,
      );

      expect(mockedHttp.get).toHaveBeenCalledWith('/reports/shift', {
        params: { from: 'from', to: 'to', sector: 'INJECTION', shift: 'A' },
        notificationConfig: {
          key: REPORTS.KEY,
          suppressErrorNotification: false,
        },
      });
      expect(result).toBe(payload);
    });

    it('passes undefined sector/shift through unchanged', async () => {
      mockedHttp.get.mockReturnValueOnce(
        resolved({} as unknown as Schemas['ShiftReportResponseDTO']),
      );

      await MachineService.getShiftReport('from', 'to', undefined, undefined, true);

      expect(mockedHttp.get).toHaveBeenCalledWith('/reports/shift', {
        params: { from: 'from', to: 'to', sector: undefined, shift: undefined },
        notificationConfig: {
          key: REPORTS.KEY,
          suppressErrorNotification: true,
        },
      });
    });
  });
});
