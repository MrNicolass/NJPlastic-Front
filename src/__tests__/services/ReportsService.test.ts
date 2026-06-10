import { REPORTS_LIBRARY } from '@/constants/ConstantsAndParams';

jest.mock('@/services/AxiosConfigService', () => ({
  __esModule: true,
  http: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

import { http } from '@/services/AxiosConfigService';
import ReportsService from '@/services/ReportsService';

const mocked = http as unknown as { get: jest.Mock; post: jest.Mock; delete: jest.Mock };
const resolved = <T>(data: T) => Promise.resolve({ data });

describe('ReportsService', () => {
  beforeEach(() => {
    mocked.get.mockReset();
    mocked.post.mockReset();
    mocked.delete.mockReset();
  });

  it('listHistory_GETsReportsHistoryWithPagingAndFilters', async () => {
    mocked.get.mockReturnValueOnce(resolved({ content: [] }));

    await ReportsService.listHistory({ page: 0, size: 25 }, { type: 'SHIFT' });

    expect(mocked.get).toHaveBeenCalledWith('/reports/history', {
      params: { page: 0, size: 25, type: 'SHIFT' },
      notificationConfig: { key: REPORTS_LIBRARY.KEY, suppressErrorNotification: false },
    });
  });

  it('listSchedules_GETsReportsScheduleEndpoint', async () => {
    mocked.get.mockReturnValueOnce(resolved([]));

    await ReportsService.listSchedules();

    expect(mocked.get).toHaveBeenCalledWith('/reports/schedule', {
      notificationConfig: { key: REPORTS_LIBRARY.KEY, suppressErrorNotification: false },
    });
  });

  it('createSchedule_POSTsReportsSchedule', async () => {
    mocked.post.mockReturnValueOnce(resolved({ id: 's1' }));

    await ReportsService.createSchedule({
      type: 'SHIFT', cron: '0 0 7 * * *', deliveryEmail: 'm@x.dev', format: 'CSV',
    });

    expect(mocked.post.mock.calls[0][0]).toBe('/reports/schedule');
    expect(mocked.post.mock.calls[0][2].notificationConfig.key).toBe(REPORTS_LIBRARY.KEY);
  });

  it('deleteSchedule_DELETEsReportsScheduleById', async () => {
    mocked.delete.mockReturnValueOnce(Promise.resolve(undefined));

    await ReportsService.deleteSchedule('s1');

    expect(mocked.delete.mock.calls[0][0]).toBe('/reports/schedule/s1');
  });

  it('downloadArtifact_GETsReportsDownloadWithBlobResponseType', async () => {
    const blob = new Blob(['x']);
    mocked.get.mockReturnValueOnce(resolved(blob));

    const result = await ReportsService.downloadArtifact('h1');

    expect(mocked.get.mock.calls[0][0]).toBe('/reports/h1/download');
    expect(mocked.get.mock.calls[0][1].responseType).toBe('blob');
    expect(result).toBe(blob);
  });
});
