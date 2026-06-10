'use client';

import { ConsolidatedDashboardPage } from '@/components/shared/ConsolidatedDashboardPage';

export type LeaderDashboardPageProps = {
  recentEventsSlot?: React.ReactNode;
  onRegisterEventClick?: () => void;
};

export function LeaderDashboardPage(props: LeaderDashboardPageProps) {
  return <ConsolidatedDashboardPage userRole="LEADER" {...props} />;
}
