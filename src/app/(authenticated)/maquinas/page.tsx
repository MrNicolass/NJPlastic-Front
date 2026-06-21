'use client';

import { Button, Col, Empty, Popconfirm, Row, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Schemas } from '@/api/types';
import { MachineRegisterDrawer } from '@/components/manager/MachineRegisterDrawer';
import { MACHINES, USERS } from '@/constants/ConstantsAndParams';
import MachineService from '@/services/MachineService';
import { useSessionStore } from '@/stores/useSessionStore';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Title, Text } = Typography;

const stateLabel = (state: string | null | undefined): string => {
  if (!state) return MACHINES.STATE_LABELS.UNKNOWN;
  if (state === 'RUNNING') return MACHINES.STATE_LABELS.RUNNING;
  if (state === 'PAUSED') return MACHINES.STATE_LABELS.PAUSED;
  if (state === 'AUTO_STOPPED') return MACHINES.STATE_LABELS.AUTO_STOPPED;
  if (state === 'OFFLINE') return MACHINES.STATE_LABELS.OFFLINE;
  return MACHINES.STATE_LABELS.UNKNOWN;
};

const stateTagColor = (state: string | null | undefined): string => {
  if (state === 'RUNNING') return 'success';
  if (state === 'PAUSED') return 'warning';
  if (state === 'AUTO_STOPPED') return 'error';
  return 'default';
};

export default function MachinesPage() {
  const router = useRouter();
  const role = useSessionStore((state) => state.role);
  const canManage = role === 'MANAGER';

  const [machines, setMachines] = useState<Schemas['MachineSummaryDTO'][]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingMachine, setEditingMachine] = useState<Schemas['MachineDetailResponseDTO'] | null>(
    null,
  );

  const fetchMachines = useCallback(async () => {
    setLoading(true);
    try {
      const result = await MachineService.listMachines(true);
      setMachines(result);
    } catch {
      NotificationUtils({
        key: MACHINES.NOTIFICATIONS.ERROR.KEYS.LIST_FAILED,
        type: 'error',
        message: MACHINES.NOTIFICATIONS.ERROR.TITLES.LIST_FAILED,
        description: MACHINES.NOTIFICATIONS.ERROR.MESSAGES.LIST_FAILED,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  const openCreate = () => {
    setEditingMachine(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const openEdit = async (summary: Schemas['MachineSummaryDTO']) => {
    try {
      const detail = await MachineService.getDetail(summary.id);
      setEditingMachine(detail);
      setDrawerMode('edit');
      setDrawerOpen(true);
    } catch {
 // notification already fired by the service layer
    }
  };

  const handleDeactivate = async (summary: Schemas['MachineSummaryDTO']) => {
    await MachineService.softDeleteMachine(summary.id);
    await fetchMachines();
  };

  const columns: ColumnsType<Schemas['MachineSummaryDTO']> = [
    {
      title: MACHINES.LIST.LABELS.CODE,
      dataIndex: MACHINES.LIST.KEYS.CODE,
      key: MACHINES.LIST.KEYS.CODE,
      render: (_value, record) => <Text strong>{record.code}</Text>,
    },
    {
      title: MACHINES.LIST.LABELS.DESCRIPTION,
      dataIndex: MACHINES.LIST.KEYS.DESCRIPTION,
      key: MACHINES.LIST.KEYS.DESCRIPTION,
      render: (value) => value ?? '-',
    },
    {
      title: MACHINES.LIST.LABELS.SECTOR,
      dataIndex: MACHINES.LIST.KEYS.SECTOR,
      key: MACHINES.LIST.KEYS.SECTOR,
      render: (value) => value ?? '-',
    },
    {
      title: MACHINES.LIST.LABELS.CURRENT_STATE,
      dataIndex: MACHINES.LIST.KEYS.CURRENT_STATE,
      key: MACHINES.LIST.KEYS.CURRENT_STATE,
      render: (_value, record) => (
        <Tag color={stateTagColor(record.currentState)}>{stateLabel(record.currentState)}</Tag>
      ),
    },
    {
      title: USERS.LIST.LABELS.ACTIONS,
      dataIndex: USERS.LIST.KEYS.ACTIONS,
      key: USERS.LIST.KEYS.ACTIONS,
      render: (_value, record) => (
        <Space>
          <Button size="small" onClick={() => router.push(`/maquinas/${record.id}`)}>
            {MACHINES.DASHBOARD.BUTTONS.VIEW_DETAIL}
          </Button>
          {canManage ? (
            <>
              <Button size="small" onClick={() => openEdit(record)}>
                {USERS.LIST.BUTTONS.EDIT}
              </Button>
              <Popconfirm
                title={USERS.DEACTIVATE_CONFIRM.TITLE}
                description={USERS.DEACTIVATE_CONFIRM.DESCRIPTION}
                okText={USERS.DEACTIVATE_CONFIRM.OK_TEXT}
                cancelText={USERS.DEACTIVATE_CONFIRM.CANCEL_TEXT}
                okButtonProps={{ danger: true }}
                onConfirm={() => handleDeactivate(record)}
              >
                <Button size="small" danger>
                  {USERS.LIST.BUTTONS.DEACTIVATE}
                </Button>
              </Popconfirm>
            </>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <header>
        <Row justify="space-between" align="middle" gutter={[16, 16]} wrap>
          <Col flex="auto">
            <Title level={3} style={{ marginBottom: 4 }}>
              {MACHINES.PAGE.TITLE}
            </Title>
            <Text type="secondary">{MACHINES.PAGE.SUBTITLE}</Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchMachines}>
                {MACHINES.PAGE.BUTTONS.REFRESH}
              </Button>
              {canManage ? (
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                  {MACHINES.PAGE.BUTTONS.CREATE}
                </Button>
              ) : null}
            </Space>
          </Col>
        </Row>
      </header>

      <Table<Schemas['MachineSummaryDTO']>
        rowKey={(record) => record.id}
        dataSource={machines}
        columns={columns}
        loading={loading}
        locale={{
          emptyText: (
            <Empty
              description={
                <Space orientation="vertical" size={0}>
                  <Text strong>{MACHINES.PAGE.EMPTY_TITLE}</Text>
                  {canManage ? (
                    <Text type="secondary">{MACHINES.PAGE.EMPTY_DESCRIPTION_MANAGER}</Text>
                  ) : (
                    <Text type="secondary">{MACHINES.PAGE.EMPTY_DESCRIPTION_LEADER}</Text>
                  )}
                </Space>
              }
            />
          ),
        }}
        pagination={{ pageSize: 20 }}
      />

      {canManage ? (
        <MachineRegisterDrawer
          open={drawerOpen}
          mode={drawerMode}
          machine={editingMachine}
          onClose={() => setDrawerOpen(false)}
          onSaved={fetchMachines}
        />
      ) : null}
    </Space>
  );
}
