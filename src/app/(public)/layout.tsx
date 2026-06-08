import type { ReactNode } from 'react';
import { njPalette } from '@/theme/njTheme';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        background: njPalette.bone,
      }}
    >
      {children}
    </main>
  );
}
