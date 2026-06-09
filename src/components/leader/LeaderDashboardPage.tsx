'use client';

import { Button, Col, Empty, Row, Skeleton, Space, Statistic, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import type { Schemas } from '@/api/types';
import { MachineCard } from '@/components/operator/MachineCard';
import { StopMessageEditModal } from '@/components/shared/StopMessageEditModal';
import { LEADER_DASHBOARD, MACHINES, UTILS } from '@/constants/ConstantsAndParams';
import { usePolling } from '@/hooks/usePolling';
import MachineService from '@/services/MachineService';
import { useSessionStore } from '@/stores/useSessionStore';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Title, Text } = Typography;

const LEADER_POLL_INTERVAL_MS = 10_000;
const STATUS_LOOKBACK_HOURS = 8;

type LeaderEntry = {
  machine: Schemas['MachineSummaryDTO'];
  status: Schemas['MachineStatusResponseDTO'] | null;
  oee: Schemas['OeeResultDTO'] | null;
};

type LeaderSnapshot = {
  entries: LeaderEntry[];
};

const fetchLeaderSnapshot = async (): Promise<LeaderSnapshot> => {
  const machines = await MachineService.listMachines(true);
  if (machines.length === 0) {
    return { entries: [] };
  }
  const to = dayjs();
  const from = to.subtract(STATUS_LOOKBACK_HOURS, 'hour');
  const fromIso = from.toISOString();
  const toIso = to.toISOString();
  const [statuses, oees] = await Promise.all([
    Promise.allSettled(
      machines.map((machine) => MachineService.getStatus(machine.id, fromIso, toIso, true)),
    ),
    Promise.allSettled(
      machines.map((machine) => MachineService.getOee(machine.id, fromIso, toIso, true)),
    ),
  ]);
  const entries: LeaderEntry[] = machines.map((machine, index) => {
    const statusResult = statuses[index];
    const oeeResult = oees[index];
    return {
      machine,
      status: statusResult.status === 'fulfilled' ? statusResult.value : null,
      oee: oeeResult.status === 'fulfilled' ? oeeResult.value : null,
    };
  });
  return { entries };
};

type ActiveStopModal = {
  machineId: string;
  machineCode: string;
  stop: Schemas['MachineStatusEntryDTO'];
};

type LeaderDashboardPageProps = {
  /**
   * Slot rendered in the right column of the dashboard. Receives the snapshot's
   * accessible machines so the panel can scope its own polling without a
   * second list fetch. EP-FE-05 item 6 uses it to embed RecentEventsPanel.
   */
  recentEventsSlot?: React.ReactNode;
  /**
   * Slot rendered when the header's "Registrar evento" button is clicked.
   * EP-FE-05 item 7 wires it to RegisterEventModal.
   */
  onRegisterEventClick?: () => void;
};

/**
 * Consolidated dashboard for the Shift Leader (RN03, EP-FE-05 item 1).
 * Polls every 10 seconds with Page Visibility-aware pause and renders the
 * sector-wide KPIs plus a grid of machine cards reusing the operator card
 * component. The right column hosts the RecentEventsPanel (EP-FE-05 item 6)
 * and the header exposes the manual-event entry point (item 7). Stop message
 * edits open with userRole="LEADER" so the modal switches to the leader
 * variation (item 4) without any extra wiring on the consumer side.
 */
export function LeaderDashboardPage({
  recentEventsSlot,
  onRegisterEventClick,
}: LeaderDashboardPageProps) {
  const router = useRouter();
  const user = useSessionStore((state) => state.user);

  const { data, loading, error, lastUpdatedAt, refetch } = usePolling<LeaderSnapshot>(
    fetchLeaderSnapshot,
    LEADER_POLL_INTERVAL_MS,
  );

  const [activeStopModal, setActiveStopModal] = useState<ActiveStopModal | null>(null);

  const entries = data?.entries ?? [];

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

  const averageOee = useMemo(() => {
    const values: number[] = [];
    for (const entry of entries) {
      const oee = entry.oee?.oee;
      if (typeof oee === 'number' && Number.isFinite(oee)) {
        values.push(oee);
      }
    }
    if (values.length === 0) {
      return null;
    }
    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
  }, [entries]);

  const handleEditStopForMachine = useCallback((entry: LeaderEntry) => {
    const stop = entry.status?.current;
    if (!stop || stop.state !== 'AUTO_STOPPED') {
      return;
    }
    setActiveStopModal({
      machineId: entry.machine.id,
      machineCode: entry.machine.code,
      stop,
    });
  }, []);

  const handleViewDetail = useCallback(
    (entry: LeaderEntry) => {
      router.push(`/maquinas/${entry.machine.id}`);
    },
    [router],
  );

  const handleSaveSuccess = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (loading && entries.length === 0 && !error) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (error && entries.length === 0) {
    NotificationUtils({
      key: LEADER_DASHBOARD.NOTIFICATIONS.ERROR.KEYS.SNAPSHOT_FAILED,
      type: 'error',
      message: LEADER_DASHBOARD.NOTIFICATIONS.ERROR.TITLES.SNAPSHOT_FAILED,
      description: LEADER_DASHBOARD.NOTIFICATIONS.ERROR.MESSAGES.SNAPSHOT_FAILED,
    });
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <header>
        <Row justify="space-between" align="middle" gutter={[16, 16]} wrap>
          <Col flex="auto">
            <Title level={3} style={{ marginBottom: 4 }}>
              {LEADER_DASHBOARD.LABELS.GREETING(user?.name ?? '')}
            </Title>
            <Space size={12} wrap>
              <Tag color="processing">{LEADER_DASHBOARD.LABELS.SCOPE_BADGE}</Tag>
              {lastUpdatedAt ? (
                <Text type="secondary">
                  {LEADER_DASHBOARD.LABELS.LAST_UPDATE(
                    dayjs(lastUpdatedAt).format(UTILS.DATE_FORMATS.DISPLAY),
                  )}
                </Text>
              ) : null}
            </Space>
          </Col>
          {onRegisterEventClick ? (
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={onRegisterEventClick}>
                {LEADER_DASHBOARD.BUTTONS.REGISTER_EVENT}
              </Button>
            </Col>
          ) : null}
        </Row>
      </header>

      <section aria-labelledby="leader-kpis">
        <Title level={5} id="leader-kpis" style={{ marginBottom: 12 }}>
          {MACHINES.DASHBOARD.LABELS.SHIFT_COUNTERS_TITLE}
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} xl={6}>
            <Statistic
              title={LEADER_DASHBOARD.LABELS.KPI_OEE_AVERAGE}
              value={averageOee !== null ? Math.round(averageOee * 1000) / 10 : '-'}
              suffix={averageOee !== null ? '%' : null}
            />
          </Col>
          <Col xs={24} sm={12} md={8} xl={6}>
            <Statistic title={LEADER_DASHBOARD.LABELS.KPI_RUNNING} value={counters.running} />
          </Col>
          <Col xs={24} sm={12} md={8} xl={6}>
            <Statistic title={LEADER_DASHBOARD.LABELS.KPI_PAUSED} value={counters.paused} />
          </Col>
          <Col xs={24} sm={12} md={8} xl={6}>
            <Statistic
              title={LEADER_DASHBOARD.LABELS.KPI_AUTO_STOPPED}
              value={counters.autoStopped}
            />
          </Col>
        </Row>
      </section>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <section aria-labelledby="leader-machines">
            <Title level={5} id="leader-machines" style={{ marginBottom: 12 }}>
              {LEADER_DASHBOARD.LABELS.MACHINES_TITLE}
            </Title>
            {entries.length === 0 ? (
              <Empty
                description={
                  <Space direction="vertical" size={0}>
                    <Text strong>{LEADER_DASHBOARD.LABELS.EMPTY_TITLE}</Text>
                    <Text type="secondary">{LEADER_DASHBOARD.LABELS.EMPTY_DESCRIPTION}</Text>
                  </Space>
                }
              />
            ) : (
              <Row gutter={[16, 16]}>
                {entries.map((entry) => {
                  const currentState =
                    entry.status?.current?.state ?? entry.machine.currentState ?? null;
                  return (
                    <Col xs={24} md={12} xl={12} key={entry.machine.id}>
                      <MachineCard
                        machine={entry.machine}
                        currentState={currentState}
                        currentStop={entry.status?.current ?? null}
                        onEditStopMessage={() => handleEditStopForMachine(entry)}
                        onViewDetail={() => handleViewDetail(entry)}
                      />
                    </Col>
                  );
                })}
              </Row>
            )}
          </section>
        </Col>
        <Col xs={24} xl={8}>
          <section aria-labelledby="leader-events">
            <Title level={5} id="leader-events" style={{ marginBottom: 12 }}>
              {LEADER_DASHBOARD.LABELS.RECENT_EVENTS_TITLE}
            </Title>
            {recentEventsSlot}
          </section>
        </Col>
      </Row>

      {activeStopModal ? (
        <StopMessageEditModal
          open
          onClose={() => setActiveStopModal(null)}
          machineId={activeStopModal.machineId}
          machineCode={activeStopModal.machineCode}
          stopId={activeStopModal.stop.id}
          userRole="LEADER"
          currentMessage={activeStopModal.stop.message ?? ''}
          detectedAt={activeStopModal.stop.startTime}
          onSaved={handleSaveSuccess}
        />
      ) : null}
    </Space>
  );
}
