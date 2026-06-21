'use client';

import { Drawer, Layout, Menu } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { LAYOUT } from '@/constants/ConstantsAndParams';
import { useResponsive } from '@/hooks/useResponsive';
import type { AppSiderProps } from '@/models/interfaces/components/LayoutProps';
import { buildMenuItemsForRole, resolveActiveMenuKey } from './navigationMenu';

export type { AppSiderProps } from '@/models/interfaces/components/LayoutProps';

const { Sider } = Layout;
const { LABELS } = LAYOUT.SIDER;

/**
 * Side navigation rendered for every role except OPERATOR (the operator
 * dashboard is a simplified view with no sider). Items per role come
 * from buildMenuItemsForRole; the active key derives from the current
 * pathname so refreshes and deep-links keep the correct selection.
 * On mobile (`< md`) the sider is replaced by a left Drawer triggered
 * by the hamburger button in AppHeader, so the navigation does not
 * steal screen real estate from content but stays one tap away.
 */
export function AppSider({ role, mobileNavOpen, onMobileNavOpenChange }: AppSiderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [collapsed, setCollapsed] = useState(false);

  const items = useMemo(() => buildMenuItemsForRole(role), [role]);
  const activeKey = useMemo(
    () => resolveActiveMenuKey(pathname ?? '', items),
    [pathname, items],
  );

  if (role === 'OPERATOR' || items.length === 0) {
    return null;
  }

  const handleNavigate = (key: string) => {
    if (key.startsWith('/')) {
      router.push(key);
      onMobileNavOpenChange?.(false);
    }
  };

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileNavOpen ?? false}
        onClose={() => onMobileNavOpenChange?.(false)}
        width={LAYOUT.RESPONSIVE_WIDTHS.MOBILE_NAV_DRAWER}
        closable
        styles={{ body: { padding: 0, background: '#001529' }, header: { display: 'none' } }}
        aria-label={LABELS.EXPAND}
      >
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={activeKey ? [activeKey] : []}
          items={items}
          onClick={({ key }) => {
            if (typeof key === 'string') {
              handleNavigate(key);
            }
          }}
          style={{ borderInlineEnd: 0, paddingBlock: 8 }}
        />
      </Drawer>
    );
  }

  return (
    <Sider
      width={240}
      collapsedWidth={64}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      aria-label={collapsed ? LABELS.EXPAND : LABELS.COLLAPSE}
      className="app-sider"
    >
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={activeKey ? [activeKey] : []}
        items={items}
        onClick={({ key }) => {
          if (typeof key === 'string') {
            handleNavigate(key);
          }
        }}
        style={{ borderInlineEnd: 0, paddingBlock: 8 }}
      />
    </Sider>
  );
}
