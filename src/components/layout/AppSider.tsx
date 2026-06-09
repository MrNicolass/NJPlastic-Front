'use client';

import { Layout, Menu } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { LAYOUT } from '@/constants/ConstantsAndParams';
import type { Role } from '@/stores/useSessionStore';
import { buildMenuItemsForRole, resolveActiveMenuKey } from './navigationMenu';

const { Sider } = Layout;
const { LABELS } = LAYOUT.SIDER;

type AppSiderProps = {
  role: Role;
};

/**
 * Side navigation rendered for every role except OPERATOR. RFC §4.2.2
 * mandates the operator dashboard has no sider — a simplified view aligned
 * with RNF09. Items per role come from buildMenuItemsForRole; the active
 * key derives from the current pathname so refreshes and deep-links keep
 * the correct selection.
 */
export function AppSider({ role }: AppSiderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const items = useMemo(() => buildMenuItemsForRole(role), [role]);
  const activeKey = useMemo(
    () => resolveActiveMenuKey(pathname ?? '', items),
    [pathname, items],
  );

  if (role === 'OPERATOR' || items.length === 0) {
    return null;
  }

  return (
    <Sider
      width={240}
      collapsedWidth={64}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="lg"
      aria-label={collapsed ? LABELS.EXPAND : LABELS.COLLAPSE}
    >
      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={activeKey ? [activeKey] : []}
        items={items}
        onClick={({ key }) => {
          if (typeof key === 'string' && key.startsWith('/')) {
            router.push(key);
          }
        }}
        style={{ borderInlineEnd: 0, paddingBlock: 8 }}
      />
    </Sider>
  );
}
