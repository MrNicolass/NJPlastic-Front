'use client';

import {
  Button,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Segmented,
  Select,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import type { Schemas } from '@/api/types';
import { MachineCard } from '@/components/operator/MachineCard';
import { StopMessageEditModal } from '@/components/shared/StopMessageEditModal';
import {
  DASHBOARD_SHARED,
  LEADER_DASHBOARD,
  MACHINES,
  MANAGER_DASHBOARD,
  UTILS,
} from '@/constants/ConstantsAndParams';
import { usePolling } from '@/hooks/usePolling';
import type {
  ActiveStopModal,
  ConsolidatedDashboardPageProps,
  DashboardEntry,
  DashboardSnapshot,
} from '@/models/types/Dashboard';
import MachineService from '@/services/MachineService';
import type { Role } from '@/stores/useSessionStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Title, Text } = Typography;

const LEADER_POLL_MS = 10_000;
const MANAGER_POLL_MS = 15_000;
const STATUS_LOOKBACK_HOURS = 8;
const ALL_SECTORS = '__ALL__';

const getSector = (m: Schemas['MachineSummaryDTO']): string =>
  (m as { sector?: string | null }).sector ?? '';

const fetchSnapshot = async (): Promise<DashboardSnapshot> => {
  const machines = await MachineService.listMachines(true);
  if (machines.length === 0) return { entries: [] };
  const to = dayjs();
  const from = to.subtract(STATUS_LOOKBACK_HOURS, 'hour');
  const fromIso = from.toISOString();
  const toIso = to.toISOString();
  const [statuses, oees] = await Promise.all([
    Promise.allSettled(machines.map((m) => MachineService.getStatus(m.id, fromIso, toIso, true))),
    Promise.allSettled(machines.map((m) => MachineService.getOee(m.id, fromIso, toIso, true))),
  ]);
  return {
    entries: machines.map((machine, i) => {
      const statusResult = statuses[i];
      const oeeResult = oees[i];
      return {
        machine,
        status: statusResult.status === 'fulfilled' ? statusResult.value : null,
        oee: oeeResult.status === 'fulfilled' ? oeeResult.value : null,
      };
    }),
  };
};

export type { ConsolidatedDashboardPageProps } from '@/models/types/Dashboard';

const STATE_SORT_ORDER: Record<string, number> = {
  RUNNING: 0,
  PAUSED: 1,
  AUTO_STOPPED: 2,
  OFFLINE: 3,
  UNKNOWN: 4,
};

const STATE_FILTER_OPTIONS = [
  {
    value: DASHBOARD_SHARED.STATE_FILTER.VALUES.ALL,
    label: DASHBOARD_SHARED.STATE_FILTER.LABELS.ALL,
  },
  {
    value: DASHBOARD_SHARED.STATE_FILTER.VALUES.RUNNING,
    label: DASHBOARD_SHARED.STATE_FILTER.LABELS.RUNNING,
  },
  {
    value: DASHBOARD_SHARED.STATE_FILTER.VALUES.PAUSED,
    label: DASHBOARD_SHARED.STATE_FILTER.LABELS.PAUSED,
  },
  {
    value: DASHBOARD_SHARED.STATE_FILTER.VALUES.AUTO_STOPPED,
    label: DASHBOARD_SHARED.STATE_FILTER.LABELS.AUTO_STOPPED,
  },
  {
    value: DASHBOARD_SHARED.STATE_FILTER.VALUES.OFFLINE,
    label: DASHBOARD_SHARED.STATE_FILTER.LABELS.OFFLINE,
  },
];

/**
 * Single dashboard component for Leader and Manager/Admin.
 * The backend already scopes the machine list by role; this component only
 * adds client-side filtering (sector for Manager, state chips for all roles).
 * OEE average is shown as a progress bar card rather than a plain statistic.
 */
export function ConsolidatedDashboardPage({
  userRole,
  recentEventsSlot,
  onRegisterEventClick,
}: ConsolidatedDashboardPageProps) {
  const router = useRouter();
  const user = useSessionStore((state) => state.user);
  const isManager = userRole === 'MANAGER';
  const constants = isManager ? MANAGER_DASHBOARD : LEADER_DASHBOARD;
  const pollInterval = isManager ? MANAGER_POLL_MS : LEADER_POLL_MS;

  const { data, loading, error, lastUpdatedAt, refetch } = usePolling<DashboardSnapshot>(
    fetchSnapshot,
    pollInterval,
  );

  const [activeStopModal, setActiveStopModal] = useState<ActiveStopModal | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string>(ALL_SECTORS);
  const [stateFilter, setStateFilter] = useState<string>(DASHBOARD_SHARED.STATE_FILTER.VALUES.ALL);

  const allEntries = data?.entries ?? [];

  const sectorOptions = useMemo(() => {
    const sectors = new Set<string>();
    for (const entry of allEntries) {
      const s = getSector(entry.machine);
      if (s.length > 0) sectors.add(s);
    }
    return Array.from(sectors).sort();
  }, [allEntries]);

  const sectorFiltered = useMemo(() => {
    if (!isManager || sectorFilter === ALL_SECTORS) return allEntries;
    return allEntries.filter((e) => getSector(e.machine) === sectorFilter);
  }, [allEntries, isManager, sectorFilter]);

  const entries = useMemo(() => {
    const filtered =
      stateFilter === DASHBOARD_SHARED.STATE_FILTER.VALUES.ALL
        ? sectorFiltered
        : sectorFiltered.filter((entry) => {
            const state = entry.status?.current?.state ?? entry.machine.currentState;
            return state === stateFilter;
          });
    const stateOf = (entry: DashboardEntry) =>
      entry.status?.current?.state ?? entry.machine.currentState ?? 'UNKNOWN';
    return [...filtered].sort((a, b) => {
      const sa = STATE_SORT_ORDER[stateOf(a)] ?? 5;
      const sb = STATE_SORT_ORDER[stateOf(b)] ?? 5;
      if (sa !== sb) return sa - sb;
      return a.machine.code.localeCompare(b.machine.code);
    });
  }, [sectorFiltered, stateFilter]);

  const counters = useMemo(() => {
    const acc = { running: 0, paused: 0, autoStopped: 0, offline: 0 };
    for (const entry of sectorFiltered) {
      const state = entry.status?.current?.state ?? entry.machine.currentState;
      if (state === 'RUNNING') acc.running += 1;
      else if (state === 'PAUSED') acc.paused += 1;
      else if (state === 'AUTO_STOPPED') acc.autoStopped += 1;
      else if (state === 'OFFLINE') acc.offline += 1;
    }
    return acc;
  }, [sectorFiltered]);

  const averageOee = useMemo(() => {
    const values = sectorFiltered
      .map((e) => e.oee?.oee)
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    if (values.length === 0) return null;
    return values.reduce((acc, v) => acc + v, 0) / values.length;
  }, [sectorFiltered]);

  const hasPartialOee = useMemo(
    () => sectorFiltered.some((e) => e.oee?.partial === true),
    [sectorFiltered],
  );

  const oeeBySector = useMemo(() => {
    if (!isManager) return [];
    const buckets = new Map<string, number[]>();
    for (const entry of sectorFiltered) {
      const sector = getSector(entry.machine);
      if (!sector) continue;
      const oee = entry.oee?.oee;
      if (typeof oee !== 'number' || !Number.isFinite(oee)) continue;
      const bucket = buckets.get(sector) ?? [];
      bucket.push(oee);
      buckets.set(sector, bucket);
    }
    return Array.from(buckets.entries())
      .map(([sector, values]) => ({
        sector,
        oee: values.reduce((acc, v) => acc + v, 0) / values.length,
        machineCount: values.length,
      }))
      .sort((a, b) => a.sector.localeCompare(b.sector));
  }, [sectorFiltered, isManager]);

  const handleEditStopForMachine = useCallback((entry: DashboardEntry) => {
    const stop = entry.status?.current;
    if (!stop || stop.state !== 'AUTO_STOPPED') return;
    setActiveStopModal({ machineId: entry.machine.id, machineCode: entry.machine.code, stop });
  }, []);

  const handleViewDetail = useCallback(
    (entry: DashboardEntry) => router.push(`/maquinas/${entry.machine.id}`),
    [router],
  );

  const handleSaveSuccess = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (loading && allEntries.length === 0 && !error) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (error && allEntries.length === 0) {
    NotificationUtils({
      key: constants.NOTIFICATIONS.ERROR.KEYS.SNAPSHOT_FAILED,
      type: 'error',
      message: constants.NOTIFICATIONS.ERROR.TITLES.SNAPSHOT_FAILED,
      description: constants.NOTIFICATIONS.ERROR.MESSAGES.SNAPSHOT_FAILED,
    });
  }

  const oeePct = averageOee !== null ? Math.round(averageOee * 1000) / 10 : null;

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <header>
        <Row justify="space-between" align="middle" gutter={[16, 16]} wrap>
          <Col flex="auto">
            <Title level={3} style={{ marginBottom: 4 }}>
              {constants.LABELS.GREETING(user?.name ?? '')}
            </Title>
            <Space size={12} wrap>
              <Tag color="processing">{constants.LABELS.SCOPE_BADGE}</Tag>
              {lastUpdatedAt ? (
                <Text type="secondary">
                  {constants.LABELS.LAST_UPDATE(
                    dayjs(lastUpdatedAt).format(UTILS.DATE_FORMATS.DISPLAY),
                  )}
                </Text>
              ) : null}
            </Space>
          </Col>
          <Col>
            <Space size={12} wrap>
              {isManager ? (
                <Select
                  value={sectorFilter}
                  onChange={setSectorFilter}
                  style={{ minWidth: 200 }}
                  options={[
                    { value: ALL_SECTORS, label: MANAGER_DASHBOARD.LABELS.SECTOR_ALL },
                    ...sectorOptions.map((s) => ({ value: s, label: s })),
                  ]}
                />
              ) : null}
              {onRegisterEventClick ? (
                <Button type="primary" icon={<PlusOutlined />} onClick={onRegisterEventClick}>
                  {constants.BUTTONS.REGISTER_EVENT}
                </Button>
              ) : null}
            </Space>
          </Col>
        </Row>
      </header>

      <section aria-labelledby="dashboard-kpis">
        <Title level={5} id="dashboard-kpis" style={{ marginBottom: 12 }}>
          {MACHINES.DASHBOARD.LABELS.SHIFT_COUNTERS_TITLE}
        </Title>
        <Row gutter={[16, 16]} align="stretch">
          <Col xs={24} sm={12} md={8} xl={6}>
            <Card size="small" style={{ height: '100%' }}>
              <Space align="center" size={4} style={{ marginBottom: 8 }}>
                <Text strong>{DASHBOARD_SHARED.OEE_CARD.TITLE}</Text>
                <Tooltip
                  title={
                    <Space direction="vertical" size={4}>
                      <Text strong style={{ color: '#fff' }}>
                        {DASHBOARD_SHARED.OEE_CARD.TOOLTIP_TITLE}
                      </Text>
                      {(Object.keys(DASHBOARD_SHARED.OEE_CARD.STATE_LABELS) as Array<
                        keyof typeof DASHBOARD_SHARED.OEE_CARD.STATE_LABELS
                      >).map((key) => (
                        <div key={key}>
                          <Text strong style={{ color: '#fff' }}>
                            {DASHBOARD_SHARED.OEE_CARD.STATE_LABELS[key]}
                          </Text>
                          {': '}
                          <Text style={{ color: '#fff' }}>
                            {DASHBOARD_SHARED.OEE_CARD.STATE_DESCRIPTIONS[key]}
                          </Text>
                        </div>
                      ))}
                    </Space>
                  }
                >
                  <InfoCircleOutlined aria-label={DASHBOARD_SHARED.OEE_CARD.TOOLTIP_TITLE} />
                </Tooltip>
              </Space>
              {oeePct !== null ? (
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Statistic value={oeePct} precision={1} suffix="%" />
                  <Progress
                    percent={oeePct}
                    type="line"
                    showInfo={false}
                    status={oeePct >= 85 ? 'success' : oeePct >= 65 ? 'normal' : 'exception'}
                  />
                  {hasPartialOee ? (
                    <Tag color="warning">{DASHBOARD_SHARED.OEE_CARD.PARTIAL_TAG}</Tag>
                  ) : null}
                </Space>
              ) : (
                <Text type="secondary">{DASHBOARD_SHARED.OEE_CARD.UNAVAILABLE}</Text>
              )}
            </Card>
          </Col>
          {isManager ? (
            <Col xs={12} sm={6} md={4} xl={3}>
              <Card size="small" style={{ height: '100%' }}>
                <Statistic
                  title={MANAGER_DASHBOARD.LABELS.KPI_TOTAL_MACHINES}
                  value={sectorFiltered.length}
                />
              </Card>
            </Col>
          ) : null}
          <Col xs={12} sm={6} md={4} xl={3}>
            <Card size="small" style={{ height: '100%' }}>
              <Statistic title={constants.LABELS.KPI_RUNNING} value={counters.running} />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} xl={3}>
            <Card size="small" style={{ height: '100%' }}>
              <Statistic title={constants.LABELS.KPI_PAUSED} value={counters.paused} />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} xl={3}>
            <Card size="small" style={{ height: '100%' }}>
              <Statistic title={constants.LABELS.KPI_AUTO_STOPPED} value={counters.autoStopped} />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} xl={3}>
            <Card size="small" style={{ height: '100%' }}>
              <Statistic title={constants.LABELS.KPI_OFFLINE} value={counters.offline} />
            </Card>
          </Col>
        </Row>
      </section>

      {isManager && oeeBySector.length > 0 ? (
        <section aria-labelledby="dashboard-oee-sector">
          <Title level={5} id="dashboard-oee-sector" style={{ marginBottom: 12 }}>
            {MANAGER_DASHBOARD.LABELS.OEE_BY_SECTOR_TITLE}
          </Title>
          <Row gutter={[16, 16]}>
            {oeeBySector.map((bucket) => (
              <Col xs={24} sm={12} md={8} xl={6} key={bucket.sector}>
                <Card size="small">
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    {`${bucket.sector} (${bucket.machineCount})`}
                  </Text>
                  <Progress
                    percent={Math.round(bucket.oee * 1000) / 10}
                    type="line"
                    status={
                      bucket.oee >= 0.85 ? 'success' : bucket.oee >= 0.65 ? 'normal' : 'exception'
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      ) : null}

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <section aria-labelledby="dashboard-machines">
            <Row
              justify="space-between"
              align="middle"
              wrap={false}
              style={{ marginBottom: 12 }}
            >
              <Col>
                <Title level={5} id="dashboard-machines" style={{ marginBottom: 0 }}>
                  {constants.LABELS.MACHINES_TITLE}
                </Title>
              </Col>
              <Col>
                <Segmented
                  options={STATE_FILTER_OPTIONS}
                  value={stateFilter}
                  onChange={(v) => setStateFilter(String(v))}
                  size="small"
                />
              </Col>
            </Row>
            {entries.length === 0 ? (
              <Empty
                description={
                  <Space orientation="vertical" size={0}>
                    <Text strong>{constants.LABELS.EMPTY_TITLE}</Text>
                    <Text type="secondary">{constants.LABELS.EMPTY_DESCRIPTION}</Text>
                  </Space>
                }
              />
            ) : (
              <Row gutter={[16, 16]}>
                {entries.map((entry) => {
                  const currentState =
                    entry.status?.current?.state ?? entry.machine.currentState ?? null;
                  return (
                    <Col xs={24} md={12} key={entry.machine.id}>
                      <MachineCard
                        machine={entry.machine}
                        currentState={currentState}
                        currentStop={entry.status?.current ?? null}
                        cyclesInShift={entry.status?.cyclesInWindow ?? 0}
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
          <section aria-labelledby="dashboard-events">
            <Title level={5} id="dashboard-events" style={{ marginBottom: 12 }}>
              {constants.LABELS.RECENT_EVENTS_TITLE}
            </Title>
            <Card size="small">{recentEventsSlot}</Card>
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
          userRole={userRole as Role}
          currentMessage={activeStopModal.stop.message ?? ''}
          detectedAt={activeStopModal.stop.startTime}
          onSaved={handleSaveSuccess}
        />
      ) : null}
    </Space>
  );
}
