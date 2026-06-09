'use client';

import { Empty, Typography } from 'antd';
import { MANAGER_DASHBOARD } from '@/constants/ConstantsAndParams';

const { Title, Text } = Typography;

/**
 * Holder rendered on /dashboard when the authenticated role is MANAGER or
 * ADMIN. The real Manager dashboard ships with EP-FE-06; until then this
 * keeps /dashboard navigable and points readers at the existing
 * administrative screens.
 */
export function ManagerDashboardPlaceholder() {
  return (
    <Empty
      description={
        <>
          <Title level={4} style={{ marginBottom: 8 }}>
            {MANAGER_DASHBOARD.LABELS.PLACEHOLDER_TITLE}
          </Title>
          <Text type="secondary">{MANAGER_DASHBOARD.LABELS.PLACEHOLDER_DESCRIPTION}</Text>
        </>
      }
    />
  );
}
