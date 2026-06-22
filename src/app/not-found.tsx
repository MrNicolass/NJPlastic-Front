'use client';

import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';
import { NOT_FOUND } from '@/constants/ConstantsAndParams';

/**
 * Global 404 handler reached by any route the Next.js router cannot match.
 * Authenticated users land back on /dashboard (which routes by role);
 * unauthenticated users are bounced to /login by the middleware on the
 * next navigation.
 */
export default function NotFoundPage() {
  const router = useRouter();
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      <Result
        status="404"
        title={NOT_FOUND.TITLE}
        subTitle={NOT_FOUND.SUBTITLE}
        extra={
          <Button type="primary" onClick={() => router.replace('/dashboard')}>
            {NOT_FOUND.BACK_TO_DASHBOARD}
          </Button>
        }
      >
        {NOT_FOUND.DESCRIPTION}
      </Result>
    </div>
  );
}
