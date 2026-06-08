'use client';

import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';
import { AUTH } from '@/constants/ConstantsAndParams';
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/constants/Routes';

export default function ForbiddenPage() {
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
        status="403"
        title="403"
        subTitle={AUTH.ERROR_PAGES.FORBIDDEN.MESSAGE}
        extra={
          <Button type="primary" onClick={() => router.replace(DEFAULT_AUTHENTICATED_ROUTE)}>
            {AUTH.ERROR_PAGES.FORBIDDEN.BUTTON}
          </Button>
        }
      />
    </div>
  );
}
