'use client';

import { Button, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { REPORTS_SCHEDULE, UTILS } from '@/constants/ConstantsAndParams';
import type { ReportScheduleResponse } from '@/models/types/ReportTypes';
import ReportsService from '@/services/ReportsService';
import { NotificationUtils } from '@/utils/NotificationUtils';
import { ReportScheduleDrawer } from './ReportScheduleDrawer';

const { Text } = Typography;

/**
 * Manager-only tab listing every active report schedule plus the CTA to
 * create a new one (EP-FE-07 sub-task 6, mockup Reports_Part2_V1). The
 * schedule row carries cron, e-mail and format; deletion runs through a
 * confirm popover so an accidental click does not yank a recurring job.
 */
export function ScheduleListTab() {
  const [rows, setRows] = useState<ReportScheduleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const list = await ReportsService.listSchedules(true);
      setRows(list);
    } catch {
      setRows([]);
      NotificationUtils({
        key: REPORTS_SCHEDULE.NOTIFICATIONS.ERROR.KEYS.LIST_FAILED,
        type: 'error',
        message: REPORTS_SCHEDULE.NOTIFICATIONS.ERROR.TITLES.LIST_FAILED,
        description: REPORTS_SCHEDULE.NOTIFICATIONS.ERROR.MESSAGES.LIST_FAILED,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await ReportsService.deleteSchedule(id, true);
        NotificationUtils({
          key: REPORTS_SCHEDULE.NOTIFICATIONS.SUCCESS.KEYS.DELETED,
          type: 'success',
          message: REPORTS_SCHEDULE.NOTIFICATIONS.SUCCESS.TITLES.DELETED,
          description: REPORTS_SCHEDULE.NOTIFICATIONS.SUCCESS.MESSAGES.DELETED,
        });
        await reload();
      } catch {
        NotificationUtils({
          key: REPORTS_SCHEDULE.NOTIFICATIONS.ERROR.KEYS.DELETE_FAILED,
          type: 'error',
          message: REPORTS_SCHEDULE.NOTIFICATIONS.ERROR.TITLES.DELETE_FAILED,
          description: REPORTS_SCHEDULE.NOTIFICATIONS.ERROR.MESSAGES.DELETE_FAILED,
        });
      } finally {
        setDeletingId(null);
      }
    },
    [reload],
  );

  const handleCreated = useCallback(() => {
    setDrawerOpen(false);
    void reload();
  }, [reload]);

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Text type="secondary">{REPORTS_SCHEDULE.DESCRIPTION}</Text>
        <Button type="primary" onClick={() => setDrawerOpen(true)}>
          {REPORTS_SCHEDULE.NEW_BUTTON}
        </Button>
      </Space>

      <Table<ReportScheduleResponse>
        rowKey="id"
        loading={loading}
        pagination={false}
        dataSource={rows}
        locale={{ emptyText: REPORTS_SCHEDULE.EMPTY }}
        columns={[
          {
            title: REPORTS_SCHEDULE.COLUMNS.TYPE,
            dataIndex: 'type',
            render: (value: string) => <Tag>{value}</Tag>,
          },
          {
            title: REPORTS_SCHEDULE.COLUMNS.CRON,
            dataIndex: 'cron',
            render: (value: string) => <Text code>{value}</Text>,
          },
          { title: REPORTS_SCHEDULE.COLUMNS.EMAIL, dataIndex: 'deliveryEmail' },
          {
            title: REPORTS_SCHEDULE.COLUMNS.FORMAT,
            dataIndex: 'format',
            render: (value: string) => <Tag color="blue">{value}</Tag>,
          },
          {
            title: REPORTS_SCHEDULE.COLUMNS.CREATED_AT,
            dataIndex: 'createdAt',
            render: (value: string) => dayjs(value).format(UTILS.DATE_FORMATS.DISPLAY),
          },
          {
            title: REPORTS_SCHEDULE.COLUMNS.ACTIONS,
            key: 'actions',
            render: (_, row) => (
              <Popconfirm
                title={REPORTS_SCHEDULE.DELETE_CONFIRM_TITLE}
                description={REPORTS_SCHEDULE.DELETE_CONFIRM_DESCRIPTION}
                okText={REPORTS_SCHEDULE.CONFIRM_OK}
                cancelText={REPORTS_SCHEDULE.CONFIRM_CANCEL}
                okButtonProps={{ danger: true, loading: deletingId === row.id }}
                onConfirm={() => void handleDelete(row.id)}
              >
                <Button danger type="link">
                  {REPORTS_SCHEDULE.DELETE_BUTTON}
                </Button>
              </Popconfirm>
            ),
          },
        ]}
      />

      <ReportScheduleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={handleCreated}
      />
    </Space>
  );
}
