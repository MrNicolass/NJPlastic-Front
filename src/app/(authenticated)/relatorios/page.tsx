'use client';

import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Input,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { TabsProps } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import type { Schemas } from '@/api/types';
import { AuditLogsTab } from '@/components/manager/AuditLogsTab';
import { ReportLibraryTab } from '@/components/reports/ReportLibraryTab';
import { ScheduleListTab } from '@/components/reports/ScheduleListTab';
import { ExportButton, type ExportFormat } from '@/components/shared/ExportButton';
import { TableSkeleton } from '@/components/shared/Skeletons';
import {
  AUDIT,
  EXPORT,
  REPORTS_LIBRARY,
  REPORTS_SCHEDULE,
  REPORTS_SCREEN,
  UTILS,
} from '@/constants/ConstantsAndParams';
import MachineService from '@/services/MachineService';
import { useSessionStore } from '@/stores/useSessionStore';
import {
  buildExportFilename,
  exportToCsv,
  exportToPdf,
  type ExportColumn,
} from '@/utils/ExportUtils';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const SHIFT_LOOKBACK_HOURS = 8;

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format(UTILS.DATE_FORMATS.DISPLAY) : '-';

const formatPercent = (value: number | null | undefined) =>
  value === null || value === undefined ? '-' : `${(value * 100).toFixed(1)}%`;

/**
 * Shift Report tab content (item 3). Consumes
 * {@code GET /reports/shift}: full snapshot for the chosen window grouped by
 * machine, with confirmed cycles, OEE, manual pauses and auto stops. The
 * fetch only fires on user action - the initial empty state explicitly
 * tells the user to define a period and click "Gerar relatorio". A success
 * notification is fired on every fetch so an empty result still gives
 * visible feedback that the request reached the backend.
 */
function ShiftReportTab() {
  const defaultRange = useMemo<[Dayjs, Dayjs]>(
    () => [dayjs().subtract(SHIFT_LOOKBACK_HOURS, 'hour'), dayjs()],
    [],
  );
  const [range, setRange] = useState<[Dayjs, Dayjs]>(defaultRange);
  const [sector, setSector] = useState<string>('');
  const [shift, setShift] = useState<string>('');
  const [report, setReport] = useState<Schemas['ShiftReportResponseDTO'] | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const result = await MachineService.getShiftReport(
        range[0].toISOString(),
        range[1].toISOString(),
        sector || undefined,
        shift || undefined,
        true,
      );
      setReport(result);
      setHasFetched(true);
      const count = result.machines?.length ?? 0;
      NotificationUtils({
        key: REPORTS_SCREEN.NOTIFICATIONS.SUCCESS.KEYS.REPORT_GENERATED,
        type: 'success',
        message: REPORTS_SCREEN.NOTIFICATIONS.SUCCESS.TITLES.REPORT_GENERATED,
        description: REPORTS_SCREEN.NOTIFICATIONS.SUCCESS.MESSAGES.REPORT_GENERATED(count),
      });
    } catch {
      setReport(null);
      setHasFetched(true);
      NotificationUtils({
        key: REPORTS_SCREEN.NOTIFICATIONS.ERROR.KEYS.LOAD_FAILED,
        type: 'error',
        message: REPORTS_SCREEN.NOTIFICATIONS.ERROR.TITLES.LOAD_FAILED,
        description: REPORTS_SCREEN.NOTIFICATIONS.ERROR.MESSAGES.LOAD_FAILED,
      });
    } finally {
      setLoading(false);
    }
  }, [range, sector, shift]);

  const sections = useMemo(() => report?.machines ?? [], [report]);

  const handleExport = useCallback(
    (format: ExportFormat) => {
      if (!report || sections.length === 0) {
        NotificationUtils({
          key: EXPORT.NOTIFICATIONS.ERROR.KEYS.EXPORT_FAILED,
          type: 'warning',
          message: EXPORT.NOTIFICATIONS.ERROR.TITLES.EXPORT_FAILED,
          description: EXPORT.NOTIFICATIONS.ERROR.MESSAGES.EMPTY_DATASET,
        });
        return;
      }
      const columns: ExportColumn<Record<string, unknown>>[] = [
        { key: 'machine_code', label: 'Máquina' },
        { key: 'sector', label: 'Setor' },
        { key: 'confirmed_cycles', label: 'Ciclos' },
        { key: 'availability', label: 'Disponibilidade' },
        { key: 'performance', label: 'Performance' },
        { key: 'quality', label: 'Qualidade' },
        { key: 'oee', label: 'OEE' },
        { key: 'manual_pauses_count', label: 'Pausas manuais' },
        { key: 'auto_stops_count', label: 'Paradas auto.' },
      ];
      const rows: Record<string, unknown>[] = sections.map((section) => ({
        machine_code: section.machine?.code ?? '-',
        sector: section.machine?.sector ?? '-',
        confirmed_cycles: section.confirmedCycles ?? 0,
        availability: section.oee?.availability ?? '',
        performance: section.oee?.performance ?? '',
        quality: section.oee?.quality ?? '',
        oee: section.oee?.oee ?? '',
        manual_pauses_count: section.manualPauses?.length ?? 0,
        auto_stops_count: section.autoStops?.length ?? 0,
      }));
      const filename = buildExportFilename(EXPORT.FILENAMES.SHIFT_REPORT, format);
      try {
        if (format === 'csv') {
          exportToCsv(rows, columns, filename);
        } else {
          exportToPdf(rows, columns, filename, {
            title: REPORTS_SCREEN.LABELS.TITLE,
            subtitle: `Período ${range[0].format(UTILS.DATE_FORMATS.DISPLAY)} - ${range[1].format(UTILS.DATE_FORMATS.DISPLAY)}`,
            filters: { Setor: sector || undefined, Turno: shift || undefined },
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
    [range, report, sections, sector, shift],
  );

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <Card>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={10}>
            <Text strong>{REPORTS_SCREEN.LABELS.FILTER_PERIOD}</Text>
            <RangePicker
              showTime
              style={{ width: '100%' }}
              value={range}
              onChange={(value) => {
                if (value && value[0] && value[1]) {
                  setRange([value[0], value[1]]);
                }
              }}
            />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>{REPORTS_SCREEN.LABELS.FILTER_SECTOR}</Text>
            <Input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder={REPORTS_SCREEN.FILTER_PLACEHOLDERS.SECTOR}
            />
          </Col>
          <Col xs={24} md={4}>
            <Text strong>{REPORTS_SCREEN.LABELS.FILTER_SHIFT}</Text>
            <Input
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              placeholder={REPORTS_SCREEN.FILTER_PLACEHOLDERS.SHIFT}
            />
          </Col>
          <Col xs={24} md={4}>
            <Space>
              <Button type="primary" loading={loading} onClick={() => void loadReport()}>
                {REPORTS_SCREEN.LABELS.GENERATE}
              </Button>
              <ExportButton
                onExport={handleExport}
                disabled={!report || sections.length === 0}
                tooltip={!report ? EXPORT.TOOLTIP_DISABLED : undefined}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {loading && !report ? (
        <TableSkeleton rowCount={6} />
      ) : sections.length === 0 ? (
        <Empty
          description={
            <Space orientation="vertical" size={0}>
              <Text strong>
                {hasFetched
                  ? REPORTS_SCREEN.LABELS.EMPTY_TITLE
                  : REPORTS_SCREEN.LABELS.INITIAL_EMPTY_TITLE}
              </Text>
              <Text type="secondary">
                {hasFetched
                  ? REPORTS_SCREEN.LABELS.EMPTY_DESCRIPTION
                  : REPORTS_SCREEN.LABELS.INITIAL_EMPTY_DESCRIPTION}
              </Text>
            </Space>
          }
        />
      ) : (
        <Space orientation="vertical" size={16} style={{ width: '100%' }}>
          {sections.map((section) => {
            const oee = section.oee?.oee ?? null;
            const cycles = section.confirmedCycles ?? 0;
            const pauses = section.manualPauses ?? [];
            const stops = section.autoStops ?? [];
            const machineCode = section.machine?.code ?? '-';
            return (
              <Card
                key={section.machine?.id ?? machineCode}
                title={REPORTS_SCREEN.LABELS.MACHINE_SECTION_TITLE(machineCode)}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={12} md={6}>
                    <Statistic title={REPORTS_SCREEN.LABELS.CYCLES_LABEL} value={cycles} />
                  </Col>
                  <Col xs={12} md={6}>
                    <Statistic title={REPORTS_SCREEN.LABELS.OEE_LABEL} value={formatPercent(oee)} />
                  </Col>
                </Row>
                <Title level={5} style={{ marginTop: 16 }}>
                  {REPORTS_SCREEN.LABELS.MANUAL_PAUSES_TITLE}
                </Title>
                <Table<Schemas['MachineStatusEntryDTO']>
                  rowKey="id"
                  pagination={false}
                  dataSource={pauses}
                  locale={{ emptyText: REPORTS_SCREEN.TABLE_LABELS.EMPTY_PAUSES }}
                  columns={[
                    {
                      title: REPORTS_SCREEN.TABLE_LABELS.START,
                      dataIndex: 'startTime',
                      key: 'startTime',
                      render: formatDate,
                    },
                    {
                      title: REPORTS_SCREEN.TABLE_LABELS.END,
                      dataIndex: 'endTime',
                      key: 'endTime',
                      render: formatDate,
                    },
                    {
                      title: REPORTS_SCREEN.TABLE_LABELS.REASON,
                      dataIndex: 'reason',
                      key: 'reason',
                      render: (value: string | null | undefined) => value ?? '-',
                    },
                  ]}
                />
                <Title level={5} style={{ marginTop: 16 }}>
                  {REPORTS_SCREEN.LABELS.AUTO_STOPS_TITLE}
                </Title>
                <Table<Schemas['MachineStatusEntryDTO']>
                  rowKey="id"
                  pagination={false}
                  dataSource={stops}
                  locale={{ emptyText: REPORTS_SCREEN.TABLE_LABELS.EMPTY_STOPS }}
                  columns={[
                    {
                      title: REPORTS_SCREEN.TABLE_LABELS.START,
                      dataIndex: 'startTime',
                      key: 'startTime',
                      render: formatDate,
                    },
                    {
                      title: REPORTS_SCREEN.TABLE_LABELS.END,
                      dataIndex: 'endTime',
                      key: 'endTime',
                      render: formatDate,
                    },
                    {
                      title: REPORTS_SCREEN.TABLE_LABELS.REASON,
                      dataIndex: 'reason',
                      key: 'reason',
                      render: (value: string | null | undefined) =>
                        value ? value : (
                          <Tag color="warning">
                            {REPORTS_SCREEN.TABLE_LABELS.NO_REASON_TAG}
                          </Tag>
                        ),
                    },
                    {
                      title: REPORTS_SCREEN.TABLE_LABELS.MESSAGE,
                      dataIndex: 'message',
                      key: 'message',
                      render: (value: string | null | undefined) => value ?? '-',
                    },
                  ]}
                />
              </Card>
            );
          })}
        </Space>
      )}
    </Space>
  );
}

/**
 * /relatorios route. Composes two tabs:
 * - "Relatorio de Turno" (item 3, available to LEADER/MANAGER/ADMIN)
 * - "Auditoria" (sub-task 7, visible only to MANAGER/ADMIN)
 *
 * The audit tab renders the shared AuditLogsTab component, which is also
 * mounted by the standalone /auditoria route.
 */
export default function RelatoriosPage() {
  const role = useSessionStore((state) => state.role);
  const canSeeLibrary = role === 'LEADER' || role === 'MANAGER' || role === 'ADMIN';
  const canManageSchedules = role === 'MANAGER' || role === 'ADMIN';
  const canSeeAudit = role === 'MANAGER' || role === 'ADMIN';

  const items: NonNullable<TabsProps['items']> = [
    {
      key: 'shift',
      label: REPORTS_SCREEN.LABELS.TITLE,
      children: <ShiftReportTab />,
    },
  ];
  if (canSeeLibrary) {
    items.push({
      key: 'library',
      label: REPORTS_LIBRARY.TAB_LABEL,
      children: <ReportLibraryTab />,
    });
  }
  if (canManageSchedules) {
    items.push({
      key: 'schedules',
      label: REPORTS_SCHEDULE.TAB_LABEL,
      children: <ScheduleListTab />,
    });
  }
  if (canSeeAudit) {
    items.push({
      key: 'audit',
      label: AUDIT.PAGE.TITLE,
      children: <AuditLogsTab />,
    });
  }

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <header>
        <Title level={3} style={{ marginBottom: 4 }}>
          {REPORTS_SCREEN.LABELS.TITLE}
        </Title>
      </header>
      <Tabs items={items} />
    </Space>
  );
}
