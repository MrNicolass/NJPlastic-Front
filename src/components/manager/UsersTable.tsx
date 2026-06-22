'use client';

import {
  Button,
  Empty,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Schemas } from '@/api/types';
import { USERS } from '@/constants/ConstantsAndParams';
import type { UsersTableProps } from '@/models/interfaces/components/UsersTableProps';

export type { UsersTableProps } from '@/models/interfaces/components/UsersTableProps';

const { Text } = Typography;

const roleLabel = (role: Schemas['UserResponseDTO']['role']): string => {
  if (role === 'OPERATOR') return USERS.ROLE_LABELS.OPERATOR;
  if (role === 'LEADER') return USERS.ROLE_LABELS.LEADER;
  return USERS.ROLE_LABELS.MANAGER;
};

const roleTagColor = (role: Schemas['UserResponseDTO']['role']): string => {
  if (role === 'OPERATOR') return 'default';
  if (role === 'LEADER') return 'processing';
  return 'cyan';
};

/**
 * Pure table component that renders the paginated user list. The
 * /usuarios page owns the data fetching and the form drawer wiring;
 * this component receives the page contents as props so it stays
 * easy to test.
 */
export function UsersTable({
  users,
  loading,
  totalElements,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onDeactivate,
}: UsersTableProps) {
  const columns: ColumnsType<Schemas['UserResponseDTO']> = [
    {
      title: USERS.LIST.LABELS.NAME,
      dataIndex: USERS.LIST.KEYS.NAME,
      key: USERS.LIST.KEYS.NAME,
      render: (_value, record) => <Text strong>{record.name}</Text>,
    },
    {
      title: USERS.LIST.LABELS.LOGIN,
      dataIndex: USERS.LIST.KEYS.LOGIN,
      key: USERS.LIST.KEYS.LOGIN,
    },
    {
      title: USERS.LIST.LABELS.EMAIL,
      dataIndex: USERS.LIST.KEYS.EMAIL,
      key: USERS.LIST.KEYS.EMAIL,
    },
    {
      title: USERS.LIST.LABELS.ROLE,
      dataIndex: USERS.LIST.KEYS.ROLE,
      key: USERS.LIST.KEYS.ROLE,
      render: (_value, record) => (
        <Tag color={roleTagColor(record.role)}>{roleLabel(record.role)}</Tag>
      ),
    },
    {
      title: USERS.LIST.LABELS.SECTOR,
      dataIndex: USERS.LIST.KEYS.SECTOR,
      key: USERS.LIST.KEYS.SECTOR,
      render: (value) => value ?? '-',
    },
    {
      title: USERS.LIST.LABELS.SHIFT,
      dataIndex: USERS.LIST.KEYS.SHIFT,
      key: USERS.LIST.KEYS.SHIFT,
      render: (value) => value ?? '-',
    },
    {
      title: USERS.LIST.LABELS.ACTIVE,
      dataIndex: USERS.LIST.KEYS.ACTIVE,
      key: USERS.LIST.KEYS.ACTIVE,
      render: (_value, record) =>
        record.active ? (
          <Tag color="success">{USERS.LIST.FILTERS.ACTIVE_TRUE}</Tag>
        ) : (
          <Tag>{USERS.LIST.FILTERS.ACTIVE_FALSE}</Tag>
        ),
    },
    {
      title: USERS.LIST.LABELS.ACTIONS,
      dataIndex: USERS.LIST.KEYS.ACTIONS,
      key: USERS.LIST.KEYS.ACTIONS,
      render: (_value, record) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>
            {USERS.LIST.BUTTONS.EDIT}
          </Button>
          {record.active ? (
            <Popconfirm
              title={USERS.DEACTIVATE_CONFIRM.TITLE}
              description={USERS.DEACTIVATE_CONFIRM.DESCRIPTION}
              okText={USERS.DEACTIVATE_CONFIRM.OK_TEXT}
              cancelText={USERS.DEACTIVATE_CONFIRM.CANCEL_TEXT}
              okButtonProps={{ danger: true }}
              onConfirm={() => onDeactivate(record)}
            >
              <Button size="small" danger>
                {USERS.LIST.BUTTONS.DEACTIVATE}
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <Table<Schemas['UserResponseDTO']>
      rowKey={(record) => record.id}
      dataSource={users}
      columns={columns}
      loading={loading}
      scroll={{ x: 'max-content' }}
      locale={{
        emptyText: (
          <Empty
            description={
              <Space orientation="vertical" size={0}>
                <Text strong>{USERS.LIST.EMPTY_TITLE}</Text>
                <Text type="secondary">{USERS.LIST.EMPTY_DESCRIPTION}</Text>
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
        onChange: (next, nextSize) => onPageChange(next - 1, nextSize),
      }}
    />
  );
}
