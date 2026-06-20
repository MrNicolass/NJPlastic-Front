import { render, screen } from '@testing-library/react';

jest.mock('@/components/layout/AppHeader', () => ({
  __esModule: true,
  AppHeader: () => <div data-testid="app-header" />,
}));

jest.mock('@/components/layout/AppSider', () => ({
  __esModule: true,
  AppSider: () => <div data-testid="app-sider" />,
}));

jest.mock('@/components/shared/GlobalErrorBoundary', () => ({
  __esModule: true,
  GlobalErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

jest.mock('@/components/shared/Skeletons', () => ({
  __esModule: true,
  DashboardSkeleton: () => <div data-testid="dashboard-skeleton" />,
}));

import AuthenticatedLayout from '@/app/(authenticated)/layout';
import { useSessionStore } from '@/stores/useSessionStore';

describe('AuthenticatedLayout', () => {
  beforeEach(() => {
    useSessionStore.setState({ user: null, role: null, expiresAt: null });
  });

  it('renders the dashboard skeleton while the session is not yet hydrated', () => {
    render(
      <AuthenticatedLayout>
        <span data-testid="child">payload</span>
      </AuthenticatedLayout>,
    );

    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('app-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('renders the chrome with header, sider and error boundary once hydrated', () => {
    useSessionStore.setState({
      user: { id: 'u', name: 'name', login: 'login' },
      role: 'OPERATOR',
      expiresAt: 0,
    });

    render(
      <AuthenticatedLayout>
        <span data-testid="child">payload</span>
      </AuthenticatedLayout>,
    );

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('app-sider')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('payload');
  });
});
