'use client';

import { LogoutOutlined } from '@ant-design/icons';
import { Button, Layout, Tag, Typography } from 'antd';
import Image from 'next/image';
import njLogo from '@/assets/logo/NJPlastic-logo-a-128px.png';
import { LAYOUT } from '@/constants/ConstantsAndParams';
import { useLogout } from '@/hooks/useLogout';
import type { AppHeaderProps } from '@/models/interfaces/components/LayoutProps';
import type { Role } from '@/stores/useSessionStore';
import { njPalette } from '@/theme/njTheme';

export type { AppHeaderProps } from '@/models/interfaces/components/LayoutProps';

const { Header } = Layout;
const { Text } = Typography;
const { LABELS } = LAYOUT.HEADER;

const ROLE_LABELS: Record<Role, string> = {
  OPERATOR: LABELS.ROLE_OPERATOR,
  LEADER: LABELS.ROLE_LEADER,
  MANAGER: LABELS.ROLE_MANAGER,
  ADMIN: LABELS.ROLE_ADMIN,
};

/**
 * Authenticated header shared by every screen under (authenticated)/.
 * Shows the product mark on the left and the user identity plus logout
 * action on the right. Overrides the antd default `lineHeight: 64px` of
 * Layout.Header — multi-line content (avatar+title block, user+role
 * column) needs `normal` line-height to center properly inside the 64px
 * row instead of stacking outside the baseline.
 */
export function AppHeader({ user, role }: AppHeaderProps) {
  const { logout, loggingOut } = useLogout();

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        gap: 16,
        height: 64,
        lineHeight: 'normal',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Image
          src={njLogo}
          alt={LABELS.LOGO_TITLE}
          width={40}
          height={40}
          priority
          style={{ borderRadius: 8 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text style={{ color: '#fff', fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>
            {LABELS.LOGO_TITLE}
          </Text>
          <Text style={{ color: njPalette.bone, fontSize: 12, lineHeight: 1.2 }}>
            {LABELS.LOGO_SUBTITLE}
          </Text>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 2,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 500, lineHeight: 1.2 }}>{user.name}</Text>
          <Tag
            color={njPalette.cerulean}
            style={{ marginInlineEnd: 0, fontSize: 11, lineHeight: '18px' }}
          >
            {ROLE_LABELS[role]}
          </Tag>
        </div>
        <Button
          icon={<LogoutOutlined />}
          onClick={() => {
            void logout();
          }}
          loading={loggingOut}
          aria-label={LABELS.LOGOUT_BUTTON}
        >
          {LABELS.LOGOUT_BUTTON}
        </Button>
      </div>
    </Header>
  );
}
