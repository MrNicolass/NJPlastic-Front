import { act, renderHook } from '@testing-library/react';

const pushMock = jest.fn();
const replaceMock = jest.fn();
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: pushMock, replace: replaceMock, back: jest.fn(), refresh: jest.fn() }),
}));

const logoutMock = jest.fn();
jest.mock('@/services/AuthService', () => ({
  __esModule: true,
  default: { logout: (...args: unknown[]) => logoutMock(...args) },
}));

const clearMock = jest.fn();
jest.mock('@/stores/useSessionStore', () => ({
  __esModule: true,
  useSessionStore: <T,>(selector: (state: { clear: typeof clearMock }) => T): T =>
    selector({ clear: clearMock }),
}));

import { useLogout } from '@/hooks/useLogout';

describe('useLogout', () => {
  beforeEach(() => {
    pushMock.mockReset();
    replaceMock.mockReset();
    logoutMock.mockReset();
    clearMock.mockReset();
  });

  it('callsAuthServiceLogoutClearsSessionAndRedirectsOnSuccess', async () => {
    logoutMock.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useLogout());

    expect(result.current.loggingOut).toBe(false);

    await act(async () => {
      await result.current.logout();
    });

    expect(logoutMock).toHaveBeenCalledWith(true);
    expect(clearMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith('/login');
    expect(result.current.loggingOut).toBe(false);
  });

  it('stillClearsSessionAndRedirectsWhenLogoutCallFails', async () => {
    logoutMock.mockRejectedValueOnce(new Error('boom'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(clearMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith('/login');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
