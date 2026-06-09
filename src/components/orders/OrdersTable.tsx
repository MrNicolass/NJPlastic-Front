'use client';

import { Table, Tag, Typography } from 'antd';
import type { TablePaginationConfig } from 'antd';
import dayjs from 'dayjs';
import { ORDERS, UTILS } from '@/constants/ConstantsAndParams';
import type { ProductionOrderResponse } from '@/models/types/ProductionOrderResponse';
import { resolveSyncStatus, SyncStatusBadge } from '@/components/orders/SyncStatusBadge';

const { Text } = Typography;

type OrderRow = ProductionOrderResponse;

type OrdersTableProps = {
  rows: OrderRow[];
  loading: boolean;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
  };
  onPageChange: (page: number, size: number) => void;
  machineCodeById: Map<string, string>;
};

const columns = (machineCodeById: Map<string, string>) => [
  {
    title: ORDERS.LABELS.COL_ERP_ORDER_ID,
    dataIndex: 'erpOrderId',
    key: 'erpOrderId',
    render: (value: string) => <Text code>{value}</Text>,
  },
  {
    title: ORDERS.LABELS.COL_PRODUCT,
    dataIndex: 'productCode',
    key: 'productCode',
    render: (value: string | null | undefined) => value ?? ORDERS.LABELS.NO_MACHINE,
  },
  {
    title: ORDERS.LABELS.COL_MACHINE,
    dataIndex: 'machineId',
    key: 'machineId',
    render: (value: string | null | undefined) =>
      value ? machineCodeById.get(value) ?? value : ORDERS.LABELS.NO_MACHINE,
  },
  {
    title: ORDERS.LABELS.COL_TARGET,
    dataIndex: 'targetQuantity',
    key: 'targetQuantity',
    align: 'right' as const,
    render: (value: number | null | undefined) =>
      value === null || value === undefined ? '-' : value.toLocaleString('pt-BR'),
  },
  {
    title: ORDERS.LABELS.COL_STATUS,
    dataIndex: 'status',
    key: 'status',
    render: (value: string | null | undefined) => (value ? <Tag>{value}</Tag> : '-'),
  },
  {
    title: ORDERS.LABELS.COL_SYNC,
    dataIndex: 'lastSyncAt',
    key: 'sync',
    render: (value: string) => (
      <SyncStatusBadge status={resolveSyncStatus(value)} />
    ),
  },
  {
    title: ORDERS.LABELS.COL_DUE_DATE,
    dataIndex: 'lastSyncAt',
    key: 'lastSyncAt',
    render: (value: string) => (value ? dayjs(value).format(UTILS.DATE_FORMATS.DISPLAY) : '-'),
  },
];

export function OrdersTable({
  rows,
  loading,
  pagination,
  onPageChange,
  machineCodeById,
}: OrdersTableProps) {
  const pager: TablePaginationConfig = {
    current: pagination.page + 1,
    pageSize: pagination.size,
    total: pagination.totalElements,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50, 100],
    onChange: (nextPage, nextSize) => {
      onPageChange(nextPage - 1, nextSize ?? pagination.size);
    },
  };
  return (
    <Table<OrderRow>
      rowKey="id"
      columns={columns(machineCodeById)}
      dataSource={rows}
      loading={loading}
      pagination={pager}
      locale={{ emptyText: ORDERS.LABELS.EMPTY }}
    />
  );
}
