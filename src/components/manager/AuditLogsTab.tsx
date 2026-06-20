'use client';

import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Empty,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { AUDIT, UTILS } from '@/constants/ConstantsAndParams';
import type { AuditLogFilters } from '@/models/interfaces/services/IAuditLogService';
import type { AuditLogResponse } from '@/models/types/AuditLogResponse';
import { createPageParams } from '@/models/types/PageParams';
import AuditLogService from '@/services/AuditLogService';
import { isUuid } from '@/utils/UuidUtils';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const DEFAULT_PAGE_SIZE = 25;

const statusTagColor = (status: number): string => {
  if (status >= 500) return 'red';
  if (status >= 400) return 'orange';
  if (status >= 300) return 'gold';
  return 'green';
};

const methodTagColor = (method: string): string => {
  if (method === 'GET') return 'blue';
  if (method === 'POST') return 'green';
  if (method === 'PUT') return 'gold';
  if (method === 'DELETE') return 'red';
  return 'default';
};

/**
 * Audit log viewer for Manager (sub-task 7). Used by the
 * Auditoria tab inside /relatorios and by the standalone /auditoria
 * route - the two surfaces share this single component to avoid
 * duplicating logic. Filters compose with AND semantics on the
 * backend; the table forces the natural sort (timestamp DESC) and
 * exposes a detail modal with the sanitized request/response payloads.
 *
 * Filter UX: form inputs feed a transient state. The fetch only fires
 * when the user clicks "Aplicar" (or paginates) - this prevents the
 * keystroke-by-keystroke flood seen in the first cut, which besides
 * pressuring the backend with malformed UUIDs (Bad Request) could
 * cascade into a refresh-token failure and a spurious logout.
 */
export function AuditLogsTab() {
  const [entries, setEntries] = useState<AuditLogResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const [userIdInput, setUserIdInput] = useState<string>('');
  const [endpointInput, setEndpointInput] = useState<string>('');
  const [methodInput, setMethodInput] = useState<string | undefined>(undefined);
  const [statusInput, setStatusInput] = useState<number | undefined>(undefined);
  const [rangeInput, setRangeInput] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const [appliedFilters, setAppliedFilters] = useState<AuditLogFilters>({});

  const [detail, setDetail] = useState<AuditLogResponse | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await AuditLogService.list(
        createPageParams(page, pageSize),
        appliedFilters,
        true,
      );
      setEntries(result.content);
      setTotalElements(result.totalElements);
    } catch {
      NotificationUtils({
        key: AUDIT.NOTIFICATIONS.ERROR.KEYS.LIST_FAILED,
        type: 'error',
        message: AUDIT.NOTIFICATIONS.ERROR.TITLES.LIST_FAILED,
        description: AUDIT.NOTIFICATIONS.ERROR.MESSAGES.LIST_FAILED,
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, appliedFilters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const buildFiltersFromInputs = useCallback((): AuditLogFilters | null => {
    const filters: AuditLogFilters = {};
    const userId = userIdInput.trim();
    if (userId.length > 0) {
      if (!isUuid(userId)) {
        NotificationUtils({
          key: AUDIT.NOTIFICATIONS.WARNING.KEYS.INVALID_UUID,
          type: 'warning',
          message: AUDIT.NOTIFICATIONS.WARNING.TITLES.INVALID_UUID,
          description: AUDIT.NOTIFICATIONS.WARNING.MESSAGES.INVALID_UUID,
        });
        return null;
      }
      filters.userId = userId;
    }
    if (endpointInput.trim().length > 0) {
      filters.endpoint = endpointInput.trim();
    }
    if (methodInput) {
      filters.method = methodInput;
    }
    if (typeof statusInput === 'number') {
      filters.statusCode = statusInput;
    }
    if (rangeInput && rangeInput[0]) {
      filters.from = rangeInput[0].toISOString();
    }
    if (rangeInput && rangeInput[1]) {
      filters.to = rangeInput[1].toISOString();
    }
    return filters;
  }, [userIdInput, endpointInput, methodInput, statusInput, rangeInput]);

  const handleApply = () => {
    const next = buildFiltersFromInputs();
    if (next === null) {
      return;
    }
    setAppliedFilters(next);
    setPage(0);
  };

  const handleClear = () => {
    setUserIdInput('');
    setEndpointInput('');
    setMethodInput(undefined);
    setStatusInput(undefined);
    setRangeInput(null);
    setAppliedFilters({});
    setPage(0);
  };

  const columns: ColumnsType<AuditLogResponse> = [
    {
      title: AUDIT.LIST.LABELS.TIMESTAMP,
      dataIndex: AUDIT.LIST.KEYS.TIMESTAMP,
      key: AUDIT.LIST.KEYS.TIMESTAMP,
      render: (value: string) => dayjs(value).format(UTILS.DATE_FORMATS.DISPLAY),
    },
    {
      title: AUDIT.LIST.LABELS.USER,
      dataIndex: AUDIT.LIST.KEYS.USER,
      key: AUDIT.LIST.KEYS.USER,
      render: (value: string | null | undefined) =>
        value ? <Text code style={{ fontSize: 12 }}>{value}</Text> : '-',
    },
    {
      title: AUDIT.LIST.LABELS.METHOD,
      dataIndex: AUDIT.LIST.KEYS.METHOD,
      key: AUDIT.LIST.KEYS.METHOD,
      render: (value: string) => <Tag color={methodTagColor(value)}>{value}</Tag>,
    },
    {
      title: AUDIT.LIST.LABELS.ENDPOINT,
      dataIndex: AUDIT.LIST.KEYS.ENDPOINT,
      key: AUDIT.LIST.KEYS.ENDPOINT,
      render: (value: string) => <Text code style={{ fontSize: 12 }}>{value}</Text>,
    },
    {
      title: AUDIT.LIST.LABELS.STATUS,
      dataIndex: AUDIT.LIST.KEYS.STATUS,
      key: AUDIT.LIST.KEYS.STATUS,
      align: 'right',
      render: (value: number) => <Tag color={statusTagColor(value)}>{value}</Tag>,
    },
    {
      title: AUDIT.LIST.LABELS.DURATION_MS,
      dataIndex: AUDIT.LIST.KEYS.DURATION_MS,
      key: AUDIT.LIST.KEYS.DURATION_MS,
      align: 'right',
      render: (value: number | null | undefined) => (value ?? '-'),
    },
    {
      title: AUDIT.LIST.LABELS.SOURCE_IP,
      dataIndex: AUDIT.LIST.KEYS.SOURCE_IP,
      key: AUDIT.LIST.KEYS.SOURCE_IP,
      render: (value: string | null | undefined) => value ?? '-',
    },
    {
      title: AUDIT.LIST.LABELS.ACTIONS,
      dataIndex: AUDIT.LIST.KEYS.ACTIONS,
      key: AUDIT.LIST.KEYS.ACTIONS,
      render: (_value, record) => (
        <Button size="small" onClick={() => setDetail(record)}>
          {AUDIT.LIST.LABELS.ACTIONS}
        </Button>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <Card size="small">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Text strong>{AUDIT.FILTERS.USER_ID}</Text>
            <Input
              value={userIdInput}
              onChange={(event) => setUserIdInput(event.target.value)}
              placeholder={AUDIT.FILTERS.USER_ID_PLACEHOLDER}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <Text strong>{AUDIT.FILTERS.ENDPOINT}</Text>
            <Input
              value={endpointInput}
              onChange={(event) => setEndpointInput(event.target.value)}
              placeholder={AUDIT.FILTERS.ENDPOINT_PLACEHOLDER}
              allowClear
            />
          </Col>
          <Col xs={12} md={4}>
            <Text strong>{AUDIT.FILTERS.METHOD}</Text>
            <Select
              value={methodInput}
              onChange={(value) => setMethodInput(value ?? undefined)}
              options={[...AUDIT.FILTERS.METHOD_OPTIONS]}
              placeholder={AUDIT.FILTERS.METHOD_PLACEHOLDER}
              allowClear
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} md={4}>
            <Text strong>{AUDIT.FILTERS.STATUS_CODE}</Text>
            <Select<number>
              value={statusInput}
              onChange={(value) =>
                setStatusInput(typeof value === 'number' ? value : undefined)
              }
              options={[...AUDIT.FILTERS.STATUS_OPTIONS]}
              placeholder={AUDIT.FILTERS.STATUS_CODE_PLACEHOLDER}
              allowClear
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Text strong>{AUDIT.FILTERS.PERIOD}</Text>
            <RangePicker
              showTime
              style={{ width: '100%' }}
              value={rangeInput}
              onChange={(value) => {
                if (value) {
                  setRangeInput([value[0] ?? null, value[1] ?? null]);
                } else {
                  setRangeInput(null);
                }
              }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Space style={{ marginTop: 16 }}>
              <Button type="primary" onClick={handleApply}>
                {AUDIT.FILTERS.APPLY}
              </Button>
              <Button onClick={handleClear}>{AUDIT.FILTERS.CLEAR}</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table<AuditLogResponse>
        rowKey={(record) => record.id}
        dataSource={entries}
        columns={columns}
        loading={loading}
        size="small"
        locale={{
          emptyText: (
            <Empty
              description={
                <Space orientation="vertical" size={0}>
                  <Text strong>{AUDIT.LIST.EMPTY_TITLE}</Text>
                  <Text type="secondary">{AUDIT.LIST.EMPTY_DESCRIPTION}</Text>
                </Space>
              }
            />
          ),
        }}
        pagination={{
          total: totalElements,
          current: page + 1,
          pageSize,
          showSizeChanger: true,
          onChange: (next, nextSize) => {
            setPage(next - 1);
            setPageSize(nextSize);
          },
        }}
      />

      <Modal
        title={AUDIT.DETAIL_MODAL.TITLE}
        open={detail !== null}
        onCancel={() => setDetail(null)}
        footer={[
          <Button key="close" onClick={() => setDetail(null)}>
            {AUDIT.DETAIL_MODAL.BUTTONS.CLOSE}
          </Button>,
        ]}
        width={720}
      >
        {detail ? (
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions size="small" column={2} bordered>
              <Descriptions.Item label={AUDIT.LIST.LABELS.TIMESTAMP}>
                {dayjs(detail.timestamp).format(UTILS.DATE_FORMATS.DISPLAY)}
              </Descriptions.Item>
              <Descriptions.Item label={AUDIT.LIST.LABELS.USER}>
                {detail.userId ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label={AUDIT.LIST.LABELS.METHOD}>
                <Tag color={methodTagColor(detail.httpMethod)}>{detail.httpMethod}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={AUDIT.LIST.LABELS.STATUS}>
                <Tag color={statusTagColor(detail.httpStatus)}>{detail.httpStatus}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={AUDIT.LIST.LABELS.ENDPOINT} span={2}>
                <Text code>{detail.endpoint}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={AUDIT.LIST.LABELS.SOURCE_IP}>
                {detail.sourceIp ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label={AUDIT.LIST.LABELS.DURATION_MS}>
                {detail.durationMs ?? '-'}
              </Descriptions.Item>
            </Descriptions>
            <div>
              <Title level={5}>{AUDIT.DETAIL_MODAL.LABELS.REQUEST_PAYLOAD}</Title>
              <Paragraph code copyable={Boolean(detail.requestPayload)}>
                {detail.requestPayload ?? AUDIT.DETAIL_MODAL.LABELS.EMPTY}
              </Paragraph>
            </div>
            <div>
              <Title level={5}>{AUDIT.DETAIL_MODAL.LABELS.RESPONSE_PAYLOAD}</Title>
              <Paragraph code copyable={Boolean(detail.responsePayload)}>
                {detail.responsePayload ?? AUDIT.DETAIL_MODAL.LABELS.EMPTY}
              </Paragraph>
            </div>
          </Space>
        ) : null}
      </Modal>
    </Space>
  );
}
