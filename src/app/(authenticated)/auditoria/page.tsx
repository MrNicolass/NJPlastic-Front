'use client';

import { Space, Typography } from 'antd';
import { AuditLogsTab } from '@/components/manager/AuditLogsTab';
import { AUDIT } from '@/constants/ConstantsAndParams';

const { Title, Text } = Typography;

/**
 * Standalone /auditoria route reusing the AuditLogsTab component.
 * The Reports screen renders the same component inside a tab, so the
 * Manager can reach it from either entry point without duplicated
 * logic.
 */
export default function AuditoriaPage() {
  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <header>
        <Title level={3} style={{ marginBottom: 4 }}>
          {AUDIT.PAGE.TITLE}
        </Title>
        <Text type="secondary">{AUDIT.PAGE.SUBTITLE}</Text>
      </header>
      <AuditLogsTab />
    </Space>
  );
}
