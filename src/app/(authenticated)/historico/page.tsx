'use client';

import { Card, Col, DatePicker, Empty, Row, Select, Skeleton, Space, Table, Tabs, Tag, Typography } from 'antd';
import type { TablePaginationConfig } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Schemas } from '@/api/types';
import { HISTORY, MACHINES, UTILS } from '@/constants/ConstantsAndParams';
import type { Page } from '@/models/types/Page';
import type { ProductionCycleResponse } from '@/models/types/ProductionCycleResponse';
import MachineService from '@/services/MachineService';
import ProductionEventService from '@/services/ProductionEventService';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PAGE_SIZE_DEFAULT = 20;

type TabKey = 'cycles' | 'pauses' | 'autoStops' | 'events';

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format(UTILS.DATE_FORMATS.DISPLAY) : '-';

const tableLocale = { emptyText: HISTORY.LABELS.EMPTY };

/**
 * Shift Leader history screen (EP-FE-05 item 2). Aggregates four read views
 * over the same `machineId` + period filter: production cycles
 * (paginated via Spring Data), manual pauses and auto stops (derived from
 * the machine status timeline since there is no dedicated paginated
 * endpoint), and manual events. Pauses/auto stops use client-side rendering
 * because the underlying endpoint returns the full timeline for the window.
 */
export default function HistoricoPage() {
  const [machines, setMachines] = useState<Schemas['MachineSummaryDTO'][]>([]);
  const [machineId, setMachineId] = useState<string | undefined>(undefined);
  const defaultRange = useMemo<[Dayjs, Dayjs]>(
    () => [dayjs().subtract(HISTORY.LABELS.DEFAULT_LOOKBACK_HOURS, 'hour'), dayjs()],
    [],
  );
  const [range, setRange] = useState<[Dayjs, Dayjs]>(defaultRange);
  const [activeTab, setActiveTab] = useState<TabKey>('cycles');

  const [cyclesPage, setCyclesPage] = useState(0);
  const [cyclesSize, setCyclesSize] = useState(PAGE_SIZE_DEFAULT);
  const [cyclesData, setCyclesData] = useState<Page<ProductionCycleResponse> | null>(null);
  const [cyclesLoading, setCyclesLoading] = useState(false);

  const [timelineEntries, setTimelineEntries] = useState<Schemas['MachineStatusEntryDTO'][]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const [eventsPage, setEventsPage] = useState(0);
  const [eventsSize, setEventsSize] = useState(PAGE_SIZE_DEFAULT);
  const [eventsData, setEventsData] = useState<Page<Schemas['EventResponseDTO']> | null>(null);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    MachineService.listMachines(true)
      .then((list) => {
        if (cancelled) {
          return;
        }
        setMachines(list);
        if (list.length > 0 && !machineId) {
          setMachineId(list[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMachines([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [machineId]);

  const fromIso = useMemo(() => range[0].toISOString(), [range]);
  const toIso = useMemo(() => range[1].toISOString(), [range]);

  const reloadCycles = useCallback(async () => {
    if (!machineId) {
      setCyclesData(null);
      return;
    }
    setCyclesLoading(true);
    try {
      const result = await MachineService.getCycles(
        { page: cyclesPage, size: cyclesSize, sort: 'pulseTimestamp,desc' },
        machineId,
        true,
      );
      setCyclesData(result);
    } catch {
      setCyclesData(null);
      NotificationUtils({
        key: HISTORY.NOTIFICATIONS.ERROR.KEYS.LOAD_FAILED,
        type: 'error',
        message: HISTORY.NOTIFICATIONS.ERROR.TITLES.LOAD_FAILED,
        description: HISTORY.NOTIFICATIONS.ERROR.MESSAGES.LOAD_FAILED,
      });
    } finally {
      setCyclesLoading(false);
    }
  }, [machineId, cyclesPage, cyclesSize]);

  const reloadTimeline = useCallback(async () => {
    if (!machineId) {
      setTimelineEntries([]);
      return;
    }
    setTimelineLoading(true);
    try {
      const result = await MachineService.getStatus(machineId, fromIso, toIso, true);
      setTimelineEntries(result.timeline ?? []);
    } catch {
      setTimelineEntries([]);
      NotificationUtils({
        key: HISTORY.NOTIFICATIONS.ERROR.KEYS.LOAD_FAILED,
        type: 'error',
        message: HISTORY.NOTIFICATIONS.ERROR.TITLES.LOAD_FAILED,
        description: HISTORY.NOTIFICATIONS.ERROR.MESSAGES.LOAD_FAILED,
      });
    } finally {
      setTimelineLoading(false);
    }
  }, [machineId, fromIso, toIso]);

  const reloadEvents = useCallback(async () => {
    if (!machineId) {
      setEventsData(null);
      return;
    }
    setEventsLoading(true);
    try {
      const result = await ProductionEventService.listForMachine(
        { page: eventsPage, size: eventsSize, sort: 'startedAt,desc' },
        machineId,
        fromIso,
        toIso,
        true,
      );
      setEventsData(result);
    } catch {
      setEventsData(null);
      NotificationUtils({
        key: HISTORY.NOTIFICATIONS.ERROR.KEYS.LOAD_FAILED,
        type: 'error',
        message: HISTORY.NOTIFICATIONS.ERROR.TITLES.LOAD_FAILED,
        description: HISTORY.NOTIFICATIONS.ERROR.MESSAGES.LOAD_FAILED,
      });
    } finally {
      setEventsLoading(false);
    }
  }, [machineId, eventsPage, eventsSize, fromIso, toIso]);

  useEffect(() => {
    if (activeTab === 'cycles') {
      void reloadCycles();
    }
  }, [activeTab, reloadCycles]);

  useEffect(() => {
    if (activeTab === 'pauses' || activeTab === 'autoStops') {
      void reloadTimeline();
    }
  }, [activeTab, reloadTimeline]);

  useEffect(() => {
    if (activeTab === 'events') {
      void reloadEvents();
    }
  }, [activeTab, reloadEvents]);

  const pauses = useMemo(
    () => timelineEntries.filter((entry) => entry.state === 'PAUSED'),
    [timelineEntries],
  );
  const autoStops = useMemo(
    () => timelineEntries.filter((entry) => entry.state === 'AUTO_STOPPED'),
    [timelineEntries],
  );

  const cyclesPager: TablePaginationConfig = {
    current: cyclesPage + 1,
    pageSize: cyclesSize,
    total: cyclesData?.totalElements ?? 0,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50, 100],
    onChange: (nextPage, nextSize) => {
      setCyclesPage(nextPage - 1);
      setCyclesSize(nextSize ?? cyclesSize);
    },
  };

  const eventsPager: TablePaginationConfig = {
    current: eventsPage + 1,
    pageSize: eventsSize,
    total: eventsData?.totalElements ?? 0,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50, 100],
    onChange: (nextPage, nextSize) => {
      setEventsPage(nextPage - 1);
      setEventsSize(nextSize ?? eventsSize);
    },
  };

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <header>
        <Title level={3} style={{ marginBottom: 4 }}>
          {HISTORY.LABELS.TITLE}
        </Title>
      </header>

      <Card>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={10}>
            <Text strong>{HISTORY.LABELS.FILTER_MACHINE}</Text>
            <Select
              value={machineId}
              onChange={setMachineId}
              placeholder={HISTORY.LABELS.FILTER_MACHINE_PLACEHOLDER}
              style={{ width: '100%' }}
              options={machines.map((m) => ({ value: m.id, label: `${m.code} - ${m.description ?? ''}` }))}
              showSearch
              optionFilterProp="label"
            />
          </Col>
          <Col xs={24} md={14}>
            <Text strong>{HISTORY.LABELS.FILTER_PERIOD}</Text>
            <RangePicker
              showTime
              style={{ width: '100%' }}
              value={range}
              onChange={(value) => {
                if (value && value[0] && value[1]) {
                  setRange([value[0], value[1]]);
                  setCyclesPage(0);
                  setEventsPage(0);
                }
              }}
            />
          </Col>
        </Row>
      </Card>

      {!machineId ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
          items={[
            {
              key: 'cycles',
              label: HISTORY.LABELS.TAB_CYCLES,
              children: (
                <Table<ProductionCycleResponse>
                  rowKey={(row) => `${row.machineId}-${row.sequence}-${row.pulseTimestamp}`}
                  loading={cyclesLoading}
                  pagination={cyclesPager}
                  dataSource={cyclesData?.content ?? []}
                  locale={tableLocale}
                  columns={[
                    {
                      title: HISTORY.LABELS.COL_PULSE,
                      dataIndex: 'pulseTimestamp',
                      render: formatDate,
                    },
                    {
                      title: HISTORY.LABELS.COL_RECEIVED,
                      dataIndex: 'receivedAt',
                      render: formatDate,
                    },
                    {
                      title: HISTORY.LABELS.COL_SEQUENCE,
                      dataIndex: 'sequence',
                      align: 'right',
                    },
                    {
                      title: HISTORY.LABELS.COL_INTERVAL_MS,
                      dataIndex: 'intervalMs',
                      align: 'right',
                      render: (value: number | null | undefined) =>
                        value === null || value === undefined ? '-' : value.toLocaleString('pt-BR'),
                    },
                    {
                      title: HISTORY.LABELS.COL_STATE,
                      dataIndex: 'state',
                      render: (value: string | undefined) => (value ? <Tag>{value}</Tag> : '-'),
                    },
                  ]}
                />
              ),
            },
            {
              key: 'pauses',
              label: HISTORY.LABELS.TAB_PAUSES,
              children:
                pauses.length === 0 && !timelineLoading ? (
                  <Empty description={HISTORY.LABELS.EMPTY} />
                ) : (
                  <Table<Schemas['MachineStatusEntryDTO']>
                    rowKey="id"
                    loading={timelineLoading}
                    pagination={{ pageSize: PAGE_SIZE_DEFAULT, showSizeChanger: true }}
                    dataSource={pauses}
                    locale={tableLocale}
                    columns={[
                      { title: HISTORY.LABELS.COL_START, dataIndex: 'startTime', render: formatDate },
                      { title: HISTORY.LABELS.COL_END, dataIndex: 'endTime', render: formatDate },
                      {
                        title: HISTORY.LABELS.COL_REASON,
                        dataIndex: 'reason',
                        render: (value: string | null | undefined) => value ?? '-',
                      },
                      {
                        title: HISTORY.LABELS.COL_MESSAGE,
                        dataIndex: 'message',
                        render: (value: string | null | undefined) => value ?? '-',
                      },
                    ]}
                  />
                ),
            },
            {
              key: 'autoStops',
              label: HISTORY.LABELS.TAB_AUTO_STOPS,
              children:
                autoStops.length === 0 && !timelineLoading ? (
                  <Empty description={HISTORY.LABELS.EMPTY} />
                ) : (
                  <Table<Schemas['MachineStatusEntryDTO']>
                    rowKey="id"
                    loading={timelineLoading}
                    pagination={{ pageSize: PAGE_SIZE_DEFAULT, showSizeChanger: true }}
                    dataSource={autoStops}
                    locale={tableLocale}
                    columns={[
                      { title: HISTORY.LABELS.COL_START, dataIndex: 'startTime', render: formatDate },
                      { title: HISTORY.LABELS.COL_END, dataIndex: 'endTime', render: formatDate },
                      {
                        title: HISTORY.LABELS.COL_REASON,
                        dataIndex: 'reason',
                        render: (value: string | null | undefined) =>
                          value ? value : <Tag color="warning">{MACHINES.STATE_LABELS.AUTO_STOPPED}</Tag>,
                      },
                      {
                        title: HISTORY.LABELS.COL_MESSAGE,
                        dataIndex: 'message',
                        render: (value: string | null | undefined) => value ?? '-',
                      },
                    ]}
                  />
                ),
            },
            {
              key: 'events',
              label: HISTORY.LABELS.TAB_EVENTS,
              children: (
                <Table<Schemas['EventResponseDTO']>
                  rowKey="id"
                  loading={eventsLoading}
                  pagination={eventsPager}
                  dataSource={eventsData?.content ?? []}
                  locale={tableLocale}
                  columns={[
                    { title: HISTORY.LABELS.COL_START, dataIndex: 'startedAt', render: formatDate },
                    { title: HISTORY.LABELS.COL_END, dataIndex: 'endedAt', render: formatDate },
                    { title: HISTORY.LABELS.COL_TYPE, dataIndex: 'type', render: (value: string) => <Tag>{value}</Tag> },
                    {
                      title: HISTORY.LABELS.COL_DESCRIPTION,
                      dataIndex: 'description',
                      render: (value: string | null | undefined) => value ?? '-',
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      )}
    </Space>
  );
}
