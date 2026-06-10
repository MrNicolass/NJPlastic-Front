import { USERS } from '@/constants/ConstantsAndParams';

jest.mock('@/services/AxiosConfigService', () => ({
  __esModule: true,
  http: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

import { http } from '@/services/AxiosConfigService';
import UserService from '@/services/UserService';

const mocked = http as unknown as {
  get: jest.Mock; post: jest.Mock; put: jest.Mock; delete: jest.Mock;
};
const resolved = <T>(data: T) => Promise.resolve({ data });

describe('UserService', () => {
  beforeEach(() => {
    mocked.get.mockReset();
    mocked.post.mockReset();
    mocked.put.mockReset();
    mocked.delete.mockReset();
  });

  it('list_forwardsPageableAndFiltersAndUsesUsersNotificationKey', async () => {
    mocked.get.mockReturnValueOnce(resolved({ content: [] }));

    await UserService.list({ page: 1, size: 25 }, { active: true, role: 'OPERATOR' });

    expect(mocked.get).toHaveBeenCalledWith('/users', {
      params: { page: 1, size: 25, active: true, role: 'OPERATOR' },
      notificationConfig: { key: USERS.KEY, suppressErrorNotification: false },
    });
  });

  it('getById_GETsTheRightPath', async () => {
    mocked.get.mockReturnValueOnce(resolved({ id: 'u1' }));

    await UserService.getById('u1');

    expect(mocked.get).toHaveBeenCalledWith('/users/u1', {
      notificationConfig: { key: USERS.KEY, suppressErrorNotification: false },
    });
  });

  it('create_includesCreatedSuccessTexts', async () => {
    mocked.post.mockReturnValueOnce(resolved({ id: 'u2' }));

    await UserService.create({ login: 'newuser', name: 'New User', email: 'x@y.dev',
        password: 'minimum-12-chars', role: 'OPERATOR' });

    expect(mocked.post.mock.calls[0][2].notificationConfig).toMatchObject({
      successMessage: USERS.NOTIFICATIONS.SUCCESS.TITLES.CREATED,
      successDescription: USERS.NOTIFICATIONS.SUCCESS.MESSAGES.CREATED,
    });
  });

  it('update_includesUpdatedSuccessTexts', async () => {
    mocked.put.mockReturnValueOnce(resolved({ id: 'u1' }));

    await UserService.update('u1', { name: 'X' });

    expect(mocked.put.mock.calls[0][0]).toBe('/users/u1');
    expect(mocked.put.mock.calls[0][2].notificationConfig).toMatchObject({
      successMessage: USERS.NOTIFICATIONS.SUCCESS.TITLES.UPDATED,
    });
  });

  it('softDelete_includesDeactivatedTextsAndDELETEs', async () => {
    mocked.delete.mockReturnValueOnce(Promise.resolve(undefined));

    await UserService.softDelete('u1');

    expect(mocked.delete.mock.calls[0][0]).toBe('/users/u1');
    expect(mocked.delete.mock.calls[0][1].notificationConfig).toMatchObject({
      successMessage: USERS.NOTIFICATIONS.SUCCESS.TITLES.DEACTIVATED,
    });
  });
});
