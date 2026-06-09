'use client';

import { Button, Card, Col, DatePicker, Empty, Input, Row, Skeleton, Space, Statistic, Table, Tag, Tooltip, Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Schemas } from '@/api/types';
import { REPORTS_SCREEN, UTILS } from '@/constants/ConstantsAndParams';
import MachineService from '@/services/MachineService';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const SHIFT_LOOKBACK_HOURS = 8;

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format(UTILS.DATE_FORMATS.DISPLAY) : '-';

const formatPercent = (value: number | null | undefined) =>
  value === null || value === undefined ? '-' : `${(value * 100).toFixed(1)}%`;

/**
 * Shift Report screen (EP-FE-05 item 3). Consumes
 * {@code GET /reports/shift}: full snapshot for the chosen window grouped by
 * machine, with confirmed cycles, OEE, manual pauses and auto stops. Export
 * to CSV/PDF is intentionally disabled here - that work lives in EP-FE-07
 * (RF16).
 */
export default function RelatoriosPage() {
  const defaultRange = useMemo<[Dayjs, Dayjs]>(
    () => [dayjs().subtract(SHIFT_LOOKBACK_HOURS, 'hour'), dayjs()],
    [],
  );
  const [range, setRange] = useState<[Dayjs, Dayjs]>(defaultRange);
  const [sector, setSector] = useState<string>('');
  const [shift, setShift] = useState<string>('');
  const [report, setReport] = useState<Schemas['ShiftReportResponseDTO'] | null>(null);
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
    } catch {
      setReport(null);
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

  useEffect(() => {
    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sections = report?.machines ?? [];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <header>
        <Title level={3} style={{ marginBottom: 4 }}>
          {REPORTS_SCREEN.LABELS.TITLE}
        </Title>
      </header>

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
            <Input value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Setor" />
          </Col>
          <Col xs={24} md={4}>
            <Text strong>{REPORTS_SCREEN.LABELS.FILTER_SHIFT}</Text>
            <Input value={shift} onChange={(e) => setShift(e.target.value)} placeholder="A/B/C" />
          </Col>
          <Col xs={24} md={4}>
            <Space>
              <Button type="primary" loading={loading} onClick={() => void loadReport()}>
                {REPORTS_SCREEN.LABELS.GENERATE}
              </Button>
              <Tooltip title={REPORTS_SCREEN.LABELS.EXPORT_TOOLTIP}>
                <Button disabled>{REPORTS_SCREEN.LABELS.EXPORT_BUTTON}</Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {loading && !report ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : sections.length === 0 ? (
        <Empty
          description={
            <Space direction="vertical" size={0}>
              <Text strong>{REPORTS_SCREEN.LABELS.EMPTY_TITLE}</Text>
              <Text type="secondary">{REPORTS_SCREEN.LABELS.EMPTY_DESCRIPTION}</Text>
            </Space>
          }
        />
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
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
                  locale={{ emptyText: 'Sem pausas no periodo.' }}
                  columns={[
                    { title: 'Inicio', dataIndex: 'startTime', render: formatDate },
                    { title: 'Fim', dataIndex: 'endTime', render: formatDate },
                    {
                      title: 'Motivo',
                      dataIndex: 'reason',
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
                  locale={{ emptyText: 'Sem paradas no periodo.' }}
                  columns={[
                    { title: 'Inicio', dataIndex: 'startTime', render: formatDate },
                    { title: 'Fim', dataIndex: 'endTime', render: formatDate },
                    {
                      title: 'Motivo',
                      dataIndex: 'reason',
                      render: (value: string | null | undefined) =>
                        value ? value : <Tag color="warning">Sem motivo</Tag>,
                    },
                    {
                      title: 'Mensagem',
                      dataIndex: 'message',
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
