'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Empty, Row, Skeleton, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Schemas } from '@/api/types';
import { CycleTimeChart, type CyclePoint } from '@/components/operator/CycleTimeChart';
import { MachineKpis } from '@/components/operator/MachineKpis';
import { MachineStatusTimeline } from '@/components/operator/MachineStatusTimeline';
import { MachineStopsTable } from '@/components/operator/MachineStopsTable';
import { MoldInfoCard } from '@/components/operator/MoldInfoCard';
import { OperatorsOfShift } from '@/components/operator/OperatorsOfShift';
import { RegisterPauseModal } from '@/components/operator/RegisterPauseModal';
import { RegisterQualityModal } from '@/components/shared/RegisterQualityModal';
import { StopMessageEditModal } from '@/components/shared/StopMessageEditModal';
import { MACHINES } from '@/constants/ConstantsAndParams';
import { usePolling } from '@/hooks/usePolling';
import { useStopEditHistory } from '@/hooks/useStopEditHistory';
import { createPageParams } from '@/models/types/PageParams';
import MachineService from '@/services/MachineService';
import { useSessionStore, type Role } from '@/stores/useSessionStore';
import { njPalette } from '@/theme/njTheme';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Text, Title } = Typography;

const DETAIL_POLL_INTERVAL_MS = 5000;
const STATUS_LOOKBACK_HOURS = 8;
const CYCLES_PAGE_SIZE = 200;

type MachineSnapshot = {
  detail: Schemas['MachineDetailResponseDTO'];
  status: Schemas['MachineStatusResponseDTO'];
  cycles: CyclePoint[];
  oee: Schemas['OeeResultDTO'] | null;
  windowStartIso: string;
  windowEndIso: string;
};

type Entry = Schemas['MachineStatusEntryDTO'];

const STATE_BADGE_COLOR: Record<NonNullable<Entry['state']> | 'UNKNOWN', string> = {
  RUNNING: njPalette.cobalt,
  PAUSED: njPalette.cerulean,
  AUTO_STOPPED: njPalette.cinnabar,
  OFFLINE: njPalette.warmGray,
  UNKNOWN: njPalette.warmGray,
};

const STATE_LABEL: Record<NonNullable<Entry['state']> | 'UNKNOWN', string> = {
  RUNNING: MACHINES.STATE_LABELS.RUNNING,
  PAUSED: MACHINES.STATE_LABELS.PAUSED,
  AUTO_STOPPED: MACHINES.STATE_LABELS.AUTO_STOPPED,
  OFFLINE: MACHINES.STATE_LABELS.OFFLINE,
  UNKNOWN: MACHINES.STATE_LABELS.UNKNOWN,
};

const buildSnapshotFetcher = (machineId: string) => async (): Promise<MachineSnapshot> => {
  const to = dayjs();
  const from = to.subtract(STATUS_LOOKBACK_HOURS, 'hour');
  const [detail, status, cyclesPage, oee] = await Promise.all([
    MachineService.getDetail(machineId, true),
    MachineService.getStatus(machineId, from.toISOString(), to.toISOString(), true),
    MachineService.getCycles(
      createPageParams(0, CYCLES_PAGE_SIZE, 'pulseTimestamp,desc'),
      machineId,
      true,
    ),
    MachineService.getOee(machineId, from.toISOString(), to.toISOString(), true).catch(
      () => null,
    ),
  ]);
  const cycles: CyclePoint[] = cyclesPage.content
    .filter((cycle) => typeof cycle.pulseTimestamp === 'string' && typeof cycle.intervalMs === 'number')
    .map((cycle) => ({
      timestamp: cycle.pulseTimestamp as string,
      intervalMs: cycle.intervalMs as number,
    }));
  return {
    detail,
    status,
    cycles,
    oee,
    windowStartIso: from.toISOString(),
    windowEndIso: to.toISOString(),
  };
};

const computeAverageCycle = (cycles: CyclePoint[]): number | null => {
  if (cycles.length === 0) {
    return null;
  }
  const sum = cycles.reduce((accumulator, cycle) => accumulator + cycle.intervalMs, 0);
  return sum / cycles.length;
};

const computeMtbfMinutes = (entries: Entry[]): number | null => {
  const breaks = entries.filter(
    (entry) => entry.state === 'PAUSED' || entry.state === 'AUTO_STOPPED',
  );
  if (breaks.length < 2) {
    return null;
  }
  let totalRunMs = 0;
  for (let index = 1; index < breaks.length; index += 1) {
    const previousEnd = breaks[index - 1].endTime;
    const currentStart = breaks[index].startTime;
    if (!previousEnd) {
      continue;
    }
    totalRunMs += new Date(currentStart).getTime() - new Date(previousEnd).getTime();
  }
  if (totalRunMs <= 0) {
    return null;
  }
  return totalRunMs / 60_000 / breaks.length;
};

const downloadCsv = (filename: string, header: string[], rows: string[][]) => {
  const escape = (cell: string) =>
    /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
  const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Detail screen of a single machine (RFC §4.2.4). Pulls the machine
 * projection, the status timeline, the cycle series and the OEE in
 * parallel every 5 seconds, sharing one polling loop across all
 * sub-components. Hosts the 3 modals that change machine data:
 * `<RegisterPauseModal>` (UC03), `<StopMessageEditModal>` (UC12) and
 * `<RegisterQualityModal>` (RF10 quality factor).
 */
export default function MachineDetailPage() {
  const params = useParams<{ machineId: string }>();
  const router = useRouter();
  const role = useSessionStore((state) => state.role);
  const machineId = params.machineId;

  const fetcher = useMemo(() => buildSnapshotFetcher(machineId), [machineId]);
  const { data, loading, error, refetch } = usePolling<MachineSnapshot>(
    fetcher,
    DETAIL_POLL_INTERVAL_MS,
  );

  const [stopModalEntry, setStopModalEntry] = useState<Entry | null>(null);
  const [pauseModalEntry, setPauseModalEntry] = useState<Entry | null>(null);
  const [qualityOpen, setQualityOpen] = useState(false);

  useEffect(() => {
    if (error && !data) {
      NotificationUtils({
        key: MACHINES.NOTIFICATIONS.ERROR.KEYS.DETAIL_FAILED,
        type: 'error',
        message: MACHINES.NOTIFICATIONS.ERROR.TITLES.DETAIL_FAILED,
        description: MACHINES.NOTIFICATIONS.ERROR.MESSAGES.DETAIL_FAILED,
      });
    }
  }, [error, data]);

  const editHistoryEnabled =
    !!stopModalEntry && role !== null && role !== 'OPERATOR';

  const {
    editHistory,
    loading: editHistoryLoading,
    error: editHistoryError,
  } = useStopEditHistory(machineId, stopModalEntry?.id ?? '', {
    enabled: editHistoryEnabled,
  });

  const handleSaveSuccess = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleExport = useCallback(() => {
    if (!data) {
      return;
    }
    const header = ['state', 'reason', 'message', 'startTime', 'endTime'];
    const rows = data.status.timeline.map((entry) => [
      entry.state ?? '',
      entry.reason ?? '',
      entry.message ?? '',
      entry.startTime ?? '',
      entry.endTime ?? '',
    ]);
    downloadCsv(`${data.detail.code}-turno.csv`, header, rows);
  }, [data]);

  if (loading && !data && !error) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (!data) {
    return (
      <Empty description="Nao foi possivel carregar os dados da maquina.">
        <Button onClick={() => router.push('/dashboard')}>
          {MACHINES.DETAIL.LABELS.BACK_BUTTON}
        </Button>
      </Empty>
    );
  }

  const currentState = (data.status.current?.state ?? 'UNKNOWN') as
    | NonNullable<Entry['state']>
    | 'UNKNOWN';
  const averageCycleMs = computeAverageCycle(data.cycles);
  const mtbfMinutes = computeMtbfMinutes(data.status.timeline);
  const scrapPercent =
    typeof data.oee?.quality === 'number' ? Math.max(0, 1 - data.oee.quality) : null;

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/dashboard')}
          >
            {MACHINES.DETAIL.LABELS.BACK_BUTTON}
          </Button>
          <Title level={3} style={{ marginBottom: 0 }}>
            <Text code>{data.detail.code}</Text>
          </Title>
          {data.detail.description ? (
            <Text type="secondary">{data.detail.description}</Text>
          ) : null}
          <Badge
            color={STATE_BADGE_COLOR[currentState]}
            text={`${MACHINES.DETAIL.LABELS.HEADER_BADGE_PREFIX} ${STATE_LABEL[currentState]}`}
          />
        </Space>
        <Space>
          <Button onClick={handleExport}>{MACHINES.DETAIL.LABELS.EXPORT_BUTTON}</Button>
          <Button type="primary" onClick={() => setQualityOpen(true)}>
            {MACHINES.DETAIL.BUTTONS.REGISTER_QUALITY}
          </Button>
        </Space>
      </Space>

      <MachineKpis
        oee={data.oee}
        cyclesInShift={data.cycles.length}
        averageCycleMs={averageCycleMs}
        mtbfMinutes={mtbfMinutes}
        scrapPercent={scrapPercent}
      />

      <Card>
        <CycleTimeChart
          cycles={data.cycles}
          standardCycleMs={data.detail.standardCycleMs}
          toleranceFactor={data.detail.toleranceFactor}
        />
      </Card>

      <Card>
        <MachineStatusTimeline
          windowStartIso={data.windowStartIso}
          windowEndIso={data.windowEndIso}
          entries={data.status.timeline}
        />
      </Card>

      <Card>
        <MachineStopsTable
          entries={data.status.timeline}
          onEditAutoStop={(entry) => setStopModalEntry(entry)}
          onRegisterPause={(entry) => setPauseModalEntry(entry)}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <MoldInfoCard detail={data.detail} />
        </Col>
        <Col xs={24} md={12}>
          <OperatorsOfShift operators={[]} />
        </Col>
      </Row>

      {stopModalEntry ? (
        <StopMessageEditModal
          open
          onClose={() => setStopModalEntry(null)}
          machineId={machineId}
          machineCode={data.detail.code}
          stopId={stopModalEntry.id}
          userRole={(role ?? 'OPERATOR') as Role}
          currentMessage={stopModalEntry.message ?? ''}
          detectedAt={stopModalEntry.startTime}
          scopeSectorLabel={data.detail.sector}
          editHistory={editHistory}
          editHistoryLoading={editHistoryLoading}
          editHistoryError={editHistoryError}
          onSaved={handleSaveSuccess}
        />
      ) : null}

      {pauseModalEntry ? (
        <RegisterPauseModal
          open
          onClose={() => setPauseModalEntry(null)}
          machineId={machineId}
          machineCode={data.detail.code}
          pauseStartedAt={pauseModalEntry.startTime}
          onRegistered={handleSaveSuccess}
        />
      ) : null}

      {qualityOpen ? (
        <RegisterQualityModal
          open
          onClose={() => setQualityOpen(false)}
          machineId={machineId}
          machineCode={data.detail.code}
          defaultFrom={data.windowStartIso}
          defaultTo={data.windowEndIso}
          onRegistered={handleSaveSuccess}
        />
      ) : null}
    </Space>
  );
}
