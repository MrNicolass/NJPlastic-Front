'use client';

import { Button, Card, Col, DatePicker, Row, Select, Space, Table, Tag, Typography } from 'antd';
import type { TablePaginationConfig } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { REPORTS_LIBRARY, UTILS } from '@/constants/ConstantsAndParams';
import type { Page } from '@/models/types/Page';
import type {
  ReportHistoryFilters,
  ReportHistoryResponse,
  ReportType,
} from '@/models/types/ReportTypes';
import ReportsService from '@/services/ReportsService';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const PAGE_SIZE_DEFAULT = 20;

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const TYPE_OPTIONS = [
  { value: 'SHIFT' as ReportType, label: 'Relatório de turno' },
  { value: 'DAILY' as ReportType, label: 'Relatório diário' },
  { value: 'WEEKLY' as ReportType, label: 'Relatório semanal' },
];

/**
 * Library tab of the /relatorios screen. Paginated read of
 * report_history with type and date range filters. The "Baixar" action
 * streams the binary back as a Blob and triggers a download via a
 * hidden anchor.
 */
export function ReportLibraryTab() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [type, setType] = useState<ReportType | undefined>(undefined);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<ReportHistoryFilters>({});
  const [data, setData] = useState<Page<ReportHistoryResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await ReportsService.listHistory(
        { page: pageIndex, size: pageSize, sort: 'generatedAt,desc' },
        appliedFilters,
        true,
      );
      setData(result);
    } catch {
      setData(null);
      NotificationUtils({
        key: REPORTS_LIBRARY.NOTIFICATIONS.ERROR.KEYS.LIST_FAILED,
        type: 'error',
        message: REPORTS_LIBRARY.NOTIFICATIONS.ERROR.TITLES.LIST_FAILED,
        description: REPORTS_LIBRARY.NOTIFICATIONS.ERROR.MESSAGES.LIST_FAILED,
      });
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, appliedFilters]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const applyFilters = useCallback(() => {
    const next: ReportHistoryFilters = {};
    if (type) {
      next.type = type;
    }
    if (range) {
      next.from = range[0].toISOString();
      next.to = range[1].toISOString();
    }
    setAppliedFilters(next);
    setPageIndex(0);
  }, [type, range]);

  const clearFilters = useCallback(() => {
    setType(undefined);
    setRange(null);
    setAppliedFilters({});
    setPageIndex(0);
  }, []);

  const handleDownload = useCallback(async (id: string, filename: string) => {
    setDownloadingId(id);
    try {
      const blob = await ReportsService.downloadArtifact(id, true);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      NotificationUtils({
        key: REPORTS_LIBRARY.NOTIFICATIONS.SUCCESS.KEYS.DOWNLOADED,
        type: 'success',
        message: REPORTS_LIBRARY.NOTIFICATIONS.SUCCESS.TITLES.DOWNLOADED,
        description: REPORTS_LIBRARY.NOTIFICATIONS.SUCCESS.MESSAGES.DOWNLOADED,
      });
    } catch {
      NotificationUtils({
        key: REPORTS_LIBRARY.NOTIFICATIONS.ERROR.KEYS.DOWNLOAD_FAILED,
        type: 'error',
        message: REPORTS_LIBRARY.NOTIFICATIONS.ERROR.TITLES.DOWNLOAD_FAILED,
        description: REPORTS_LIBRARY.NOTIFICATIONS.ERROR.MESSAGES.DOWNLOAD_FAILED,
      });
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const pagination: TablePaginationConfig = useMemo(
    () => ({
      current: pageIndex + 1,
      pageSize,
      total: data?.totalElements ?? 0,
      showSizeChanger: true,
      pageSizeOptions: [10, 20, 50, 100],
      onChange: (nextPage, nextSize) => {
        setPageIndex(nextPage - 1);
        setPageSize(nextSize ?? pageSize);
      },
    }),
    [data?.totalElements, pageIndex, pageSize],
  );

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Text type="secondary">{REPORTS_LIBRARY.DESCRIPTION}</Text>

      <Card>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={8}>
            <Text strong>{REPORTS_LIBRARY.FILTERS.TYPE_LABEL}</Text>
            <Select
              value={type}
              onChange={(value) => setType(value)}
              placeholder={REPORTS_LIBRARY.FILTERS.TYPE_PLACEHOLDER}
              style={{ width: '100%' }}
              allowClear
              options={TYPE_OPTIONS}
            />
          </Col>
          <Col xs={24} md={12}>
            <Text strong>{REPORTS_LIBRARY.FILTERS.PERIOD_LABEL}</Text>
            <RangePicker
              showTime
              style={{ width: '100%' }}
              value={range ?? undefined}
              onChange={(value) => {
                if (value && value[0] && value[1]) {
                  setRange([value[0], value[1]]);
                } else {
                  setRange(null);
                }
              }}
            />
          </Col>
          <Col xs={24} md={4}>
            <Space>
              <Button type="primary" onClick={applyFilters}>
                {REPORTS_LIBRARY.FILTERS.APPLY_BUTTON}
              </Button>
              <Button onClick={clearFilters}>{REPORTS_LIBRARY.FILTERS.CLEAR_BUTTON}</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table<ReportHistoryResponse>
        rowKey="id"
        loading={loading}
        pagination={pagination}
        dataSource={data?.content ?? []}
        locale={{ emptyText: REPORTS_LIBRARY.EMPTY }}
        scroll={{ x: 'max-content' }}
        columns={[
          {
            title: REPORTS_LIBRARY.COLUMNS.TYPE,
            dataIndex: 'type',
            render: (value: string) => <Tag>{value}</Tag>,
          },
          {
            title: REPORTS_LIBRARY.COLUMNS.FORMAT,
            dataIndex: 'format',
            render: (value: string) => <Tag color="blue">{value}</Tag>,
          },
          {
            title: REPORTS_LIBRARY.COLUMNS.GENERATED_AT,
            dataIndex: 'generatedAt',
            render: (value: string) => dayjs(value).format(UTILS.DATE_FORMATS.DISPLAY),
          },
          {
            title: REPORTS_LIBRARY.COLUMNS.SIZE,
            dataIndex: 'sizeBytes',
            render: (value: number) => formatBytes(value),
          },
          {
            title: REPORTS_LIBRARY.COLUMNS.ORIGIN,
            dataIndex: 'scheduleId',
            render: (value: string | null) =>
              value ? REPORTS_LIBRARY.ORIGIN.SCHEDULED : REPORTS_LIBRARY.ORIGIN.MANUAL,
          },
          {
            title: REPORTS_LIBRARY.COLUMNS.ACTIONS,
            key: 'actions',
            render: (_, row) => {
              const filename = row.path.split('/').pop() ?? `report-${row.id}.${row.format.toLowerCase()}`;
              return (
                <Button
                  type="link"
                  loading={downloadingId === row.id}
                  onClick={() => void handleDownload(row.id, filename)}
                >
                  {REPORTS_LIBRARY.DOWNLOAD_BUTTON}
                </Button>
              );
            },
          },
        ]}
      />
    </Space>
  );
}
