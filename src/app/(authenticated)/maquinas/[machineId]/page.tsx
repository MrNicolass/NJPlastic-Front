'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Empty, Row, Space, Tabs, Typography } from 'antd';
import dayjs from 'dayjs';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Schemas } from '@/api/types';
import { CycleTimeChart } from '@/components/operator/CycleTimeChart';
import type { CyclePoint } from '@/models/types/CycleTimeChart';
import type { MachineSnapshot } from '@/models/types/MachineDetail';
import type { OperatorOfShift } from '@/models/types/OperatorsOfShift';
import { MachineKpis } from '@/components/operator/MachineKpis';
import { MachineStatusTimeline } from '@/components/operator/MachineStatusTimeline';
import { MachineStopsTable } from '@/components/operator/MachineStopsTable';
import { MoldInfoCard } from '@/components/operator/MoldInfoCard';
import { OperatorsOfShift } from '@/components/operator/OperatorsOfShift';
import { RegisterPauseModal } from '@/components/operator/RegisterPauseModal';
import { ExportButton, type ExportFormat } from '@/components/shared/ExportButton';
import { RegisterQualityModal } from '@/components/shared/RegisterQualityModal';
import { DashboardSkeleton } from '@/components/shared/Skeletons';
import { StopMessageEditModal } from '@/components/shared/StopMessageEditModal';
import { EXPORT, MACHINES, UTILS } from '@/constants/ConstantsAndParams';
import { usePolling } from '@/hooks/usePolling';
import { useStopEditHistory } from '@/hooks/useStopEditHistory';
import { createPageParams } from '@/models/types/PageParams';
import MachineService from '@/services/MachineService';
import { useSessionStore, type Role } from '@/stores/useSessionStore';
import { njPalette } from '@/theme/njTheme';
import {
  buildExportFilename,
  exportToCsv,
  exportToPdf,
  type ExportColumn,
} from '@/utils/ExportUtils';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Text } = Typography;

const DETAIL_POLL_INTERVAL_MS = 5000;
const STATUS_LOOKBACK_HOURS = 8;
const CYCLES_PAGE_SIZE = 200;

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

/**
 * Detail screen of a single machine. Pulls the machine
 * projection, the status timeline, the cycle series and the OEE in
 * parallel every 5 seconds, sharing one polling loop across all
 * sub-components. Hosts the 3 modals that change machine data:
 * `<RegisterPauseModal>`, `<StopMessageEditModal>` and
 * `<RegisterQualityModal>` (quality factor).
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
  const [operators, setOperators] = useState<OperatorOfShift[]>([]);

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

  useEffect(() => {
    let cancelled = false;
    MachineService.listOperatorsOfShift(machineId, undefined, true)
      .then((rows) => {
        if (!cancelled) {
          setOperators(rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOperators([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [machineId]);

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

  const handleExport = useCallback(
    (format: ExportFormat) => {
      if (!data) {
        return;
      }
      const columns: ExportColumn<Record<string, unknown>>[] = [
        { key: 'state', label: 'Estado' },
        { key: 'reason', label: 'Motivo' },
        { key: 'message', label: 'Mensagem' },
        { key: 'startTime', label: 'Início' },
        { key: 'endTime', label: 'Fim' },
      ];
      const rows: Record<string, unknown>[] = data.status.timeline.map((entry) => ({
        state: entry.state ?? '',
        reason: entry.reason ?? '',
        message: entry.message ?? '',
        startTime: entry.startTime ? dayjs(entry.startTime).format(UTILS.DATE_FORMATS.DISPLAY) : '',
        endTime: entry.endTime ? dayjs(entry.endTime).format(UTILS.DATE_FORMATS.DISPLAY) : '',
      }));
      if (rows.length === 0) {
        NotificationUtils({
          key: EXPORT.NOTIFICATIONS.ERROR.KEYS.EXPORT_FAILED,
          type: 'warning',
          message: EXPORT.NOTIFICATIONS.ERROR.TITLES.EXPORT_FAILED,
          description: EXPORT.NOTIFICATIONS.ERROR.MESSAGES.EMPTY_DATASET,
        });
        return;
      }
      const pattern = EXPORT.FILENAMES.MACHINE_CYCLES.replace('{code}', data.detail.code);
      const filename = buildExportFilename(pattern, format);
      try {
        if (format === 'csv') {
          exportToCsv(rows, columns, filename);
        } else {
          exportToPdf(rows, columns, filename, {
            title: `Máquina ${data.detail.code}`,
            subtitle: data.detail.description ?? '',
          });
        }
        NotificationUtils({
          key: EXPORT.NOTIFICATIONS.SUCCESS.KEYS.EXPORTED,
          type: 'success',
          message: EXPORT.NOTIFICATIONS.SUCCESS.TITLES.EXPORTED,
          description: EXPORT.NOTIFICATIONS.SUCCESS.MESSAGES.EXPORTED(
            format.toUpperCase() as 'CSV' | 'PDF',
            rows.length,
          ),
        });
      } catch {
        NotificationUtils({
          key: EXPORT.NOTIFICATIONS.ERROR.KEYS.EXPORT_FAILED,
          type: 'error',
          message: EXPORT.NOTIFICATIONS.ERROR.TITLES.EXPORT_FAILED,
          description: EXPORT.NOTIFICATIONS.ERROR.MESSAGES.EXPORT_FAILED,
        });
      }
    },
    [data],
  );

  if (loading && !data && !error) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <Empty description={MACHINES.DETAIL.LABELS.LOAD_FAILED}>
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
    <Space orientation="vertical" size={20} style={{ width: '100%' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
        <Space align="center" size={12}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/dashboard')}
          >
            {MACHINES.DETAIL.LABELS.BACK_BUTTON}
          </Button>
          <Text code style={{ fontSize: 16, lineHeight: 1.5 }}>
            {data.detail.code}
          </Text>
          {data.detail.description ? (
            <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.5 }}>
              {data.detail.description}
            </Text>
          ) : null}
          <Badge
            color={STATE_BADGE_COLOR[currentState]}
            text={`${MACHINES.DETAIL.LABELS.HEADER_BADGE_PREFIX} ${STATE_LABEL[currentState]}`}
          />
        </Space>
        <Space>
          <ExportButton onExport={handleExport} />
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

      <Card title={MACHINES.DETAIL.LABELS.INSIGHTS_CARD_TITLE}>
        <Space orientation="vertical" size={16} style={{ width: '100%' }}>
          <Space orientation="vertical" size={6} style={{ width: '100%' }}>
            <Text strong>{MACHINES.DETAIL.LABELS.LEGEND_TITLE}</Text>
            <Space size={[16, 8]} wrap>
              <Space size={6}>
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    background: njPalette.cobalt,
                    borderRadius: '50%',
                  }}
                />
                <Text type="secondary">{MACHINES.DETAIL.LABELS.LEGEND_CHART_POINT_IN}</Text>
              </Space>
              <Space size={6}>
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    background: njPalette.cinnabar,
                    borderRadius: '50%',
                  }}
                />
                <Text type="secondary">{MACHINES.DETAIL.LABELS.LEGEND_CHART_POINT_OUT}</Text>
              </Space>
              <Space size={6}>
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: 14,
                    height: 12,
                    background: njPalette.cerulean,
                    opacity: 0.3,
                    borderRadius: 2,
                  }}
                />
                <Text type="secondary">{MACHINES.DETAIL.LABELS.LEGEND_CHART_BAND}</Text>
              </Space>
              <Space size={6}>
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    background: njPalette.cobalt,
                    borderRadius: 2,
                  }}
                />
                <Text type="secondary">{MACHINES.DETAIL.LABELS.LEGEND_STATE_RUNNING}</Text>
              </Space>
              <Space size={6}>
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    background: njPalette.cerulean,
                    borderRadius: 2,
                  }}
                />
                <Text type="secondary">{MACHINES.DETAIL.LABELS.LEGEND_STATE_PAUSED}</Text>
              </Space>
              <Space size={6}>
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    background: njPalette.cinnabar,
                    borderRadius: 2,
                  }}
                />
                <Text type="secondary">{MACHINES.DETAIL.LABELS.LEGEND_STATE_AUTO_STOPPED}</Text>
              </Space>
              <Space size={6}>
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    background: njPalette.warmGray,
                    borderRadius: 2,
                  }}
                />
                <Text type="secondary">{MACHINES.DETAIL.LABELS.LEGEND_STATE_OFFLINE}</Text>
              </Space>
            </Space>
          </Space>
          <Tabs
            defaultActiveKey="chart"
            items={[
              {
                key: 'chart',
                label: MACHINES.DETAIL.LABELS.INSIGHTS_TAB_CHART,
                children: (
                  <CycleTimeChart
                    cycles={data.cycles}
                    standardCycleMs={data.detail.standardCycleMs}
                    toleranceFactor={data.detail.toleranceFactor}
                  />
                ),
              },
              {
                key: 'timeline',
                label: MACHINES.DETAIL.LABELS.INSIGHTS_TAB_TIMELINE,
                children: (
                  <MachineStatusTimeline
                    windowStartIso={data.windowStartIso}
                    windowEndIso={data.windowEndIso}
                    entries={data.status.timeline}
                  />
                ),
              },
            ]}
          />
        </Space>
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
          <OperatorsOfShift operators={operators} />
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
