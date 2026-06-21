'use client';

import { Skeleton } from 'antd';
import { useCallback, useRef, useState } from 'react';
import { LeaderDashboardPage } from '@/components/leader/LeaderDashboardPage';
import {
  RecentEventsPanel,
  type RecentEventsPanelHandle,
} from '@/components/leader/RecentEventsPanel';
import { RegisterEventModal } from '@/components/leader/RegisterEventModal';
import { ManagerDashboardPage } from '@/components/manager/ManagerDashboardPage';
import { OperatorDashboardPage } from '@/components/operator/OperatorDashboardPage';
import { useSessionStore } from '@/stores/useSessionStore';

/**
 * /dashboard route — thin role router. The middleware (Routes.ts) already
 * guarantees the principal is authenticated, but role is hydrated from the
 * client-side session store, so the very first render before hydration may
 * see role=null and falls back to a Skeleton. Operator keeps its existing
 * experience; Leader gets the consolidated dashboard;
 * Manager/Admin get the manager dashboard with sector/shift
 * filters and the full-scope StopMessageEditModal variation.
 */
function DashboardWithSlots({
  variant,
}: {
  variant: 'LEADER' | 'MANAGER';
}) {
  const panelRef = useRef<RecentEventsPanelHandle>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleOpenRegister = useCallback(() => setRegisterOpen(true), []);
  const handleCloseRegister = useCallback(() => setRegisterOpen(false), []);
  const handleRegistered = useCallback(() => {
    panelRef.current?.refetch();
  }, []);

  const slot = <RecentEventsPanel panelRef={panelRef} />;

  return (
    <>
      {variant === 'LEADER' ? (
        <LeaderDashboardPage
          recentEventsSlot={slot}
          onRegisterEventClick={handleOpenRegister}
        />
      ) : (
        <ManagerDashboardPage
          recentEventsSlot={slot}
          onRegisterEventClick={handleOpenRegister}
        />
      )}
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
    return <DashboardWithSlots variant="LEADER" />;
  }
  if (role === 'MANAGER') {
    return <DashboardWithSlots variant="MANAGER" />;
  }
  return <Skeleton active paragraph={{ rows: 6 }} />;
}
