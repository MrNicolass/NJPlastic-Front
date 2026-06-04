'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { useEffect, type ReactNode } from 'react';
import { setupAxiosInterceptors } from '@/services/AxiosConfigService';
import { useSessionStore } from '@/stores/useSessionStore';
import { njTheme } from '@/theme/njTheme';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    setupAxiosInterceptors({
      onUnauthorized: () => {
        useSessionStore.getState().clear();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      },
    });
  }, []);

  return (
    <AntdRegistry>
      <ConfigProvider theme={njTheme}>{children}</ConfigProvider>
    </AntdRegistry>
  );
}
