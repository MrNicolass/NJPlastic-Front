'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { njTheme } from '@/theme/njTheme';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={njTheme}>{children}</ConfigProvider>
    </AntdRegistry>
  );
}
