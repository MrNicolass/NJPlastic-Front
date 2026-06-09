'use client';

import { Skeleton } from 'antd';
import { useCallback, useRef, useState } from 'react';
import { LeaderDashboardPage } from '@/components/leader/LeaderDashboardPage';
import { ManagerDashboardPlaceholder } from '@/components/leader/ManagerDashboardPlaceholder';
import {
  RecentEventsPanel,
  type RecentEventsPanelHandle,
} from '@/components/leader/RecentEventsPanel';
import { RegisterEventModal } from '@/components/leader/RegisterEventModal';
import { OperatorDashboardPage } from '@/components/operator/OperatorDashboardPage';
import { useSessionStore } from '@/stores/useSessionStore';

/**
 * /dashboard route — thin role router. The middleware (Routes.ts) already
 * guarantees the principal is authenticated, but role is hydrated from the
 * client-side session store, so the very first render before hydration may
 * see role=null and falls back to a Skeleton. Operator keeps its existing
 * experience (EP-FE-04); Leader gets the consolidated dashboard (EP-FE-05)
 * wired to the Recent Events panel and the manual-event modal; Manager/Admin
 * reach a placeholder until EP-FE-06 ships.
 */
function LeaderDashboardWithSlots() {
  const panelRef = useRef<RecentEventsPanelHandle>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleOpenRegister = useCallback(() => setRegisterOpen(true), []);
  const handleCloseRegister = useCallback(() => setRegisterOpen(false), []);
  const handleRegistered = useCallback(() => {
    panelRef.current?.refetch();
  }, []);

  return (
    <>
      <LeaderDashboardPage
        recentEventsSlot={<RecentEventsPanel panelRef={panelRef} />}
        onRegisterEventClick={handleOpenRegister}
      />
      <RegisterEventModal
        open={registerOpen}
        onClose={handleCloseRegister}
        onRegistered={handleRegistered}
      />
    </>
  );
}

export default function DashboardPage() {
  const role = useSessionStore((state) => state.role);

  if (role === 'OPERATOR') {
    return <OperatorDashboardPage />;
  }
  if (role === 'LEADER') {
    return <LeaderDashboardWithSlots />;
  }
  if (role === 'MANAGER' || role === 'ADMIN') {
    return <ManagerDashboardPlaceholder />;
  }
  return <Skeleton active paragraph={{ rows: 6 }} />;
}
