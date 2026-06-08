'use client';

import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';
import { AUTH } from '@/constants/ConstantsAndParams';

export default function UnauthorizedPage() {
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
        status="warning"
        title="401"
        subTitle={AUTH.ERROR_PAGES.UNAUTHORIZED.MESSAGE}
        extra={
          <Button type="primary" onClick={() => router.replace('/login')}>
            {AUTH.ERROR_PAGES.UNAUTHORIZED.BUTTON}
          </Button>
        }
      />
    </div>
  );
}
