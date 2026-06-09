'use client';

import { Button, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import type { Schemas } from '@/api/types';
import { MACHINES, UTILS } from '@/constants/ConstantsAndParams';
import { njPalette } from '@/theme/njTheme';

const { Text } = Typography;

type Entry = Schemas['MachineStatusEntryDTO'];

export type MachineStopsTableProps = {
  entries: Entry[];
  onEditAutoStop(entry: Entry): void;
  onRegisterPause(entry: Entry): void;
};

const formatDateTime = (iso: string | undefined): string =>
  iso ? dayjs(iso).format(UTILS.DATE_FORMATS.DISPLAY) : '-';

/**
 * Lists pauses and auto-stops that overlap the timeline window. Each
 * AUTO_STOPPED row exposes an action to edit the audit-logged message
 * (UC12); rows still missing a `reason` expose an action to classify
 * the pause manually (UC03). Other rows are read-only.
 */
export function MachineStopsTable(props: MachineStopsTableProps): React.ReactNode {
  const { entries, onEditAutoStop, onRegisterPause } = props;

  const dataSource = useMemo(
    () =>
      entries
        .filter((entry) => entry.state === 'PAUSED' || entry.state === 'AUTO_STOPPED')
        .sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
        ),
    [entries],
  );

  const columns: ColumnsType<Entry> = [
    {
      title: MACHINES.DETAIL.LABELS.STOPS_COL_STATE,
      dataIndex: 'state',
      key: 'state',
      render: (value: Entry['state']) => {
        if (value === 'AUTO_STOPPED') {
          return (
            <Tag color="error" style={{ background: njPalette.cinnabar, border: 'none' }}>
              {MACHINES.STATE_LABELS.AUTO_STOPPED}
            </Tag>
          );
        }
        if (value === 'PAUSED') {
          return <Tag color="processing">{MACHINES.STATE_LABELS.PAUSED}</Tag>;
        }
        return <Tag>{value}</Tag>;
      },
    },
    {
      title: MACHINES.DETAIL.LABELS.STOPS_COL_REASON,
      dataIndex: 'reason',
      key: 'reason',
      render: (value: string | undefined) =>
        value ? <Text>{value}</Text> : <Text type="secondary">pendente</Text>,
    },
    {
      title: MACHINES.DETAIL.LABELS.STOPS_COL_MESSAGE,
      dataIndex: 'message',
      key: 'message',
      render: (value: string | undefined) =>
        value ? <Text>{value}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: MACHINES.DETAIL.LABELS.STOPS_COL_START,
      dataIndex: 'startTime',
      key: 'startTime',
      render: (value: string) => <Text code>{formatDateTime(value)}</Text>,
    },
    {
      title: MACHINES.DETAIL.LABELS.STOPS_COL_END,
      dataIndex: 'endTime',
      key: 'endTime',
      render: (value: string | undefined) => <Text code>{formatDateTime(value)}</Text>,
    },
    {
      title: '',
      key: 'actions',
      render: (_, entry) => {
        if (entry.state === 'AUTO_STOPPED') {
          return (
            <Button size="small" type="link" onClick={() => onEditAutoStop(entry)}>
              {MACHINES.DETAIL.BUTTONS.EDIT_STOP_MESSAGE}
            </Button>
          );
        }
        if (entry.state === 'PAUSED' && !entry.reason) {
          return (
            <Button size="small" type="link" onClick={() => onRegisterPause(entry)}>
              {MACHINES.DETAIL.BUTTONS.REGISTER_PAUSE}
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <Space orientation="vertical" size={8} style={{ width: '100%' }}>
      <Text strong>{MACHINES.DETAIL.LABELS.STOPS_TABLE_TITLE}</Text>
      <Table<Entry>
        dataSource={dataSource}
        columns={columns}
        rowKey={(entry) => entry.id}
        pagination={{ pageSize: 10 }}
        size="small"
        scroll={{ x: true }}
      />
    </Space>
  );
}
