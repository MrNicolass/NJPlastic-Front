'use client';

import { ConsolidatedDashboardPage } from '@/components/shared/ConsolidatedDashboardPage';

export type ManagerDashboardPageProps = {
  recentEventsSlot?: React.ReactNode;
  onRegisterEventClick?: () => void;
};

export function ManagerDashboardPage(props: ManagerDashboardPageProps) {
  return <ConsolidatedDashboardPage userRole="MANAGER" {...props} />;
}
