'use client';

import { LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { Button, Layout, Tag, Typography } from 'antd';
import Image from 'next/image';
import njLogo from '@/assets/logo/NJPlastic-logo-a-128px.png';
import { LAYOUT } from '@/constants/ConstantsAndParams';
import { useLogout } from '@/hooks/useLogout';
import { useResponsive } from '@/hooks/useResponsive';
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
};

/**
 * Authenticated header shared by every screen under (authenticated)/.
 * Shows the product mark on the left and the user identity plus logout
 * action on the right. Overrides the antd default `lineHeight: 64px` of
 * Layout.Header — multi-line content (avatar+title block, user+role
 * column) needs `normal` line-height to center properly inside the 64px
 * row instead of stacking outside the baseline. On mobile (`< md`) the
 * hamburger button on the leading edge opens the navigation Drawer
 * rendered by AppSider; subtitle and user name collapse to free up
 * horizontal space.
 */
export function AppHeader({
  user,
  role,
  mobileNavOpen,
  onMobileNavOpenChange,
}: AppHeaderProps) {
  const { logout, loggingOut } = useLogout();
  const { isMobile } = useResponsive();
  const showHamburger = isMobile && role !== 'OPERATOR';

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${isMobile ? 12 : 24}px`,
        gap: isMobile ? 8 : 16,
        height: 64,
        lineHeight: 'normal',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 8 : 12,
          minWidth: 0,
        }}
      >
        {showHamburger ? (
          <Button
            type="text"
            icon={<MenuOutlined style={{ color: '#fff', fontSize: 20 }} />}
            onClick={() => onMobileNavOpenChange?.(!mobileNavOpen)}
            aria-label={mobileNavOpen ? LABELS.MOBILE_NAV_CLOSE : LABELS.MOBILE_NAV_OPEN}
          />
        ) : null}
        <Image
          src={njLogo}
          alt={LABELS.LOGO_TITLE}
          width={isMobile ? 32 : 40}
          height={isMobile ? 32 : 40}
          priority
          style={{ borderRadius: 8 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Text
            style={{
              color: '#fff',
              fontWeight: 600,
              fontSize: isMobile ? 14 : 16,
              lineHeight: 1.2,
            }}
          >
            {LABELS.LOGO_TITLE}
          </Text>
          {!isMobile ? (
            <Text style={{ color: njPalette.bone, fontSize: 12, lineHeight: 1.2 }}>
              {LABELS.LOGO_SUBTITLE}
            </Text>
          ) : null}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 8 : 12,
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 2,
            minWidth: 0,
          }}
        >
          {!isMobile ? (
            <Text style={{ color: '#fff', fontWeight: 500, lineHeight: 1.2 }}>{user.name}</Text>
          ) : null}
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
          {isMobile ? null : LABELS.LOGOUT_BUTTON}
        </Button>
      </div>
    </Header>
  );
}
