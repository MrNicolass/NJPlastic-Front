import { AUDIT } from '@/constants/ConstantsAndParams';

jest.mock('@/services/AxiosConfigService', () => ({
  __esModule: true,
  http: { get: jest.fn() },
}));

import { http } from '@/services/AxiosConfigService';
import AuditLogService from '@/services/AuditLogService';

const mockedGet = (http as unknown as { get: jest.Mock }).get;

describe('AuditLogService', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('list_forwardsPageableAndFiltersAsQueryParams', async () => {
    mockedGet.mockResolvedValueOnce({ data: { content: [], totalElements: 0 } });

    await AuditLogService.list(
      { page: 1, size: 25 },
      { userId: 'u1', endpoint: '/auth', method: 'POST' },
    );

    expect(mockedGet).toHaveBeenCalledWith('/audit-logs', {
      params: { page: 1, size: 25, userId: 'u1', endpoint: '/auth', method: 'POST' },
      notificationConfig: { key: AUDIT.KEY, suppressErrorNotification: false },
    });
  });

  it('list_setsSuppressErrorNotificationWhenAsked', async () => {
    mockedGet.mockResolvedValueOnce({ data: { content: [] } });

    await AuditLogService.list({ page: 0, size: 10 }, undefined, true);

    expect(mockedGet.mock.calls[0][1].notificationConfig.suppressErrorNotification).toBe(true);
  });

  it('list_rethrowsTheErrorRaisedByAxios', async () => {
    const failure = new Error('boom');
    mockedGet.mockRejectedValueOnce(failure);

    await expect(AuditLogService.list({ page: 0, size: 10 })).rejects.toBe(failure);
  });
});
