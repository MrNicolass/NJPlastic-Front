import { render, screen } from '@testing-library/react';

jest.mock('@/services/AxiosConfigService', () => ({
  __esModule: true,
  setupAxiosInterceptors: jest.fn(),
}));

jest.mock('@ant-design/nextjs-registry', () => ({
  __esModule: true,
  AntdRegistry: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="antd-registry">{children}</div>
  ),
}));

jest.mock('antd', () => ({
  __esModule: true,
  ConfigProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="config-provider">{children}</div>
  ),
}));

import { setupAxiosInterceptors } from '@/services/AxiosConfigService';
import { Providers } from '@/app/providers';
import { useSessionStore } from '@/stores/useSessionStore';

const mockedSetup = setupAxiosInterceptors as jest.Mock;

type JsdomConsole = {
  on: (event: string, cb: (...args: unknown[]) => void) => void;
  off: (event: string, cb: (...args: unknown[]) => void) => void;
};

const getVirtualConsole = (): JsdomConsole | null => {
  const candidate = (window as unknown as { _virtualConsole?: unknown })._virtualConsole;
  if (
    candidate &&
    typeof (candidate as { on?: unknown }).on === 'function' &&
    typeof (candidate as { off?: unknown }).off === 'function'
  ) {
    return candidate as JsdomConsole;
  }
  return null;
};

const captureNavigationErrors = (): { dispose: () => void; navigations: unknown[] } => {
  const navigations: unknown[] = [];
  const console = getVirtualConsole();
  if (!console) {
    return { dispose: () => {}, navigations };
  }
  const handler = (error: unknown) => {
    const msg = (error as Error)?.message ?? '';
    if (typeof msg === 'string' && msg.includes('navigation')) {
      navigations.push(error);
    }
  };
  console.on('jsdomError', handler);
  return {
    dispose: () => console.off('jsdomError', handler),
    navigations,
  };
};

describe('Providers', () => {
  const setPathname = (pathname: string) => {
    window.history.replaceState({}, '', pathname);
  };

  beforeEach(() => {
    mockedSetup.mockClear();
    useSessionStore.setState({
      user: { id: 'u', name: 'name', login: 'login' },
      role: 'OPERATOR',
      expiresAt: 0,
    });
  });

  afterEach(() => {
    setPathname('/');
  });

  it('renders children wrapped in the AntdRegistry and ConfigProvider', () => {
    render(
      <Providers>
        <span data-testid="child">hello</span>
      </Providers>,
    );

    expect(screen.getByTestId('antd-registry')).toBeInTheDocument();
    expect(screen.getByTestId('config-provider')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('hello');
  });

  it('installs the Axios interceptors on mount with an onUnauthorized callback', () => {
    render(
      <Providers>
        <span />
      </Providers>,
    );

    expect(mockedSetup).toHaveBeenCalledTimes(1);
    expect(mockedSetup.mock.calls[0][0]).toEqual(
      expect.objectContaining({ onUnauthorized: expect.any(Function) }),
    );
  });

  it('clears the session store when the unauthorized callback fires', () => {
    setPathname('/login');

    render(
      <Providers>
        <span />
      </Providers>,
    );

    const { onUnauthorized } = mockedSetup.mock.calls[0][0];
    onUnauthorized();

    expect(useSessionStore.getState().user).toBeNull();
    expect(useSessionStore.getState().role).toBeNull();
    expect(useSessionStore.getState().expiresAt).toBeNull();
  });

  it('attempts to navigate to /login when the unauthorized callback fires off the login page', () => {
    setPathname('/dashboard');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const capture = captureNavigationErrors();

    render(
      <Providers>
        <span />
      </Providers>,
    );

    try {
      const { onUnauthorized } = mockedSetup.mock.calls[0][0];
      onUnauthorized();
    } finally {
      capture.dispose();
      consoleSpy.mockRestore();
    }

    expect(capture.navigations.length).toBeGreaterThanOrEqual(1);
  });

  it('does not attempt to navigate when the unauthorized callback fires on the login page', () => {
    setPathname('/login');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const capture = captureNavigationErrors();

    render(
      <Providers>
        <span />
      </Providers>,
    );

    try {
      const { onUnauthorized } = mockedSetup.mock.calls[0][0];
      onUnauthorized();
    } finally {
      capture.dispose();
      consoleSpy.mockRestore();
    }

    expect(capture.navigations).toHaveLength(0);
  });
});
