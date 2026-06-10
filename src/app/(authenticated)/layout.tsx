'use client';

import { Layout } from 'antd';
import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSider } from '@/components/layout/AppSider';
import { GlobalErrorBoundary } from '@/components/shared/GlobalErrorBoundary';
import { DashboardSkeleton } from '@/components/shared/Skeletons';
import { useSessionStore } from '@/stores/useSessionStore';
import { njPalette } from '@/theme/njTheme';

const { Content } = Layout;

/**
 * Shared shell for every route under (authenticated)/. The middleware
 * (middleware.ts) already enforces authentication and role-based access
 * server-side, so this layout only renders the chrome and gates content
 * on the session being hydrated. While the Zustand store is empty (the
 * brief window between an Edge-validated cookie and the Providers hook
 * calling GET /auth/me) it shows a dashboard skeleton instead of a flash
 * of empty chrome. A GlobalErrorBoundary wraps the chrome to keep render
 * failures from unmounting the navigation.
 */
export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const user = useSessionStore((state) => state.user);
  const role = useSessionStore((state) => state.role);

  if (!user || !role) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: 24 }}>
          <DashboardSkeleton />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader user={user} role={role} />
      <Layout>
        <AppSider role={role} />
        <Content style={{ padding: 24, background: njPalette.bone }}>
          <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
}
