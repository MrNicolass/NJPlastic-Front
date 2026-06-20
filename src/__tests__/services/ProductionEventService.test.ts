import { EVENTS } from '@/constants/ConstantsAndParams';

jest.mock('@/services/AxiosConfigService', () => ({
  __esModule: true,
  http: { get: jest.fn(), post: jest.fn() },
}));

import { http } from '@/services/AxiosConfigService';
import ProductionEventService from '@/services/ProductionEventService';

const mocked = http as unknown as { get: jest.Mock; post: jest.Mock };
const resolved = <T>(data: T) => Promise.resolve({ data });

describe('ProductionEventService', () => {
  beforeEach(() => {
    mocked.get.mockReset();
    mocked.post.mockReset();
  });

  it('registerEvent_POSTsEventsAndIncludesRegisteredSuccessTexts', async () => {
    mocked.post.mockReturnValueOnce(resolved({ id: 'e1' }));

    await ProductionEventService.registerEvent({
      machineId: 'm1', type: 'TRAINING',
      startedAt: '2026-06-10T10:00:00Z', endedAt: '2026-06-10T11:00:00Z',
    });

    expect(mocked.post.mock.calls[0][0]).toBe('/events');
    expect(mocked.post.mock.calls[0][2].notificationConfig).toMatchObject({
      successMessage: EVENTS.NOTIFICATIONS.SUCCESS.TITLES.REGISTERED,
      successDescription: EVENTS.NOTIFICATIONS.SUCCESS.MESSAGES.REGISTERED,
    });
  });

  it('listForMachine_GETsTheMachineEventsEndpointWithRangeFilters', async () => {
    mocked.get.mockReturnValueOnce(resolved({ content: [] }));

    await ProductionEventService.listForMachine({ page: 0, size: 20 }, 'm1',
        '2026-06-09', '2026-06-10');

    expect(mocked.get).toHaveBeenCalledWith('/machines/m1/events', {
      params: { page: 0, size: 20, from: '2026-06-09', to: '2026-06-10' },
      notificationConfig: { key: EVENTS.KEY, suppressErrorNotification: false },
    });
  });

  it('findRecent_GETsTheRecentEventsEndpointWithPageable', async () => {
    mocked.get.mockReturnValueOnce(resolved({ content: [], totalElements: 0 }));

    await ProductionEventService.findRecent({ page: 0, size: 6 }, undefined, undefined);

    expect(mocked.get).toHaveBeenCalledWith('/events/recent', {
      params: { page: 0, size: 6, from: undefined, to: undefined },
      notificationConfig: { key: EVENTS.KEY, suppressErrorNotification: false },
    });
  });
});
