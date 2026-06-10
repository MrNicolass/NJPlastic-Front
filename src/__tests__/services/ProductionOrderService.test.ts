import { ORDERS } from '@/constants/ConstantsAndParams';

jest.mock('@/services/AxiosConfigService', () => ({
  __esModule: true,
  http: { get: jest.fn() },
}));

import { http } from '@/services/AxiosConfigService';
import ProductionOrderService from '@/services/ProductionOrderService';

const mockedGet = (http as unknown as { get: jest.Mock }).get;
const resolved = <T>(data: T) => Promise.resolve({ data });

describe('ProductionOrderService', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('list_GETsProductionOrdersWithPageAndFilters', async () => {
    mockedGet.mockReturnValueOnce(resolved({ content: [] }));

    await ProductionOrderService.list(
      { page: 0, size: 50 },
      { status: 'OPEN', machineId: 'm1', from: '2026-06-09', to: '2026-06-10' },
    );

    expect(mockedGet).toHaveBeenCalledWith('/production-orders', {
      params: { page: 0, size: 50, status: 'OPEN', machineId: 'm1',
        from: '2026-06-09', to: '2026-06-10' },
      notificationConfig: { key: ORDERS.KEY, suppressErrorNotification: false },
    });
  });

  it('getSummary_GETsTheSummaryEndpoint', async () => {
    mockedGet.mockReturnValueOnce(resolved({ inProd: 1, queued: 2, overdue: 3, completed: 4 }));

    await ProductionOrderService.getSummary();

    expect(mockedGet).toHaveBeenCalledWith('/production-orders/summary', {
      notificationConfig: { key: ORDERS.KEY, suppressErrorNotification: false },
    });
  });

  it('rethrows the axios error', async () => {
    const boom = new Error('boom');
    mockedGet.mockRejectedValueOnce(boom);

    await expect(ProductionOrderService.list({ page: 0, size: 10 }, {})).rejects.toBe(boom);
  });
});
