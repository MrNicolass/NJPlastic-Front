'use client';

import { Col, Empty, Row, Skeleton, Space, Statistic, Typography } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { AttentionBanner } from '@/components/operator/AttentionBanner';
import { MachineCard } from '@/components/operator/MachineCard';
import { RegisterPauseModal } from '@/components/operator/RegisterPauseModal';
import { StopMessageEditModal } from '@/components/shared/StopMessageEditModal';
import { MACHINES, UTILS } from '@/constants/ConstantsAndParams';
import { usePolling } from '@/hooks/usePolling';
import type { OperatorDashboardEntry as DashboardEntry, OperatorDashboardSnapshot as DashboardSnapshot, OperatorActiveStopModal as ActiveStopModal, ActivePauseModal } from '@/models/types/OperatorDashboard';
import type { UnreviewedAutoStop } from '@/models/types/UnreviewedAutoStop';
import MachineService from '@/services/MachineService';
import { useSessionStore } from '@/stores/useSessionStore';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Title, Text } = Typography;

const DASHBOARD_POLL_INTERVAL_MS = 5000;
const STATUS_LOOKBACK_HOURS = 2;

const STATE_SORT_ORDER: Record<string, number> = {
  RUNNING: 0,
  PAUSED: 1,
  AUTO_STOPPED: 2,
  OFFLINE: 3,
  UNKNOWN: 4,
};

const fetchDashboardSnapshot = async (): Promise<DashboardSnapshot> => {
  const machines = await MachineService.listMachines(true);
  if (machines.length === 0) {
    return { entries: [] };
  }
  const to = dayjs();
  const from = to.subtract(STATUS_LOOKBACK_HOURS, 'hour');
  const statuses = await Promise.allSettled(
    machines.map((machine) =>
      MachineService.getStatus(machine.id, from.toISOString(), to.toISOString(), true),
    ),
  );
  const entries: DashboardEntry[] = machines.map((machine, index) => {
    const result = statuses[index];
    if (result.status === 'fulfilled') {
      return { machine, status: result.value };
    }
    return { machine, status: null };
  });
  return { entries };
};

const collectUnreviewedAutoStops = (entries: DashboardEntry[]): UnreviewedAutoStop[] => {
  const items: UnreviewedAutoStop[] = [];
  for (const entry of entries) {
    const current = entry.status?.current;
    if (!current || current.state !== 'AUTO_STOPPED') {
      continue;
    }
    if (current.reasonAuthorId) {
      continue;
    }
    items.push({
      machineId: entry.machine.id,
      machineCode: entry.machine.code,
      stopId: current.id,
    });
  }
  return items;
};

/**
 * Operator dashboard "Minhas Maquinas". Polls the visible machines and
 * their current status every 5 seconds with Page Visibility-aware
 * pause. Renders the AUTO_STOPPED attention banner, the shift summary
 * counters and a grid of per-machine cards with inline actions. Acts
 * as the entry point for, and from the floor level.
 */
export function OperatorDashboardPage() {
  const router = useRouter();
  const user = useSessionStore((state) => state.user);

  const { data, loading, error, lastUpdatedAt, refetch } = usePolling<DashboardSnapshot>(
    fetchDashboardSnapshot,
    DASHBOARD_POLL_INTERVAL_MS,
  );

  const [activeStopModal, setActiveStopModal] = useState<ActiveStopModal | null>(null);
  const [activePauseModal, setActivePauseModal] = useState<ActivePauseModal | null>(null);

  const rawEntries = data?.entries ?? [];

  const entries = useMemo(() => {
    const stateOf = (entry: DashboardEntry) =>
      entry.status?.current?.state ?? entry.machine.currentState ?? 'UNKNOWN';
    return [...rawEntries].sort((a, b) => {
      const sa = STATE_SORT_ORDER[stateOf(a)] ?? 5;
      const sb = STATE_SORT_ORDER[stateOf(b)] ?? 5;
      if (sa !== sb) return sa - sb;
      return a.machine.code.localeCompare(b.machine.code);
    });
  }, [rawEntries]);

  const counters = useMemo(() => {
    const accumulator = { running: 0, paused: 0, autoStopped: 0, offline: 0 };
    for (const entry of entries) {
      const state = entry.status?.current?.state ?? entry.machine.currentState;
      if (state === 'RUNNING') {
        accumulator.running += 1;
      } else if (state === 'PAUSED') {
        accumulator.paused += 1;
      } else if (state === 'AUTO_STOPPED') {
        accumulator.autoStopped += 1;
      } else if (state === 'OFFLINE') {
        accumulator.offline += 1;
      }
    }
    return accumulator;
  }, [entries]);

  const unreviewed = useMemo(() => collectUnreviewedAutoStops(entries), [entries]);

  const openStopModalById = useCallback(
    (machineId: string, stopId: string) => {
      const target = entries.find((entry) => entry.machine.id === machineId);
      if (!target?.status?.current || target.status.current.id !== stopId) {
        return;
      }
      setActiveStopModal({
        machineId,
        machineCode: target.machine.code,
        stop: target.status.current,
      });
    },
    [entries],
  );

  const handleSelectBannerItem = useCallback(
    (item: UnreviewedAutoStop) => openStopModalById(item.machineId, item.stopId),
    [openStopModalById],
  );

  const handleEditStopForMachine = useCallback(
    (entry: DashboardEntry) => {
      const stop = entry.status?.current;
      if (!stop || stop.state !== 'AUTO_STOPPED') {
        return;
      }
      setActiveStopModal({
        machineId: entry.machine.id,
        machineCode: entry.machine.code,
        stop,
      });
    },
    [],
  );

  const handleRegisterPauseForMachine = useCallback(
    (entry: DashboardEntry) => {
      const stop = entry.status?.current;
      if (!stop || stop.state !== 'PAUSED') {
        return;
      }
      setActivePauseModal({
        machineId: entry.machine.id,
        machineCode: entry.machine.code,
        pauseStartedAt: stop.startTime,
      });
    },
    [],
  );

  const handleViewDetail = useCallback(
    (entry: DashboardEntry) => {
      router.push(`/maquinas/${entry.machine.id}`);
    },
    [router],
  );

  const handleSaveSuccess = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (loading && entries.length === 0 && !error) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  if (error && entries.length === 0) {
    NotificationUtils({
      key: MACHINES.NOTIFICATIONS.ERROR.KEYS.LIST_FAILED,
      type: 'error',
      message: MACHINES.NOTIFICATIONS.ERROR.TITLES.LIST_FAILED,
      description: MACHINES.NOTIFICATIONS.ERROR.MESSAGES.LIST_FAILED,
    });
  }

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <header>
        <Title level={3} style={{ marginBottom: 4 }}>
          {MACHINES.DASHBOARD.LABELS.GREETING(user?.name ?? '')}
        </Title>
        {lastUpdatedAt ? (
          <Text type="secondary">
            {MACHINES.DASHBOARD.LABELS.LAST_UPDATE(
              dayjs(lastUpdatedAt).format(UTILS.DATE_FORMATS.DISPLAY),
            )}
          </Text>
        ) : null}
      </header>

      <AttentionBanner items={unreviewed} onSelect={handleSelectBannerItem} />

      <section aria-labelledby="shift-counters">
        <Title level={5} id="shift-counters" style={{ marginBottom: 12 }}>
          {MACHINES.DASHBOARD.LABELS.SHIFT_COUNTERS_TITLE}
        </Title>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Statistic title={MACHINES.DASHBOARD.LABELS.COUNTER_RUNNING} value={counters.running} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic title={MACHINES.DASHBOARD.LABELS.COUNTER_PAUSED} value={counters.paused} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title={MACHINES.DASHBOARD.LABELS.COUNTER_AUTO_STOPPED}
              value={counters.autoStopped}
              valueStyle={{ color: counters.autoStopped > 0 ? undefined : undefined }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic title={MACHINES.STATE_LABELS.OFFLINE} value={counters.offline} />
          </Col>
        </Row>
      </section>

      <section aria-labelledby="machines-grid">
        <Title level={5} id="machines-grid" style={{ marginBottom: 12 }}>
          {MACHINES.DASHBOARD.LABELS.MACHINES_TITLE}
        </Title>
        {entries.length === 0 ? (
          <Empty
            description={
              <Space orientation="vertical" size={0}>
                <Text strong>{MACHINES.DASHBOARD.LABELS.EMPTY_TITLE}</Text>
                <Text type="secondary">{MACHINES.DASHBOARD.LABELS.EMPTY_DESCRIPTION}</Text>
              </Space>
            }
          />
        ) : (
          <Row gutter={[16, 16]}>
            {entries.map((entry) => {
              const currentState = entry.status?.current?.state ?? entry.machine.currentState ?? null;
              return (
                <Col xs={24} md={12} xl={8} key={entry.machine.id}>
                  <MachineCard
                    machine={entry.machine}
                    currentState={currentState}
                    currentStop={entry.status?.current ?? null}
                    cyclesInShift={entry.status?.cyclesInWindow ?? 0}
                    onRegisterPause={() => handleRegisterPauseForMachine(entry)}
                    onEditStopMessage={() => handleEditStopForMachine(entry)}
                    onViewDetail={() => handleViewDetail(entry)}
                  />
                </Col>
              );
            })}
          </Row>
        )}
      </section>

      {activeStopModal ? (
        <StopMessageEditModal
          open
          onClose={() => setActiveStopModal(null)}
          machineId={activeStopModal.machineId}
          machineCode={activeStopModal.machineCode}
          stopId={activeStopModal.stop.id}
          userRole="OPERATOR"
          currentMessage={activeStopModal.stop.message ?? ''}
          detectedAt={activeStopModal.stop.startTime}
          onSaved={handleSaveSuccess}
        />
      ) : null}

      {activePauseModal ? (
        <RegisterPauseModal
          open
          onClose={() => setActivePauseModal(null)}
          machineId={activePauseModal.machineId}
          machineCode={activePauseModal.machineCode}
          pauseStartedAt={activePauseModal.pauseStartedAt}
          onRegistered={handleSaveSuccess}
        />
      ) : null}
    </Space>
  );
}
