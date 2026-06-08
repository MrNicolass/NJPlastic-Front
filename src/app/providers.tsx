'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { useEffect, type ReactNode } from 'react';
import AuthService from '@/services/AuthService';
import { setupAxiosInterceptors } from '@/services/AxiosConfigService';
import { useSessionStore } from '@/stores/useSessionStore';
import { njTheme } from '@/theme/njTheme';
import { readAccessTokenExpSeconds } from '@/utils/CookieUtils';

const hydrateSessionFromCookie = async (): Promise<void> => {
  const expSeconds = readAccessTokenExpSeconds();
  if (expSeconds === null) {
    return;
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (expSeconds <= nowSeconds) {
    return;
  }
  if (useSessionStore.getState().user) {
    return;
  }
  try {
    const user = await AuthService.me(true);
    useSessionStore.getState().setSession({
      user: { id: user.id, name: user.name, login: user.login },
      role: user.role,
      expiresAt: expSeconds * 1000,
    });
  } catch {
    useSessionStore.getState().clear();
  }
};

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
    void hydrateSessionFromCookie();
  }, []);

  return (
    <AntdRegistry>
      <ConfigProvider theme={njTheme}>{children}</ConfigProvider>
    </AntdRegistry>
  );
}
