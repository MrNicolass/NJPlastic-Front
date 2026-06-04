import { GENERIC_NOTIFICATIONS } from '@/constants/ConstantsAndParams';
import { NotificationUtils } from '@/utils/NotificationUtils';

jest.mock('antd', () => {
  const notification = {
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    destroy: jest.fn(),
  };
  return { __esModule: true, notification };
});

import { notification } from 'antd';

const mockedNotification = notification as unknown as {
  success: jest.Mock;
  info: jest.Mock;
  warning: jest.Mock;
  error: jest.Mock;
  destroy: jest.Mock;
};

const placement = GENERIC_NOTIFICATIONS.CONFIGS.PLACEMENT;
const duration = GENERIC_NOTIFICATIONS.CONFIGS.DURATION;

describe('NotificationUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('emits a success notification with explicit fields and destroys the previous key', () => {
    NotificationUtils({
      key: 'auth-login-success',
      type: 'success',
      message: 'Sessao iniciada',
      description: 'Bem-vindo de volta.',
    });

    expect(mockedNotification.destroy).toHaveBeenCalledWith('auth-login-success');
    expect(mockedNotification.success).toHaveBeenCalledWith({
      key: 'auth-login-success',
      message: 'Sessao iniciada',
      description: 'Bem-vindo de volta.',
      placement,
      duration,
    });
  });

  it('does not destroy when no key is provided', () => {
    NotificationUtils({ type: 'info', message: 'Hello' });

    expect(mockedNotification.destroy).not.toHaveBeenCalled();
    expect(mockedNotification.info).toHaveBeenCalledWith({
      key: undefined,
      message: 'Hello',
      description: undefined,
      placement,
      duration,
    });
  });

  it('maps SESSION_EXPIRED defaultType to a warning with the catalogue values', () => {
    NotificationUtils({ defaultType: 'SESSION_EXPIRED' });

    expect(mockedNotification.destroy).toHaveBeenCalledWith(
      GENERIC_NOTIFICATIONS.KEYS.SESSION_EXPIRED,
    );
    expect(mockedNotification.warning).toHaveBeenCalledWith({
      key: GENERIC_NOTIFICATIONS.KEYS.SESSION_EXPIRED,
      message: GENERIC_NOTIFICATIONS.TITLES.SESSION_EXPIRED,
      description: GENERIC_NOTIFICATIONS.MESSAGES.SESSION_EXPIRED,
      placement,
      duration,
    });
  });

  it.each([
    ['UNAUTHORIZED', 'error'],
    ['INTERNAL_SERVER_ERROR', 'error'],
    ['GENERIC_ERROR', 'error'],
  ] as const)('maps %s defaultType to %s', (defaultType, kind) => {
    NotificationUtils({ defaultType });

    expect(mockedNotification[kind]).toHaveBeenCalledWith({
      key: GENERIC_NOTIFICATIONS.KEYS[defaultType],
      message: GENERIC_NOTIFICATIONS.TITLES[defaultType],
      description: GENERIC_NOTIFICATIONS.MESSAGES[defaultType],
      placement,
      duration,
    });
  });

  it('lets explicit overrides win against defaultType fallbacks', () => {
    NotificationUtils({
      key: 'custom-key',
      type: 'info',
      message: 'Custom title',
      description: 'Custom description',
      defaultType: 'SESSION_EXPIRED',
    });

    expect(mockedNotification.destroy).toHaveBeenCalledWith('custom-key');
    expect(mockedNotification.warning).not.toHaveBeenCalled();
    expect(mockedNotification.info).toHaveBeenCalledWith({
      key: 'custom-key',
      message: 'Custom title',
      description: 'Custom description',
      placement,
      duration,
    });
  });

  it('falls back to the info kind and empty message when nothing is supplied', () => {
    NotificationUtils({});

    expect(mockedNotification.destroy).not.toHaveBeenCalled();
    expect(mockedNotification.info).toHaveBeenCalledWith({
      key: undefined,
      message: '',
      description: undefined,
      placement,
      duration,
    });
  });

});
