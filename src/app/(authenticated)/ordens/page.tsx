'use client';

import { Button, Col, Row, Skeleton, Space, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { OrdersKpis } from '@/components/orders/OrdersKpis';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { ORDERS, UTILS } from '@/constants/ConstantsAndParams';
import { usePolling } from '@/hooks/usePolling';
import type { OrdersSnapshot } from '@/models/types/OrdersSnapshot';
import MachineService from '@/services/MachineService';
import ProductionOrderService from '@/services/ProductionOrderService';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Title, Text } = Typography;

const ORDERS_POLL_INTERVAL_MS = 30_000;
const PAGE_SIZE_DEFAULT = 20;

/**
 * Production Orders screen (EP-FE-05 item 5, UC05 + UC11). Owner is the
 * Shift Leader, reused by the Manager via the same route (RN03/RN04).
 * Polls every 30 seconds since order rows do not move at the same cadence
 * as the dashboard. The "+ Nova ordem" CTA is intentionally disabled on
 * the MVP per the backlog decision.
 */
export default function OrdersPage() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [machineCodeById, setMachineCodeById] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    let cancelled = false;
    MachineService.listMachines(true)
      .then((list) => {
        if (cancelled) {
          return;
        }
        const map = new Map<string, string>();
        list.forEach((m) => map.set(m.id, m.code));
        setMachineCodeById(map);
      })
      .catch(() => {
        if (!cancelled) {
          setMachineCodeById(new Map());
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchSnapshot = useCallback(async (): Promise<OrdersSnapshot> => {
    const [summary, page] = await Promise.all([
      ProductionOrderService.getSummary(true).catch(() => null),
      ProductionOrderService.list(
        { page: pageIndex, size: pageSize },
        {},
        true,
      ),
    ]);
    return {
      summary,
      page: {
        rows: page.content,
        page: page.number,
        size: page.size,
        totalElements: page.totalElements,
      },
      machines: [],
    };
  }, [pageIndex, pageSize]);

  const { data, loading, error, lastUpdatedAt } = usePolling<OrdersSnapshot>(
    fetchSnapshot,
    ORDERS_POLL_INTERVAL_MS,
  );

  const tableRows = useMemo(() => data?.page.rows ?? [], [data]);

  useEffect(() => {
    if (error && tableRows.length === 0) {
      NotificationUtils({
        key: ORDERS.NOTIFICATIONS.ERROR.KEYS.LIST_FAILED,
        type: 'error',
        message: ORDERS.NOTIFICATIONS.ERROR.TITLES.LIST_FAILED,
        description: ORDERS.NOTIFICATIONS.ERROR.MESSAGES.LIST_FAILED,
      });
    }
  }, [error, tableRows.length]);

  if (loading && !data) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <header>
        <Row justify="space-between" align="middle" gutter={[16, 16]} wrap>
          <Col flex="auto">
            <Title level={3} style={{ marginBottom: 4 }}>
              {ORDERS.LABELS.TITLE}
            </Title>
            {lastUpdatedAt ? (
              <Text type="secondary">
                {ORDERS.LABELS.LAST_UPDATE(
                  dayjs(lastUpdatedAt).format(UTILS.DATE_FORMATS.DISPLAY),
                )}
              </Text>
            ) : null}
          </Col>
          <Col>
            <Tooltip title={ORDERS.LABELS.NEW_ORDER_TOOLTIP}>
              <Button disabled>{ORDERS.BUTTONS.NEW_ORDER}</Button>
            </Tooltip>
          </Col>
        </Row>
      </header>

      <OrdersKpis summary={data?.summary ?? null} />

      <OrdersTable
        rows={tableRows}
        loading={loading}
        pagination={{
          page: pageIndex,
          size: pageSize,
          totalElements: data?.page.totalElements ?? 0,
        }}
        onPageChange={(next, size) => {
          setPageIndex(next);
          setPageSize(size);
        }}
        machineCodeById={machineCodeById}
      />
    </Space>
  );
}
