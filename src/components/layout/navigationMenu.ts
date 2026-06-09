import {
  ApiOutlined,
  AuditOutlined,
  BarChartOutlined,
  DashboardOutlined,
  DesktopOutlined,
  FileTextOutlined,
  HistoryOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { createElement } from 'react';
import { LAYOUT } from '@/constants/ConstantsAndParams';
import type { Role } from '@/stores/useSessionStore';

export type NavigationMenuItem = NonNullable<MenuProps['items']>[number];

const { LABELS } = LAYOUT.SIDER;

const SHARED_ITEMS: NavigationMenuItem[] = [
  { key: '/dashboard', icon: createElement(DashboardOutlined), label: LABELS.DASHBOARD },
  { key: '/maquinas', icon: createElement(DesktopOutlined), label: LABELS.MACHINES },
  { key: '/ordens', icon: createElement(FileTextOutlined), label: LABELS.ORDERS },
  { key: '/historico', icon: createElement(HistoryOutlined), label: LABELS.HISTORY },
  { key: '/relatorios', icon: createElement(BarChartOutlined), label: LABELS.REPORTS },
  { key: '/conta', icon: createElement(UserOutlined), label: LABELS.ACCOUNT },
];

const ADMIN_ITEMS: NavigationMenuItem[] = [
  {
    type: 'group',
    key: 'admin-group',
    label: LABELS.ADMIN_GROUP,
    children: [
      { key: '/usuarios', icon: createElement(TeamOutlined), label: LABELS.USERS },
      { key: '/erp', icon: createElement(ApiOutlined), label: LABELS.ERP },
      { key: '/auditoria', icon: createElement(AuditOutlined), label: LABELS.AUDIT },
    ],
  },
];

/**
 * Builds the sider menu items visible to the given role. OPERATOR returns
 * an empty array because §4.2.2 of the RFC explicitly states the operator
 * layout has no sider — the AppSider component already skips rendering
 * for that role, and this empty array is a defense-in-depth safeguard.
 */
export const buildMenuItemsForRole = (role: Role): NavigationMenuItem[] => {
  if (role === 'OPERATOR') {
    return [];
  }
  if (role === 'MANAGER' || role === 'ADMIN') {
    return [...SHARED_ITEMS, ...ADMIN_ITEMS];
  }
  return SHARED_ITEMS;
};

/**
 * Returns the menu key that should be marked active for a given pathname.
 * Matches the longest key prefix so sub-routes (e.g. `/maquinas/INJ-04`)
 * keep the parent item highlighted.
 */
export const resolveActiveMenuKey = (
  pathname: string,
  items: NavigationMenuItem[],
): string | undefined => {
  const candidateKeys: string[] = [];
  for (const item of items) {
    if (!item) {
      continue;
    }
    if ('children' in item && Array.isArray(item.children)) {
      for (const child of item.children) {
        if (child && typeof child.key === 'string') {
          candidateKeys.push(child.key);
        }
      }
      continue;
    }
    if (typeof item.key === 'string') {
      candidateKeys.push(item.key);
    }
  }
  return candidateKeys
    .filter((key) => key.startsWith('/') && (pathname === key || pathname.startsWith(`${key}/`)))
    .sort((a, b) => b.length - a.length)[0];
};
