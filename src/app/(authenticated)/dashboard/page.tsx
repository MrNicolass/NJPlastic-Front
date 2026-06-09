'use client';

import { Card, Typography } from 'antd';
import { useSessionStore } from '@/stores/useSessionStore';

const { Title, Paragraph } = Typography;

/**
 * Placeholder rendered while EP-FE-04/05/06 deliver the real dashboard
 * variants per role. Exists only so EP-FE-03's authenticated shell can be
 * smoke-tested end-to-end without a 404 right after login.
 */
export default function DashboardPlaceholderPage() {
  const user = useSessionStore((state) => state.user);

  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        Ola, {user?.name ?? ''}
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 0 }}>
        O dashboard sera entregue pelos epicos EP-FE-04 (Operador), EP-FE-05 (Lider) e EP-FE-06
        (Gestor).
      </Paragraph>
    </Card>
  );
}
