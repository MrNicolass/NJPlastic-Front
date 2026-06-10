'use client';

import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Statistic,
  Typography,
} from 'antd';
import { EditOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Schemas } from '@/api/types';
import { ErpFieldMappingDrawer } from '@/components/manager/ErpFieldMappingDrawer';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { ERP_MAPPING, UTILS } from '@/constants/ConstantsAndParams';
import type { ProductionOrderResponse } from '@/models/types/ProductionOrderResponse';
import { createPageParams } from '@/models/types/PageParams';
import MachineService from '@/services/MachineService';
import ProductionOrderService from '@/services/ProductionOrderService';
import { useSessionStore } from '@/stores/useSessionStore';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Title, Text } = Typography;

const ONE_HOUR_MS = 60 * 60 * 1000;
const DEFAULT_PAGE_SIZE = 20;

export default function ErpPage() {
  const role = useSessionStore((state) => state.role);
  const canManage = role === 'MANAGER' || role === 'ADMIN';

  const [orders, setOrders] = useState<ProductionOrderResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [summary, setSummary] = useState<Schemas['ProductionOrderSummaryDTO'] | null>(null);
  const [machineCodeById, setMachineCodeById] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [machines, summaryResult, ordersResult] = await Promise.all([
        MachineService.listMachines(true),
        ProductionOrderService.getSummary(true),
        ProductionOrderService.list(
          createPageParams(page, pageSize, 'lastSyncAt,desc'),
          {},
          true,
        ),
      ]);
      const codeMap = new Map<string, string>();
      for (const machine of machines) {
        codeMap.set(machine.id, machine.code);
      }
      setMachineCodeById(codeMap);
      setSummary(summaryResult);
      setOrders(ordersResult.content);
      setTotalElements(ordersResult.totalElements);
    } catch {
      NotificationUtils({
        key: ERP_MAPPING.NOTIFICATIONS.ERROR.KEYS.KPIS_FAILED,
        type: 'error',
        message: ERP_MAPPING.NOTIFICATIONS.ERROR.TITLES.KPIS_FAILED,
        description: ERP_MAPPING.NOTIFICATIONS.ERROR.MESSAGES.KPIS_FAILED,
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const handlePageChange = useCallback((nextPage: number, nextSize: number) => {
    setPage(nextPage);
    setPageSize(nextSize);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpis = useMemo(() => {
    let synced = 0;
    let pending = 0;
    let lastSyncAt: string | null = null;
    const now = Date.now();
    for (const order of orders) {
      const ts = order.lastSyncAt;
      if (!ts) {
        pending += 1;
        continue;
      }
      const ms = new Date(ts).getTime();
      if (now - ms < ONE_HOUR_MS) {
        synced += 1;
      } else {
        pending += 1;
      }
      if (!lastSyncAt || ms > new Date(lastSyncAt).getTime()) {
        lastSyncAt = ts;
      }
    }
    return { synced, pending, lastSyncAt };
  }, [orders]);

  const totalOrders = summary
    ? summary.inProd + summary.queued + summary.overdue + summary.completed
    : orders.length;

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <header>
        <Row justify="space-between" align="middle" gutter={[16, 16]} wrap>
          <Col flex="auto">
            <Title level={3} style={{ marginBottom: 4 }}>
              {ERP_MAPPING.PAGE.TITLE}
            </Title>
            <Text type="secondary">{ERP_MAPPING.PAGE.SUBTITLE}</Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchData}>
                {ERP_MAPPING.PAGE.BUTTONS.REFRESH}
              </Button>
              {canManage ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setDrawerOpen(true)}
                >
                  {ERP_MAPPING.PAGE.BUTTONS.EDIT_MAPPING}
                </Button>
              ) : null}
            </Space>
          </Col>
        </Row>
      </header>

      <section aria-labelledby="erp-kpis">
        <Title level={5} id="erp-kpis" style={{ marginBottom: 12 }}>
          {ERP_MAPPING.KPIS.TITLE}
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic title={ERP_MAPPING.KPIS.TOTAL_ORDERS} value={totalOrders} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic title={ERP_MAPPING.KPIS.SYNCED} value={kpis.synced} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic title={ERP_MAPPING.KPIS.PENDING} value={kpis.pending} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title={ERP_MAPPING.KPIS.LAST_SYNC}
                value={
                  kpis.lastSyncAt
                    ? dayjs(kpis.lastSyncAt).format(UTILS.DATE_FORMATS.DISPLAY)
                    : ERP_MAPPING.KPIS.LAST_SYNC_FALLBACK
                }
              />
            </Card>
          </Col>
        </Row>
      </section>

      <section aria-labelledby="erp-orders">
        <Title level={5} id="erp-orders" style={{ marginBottom: 12 }}>
          {ERP_MAPPING.PAGE.TABLE_TITLE}
        </Title>
        <OrdersTable
          rows={orders}
          loading={loading}
          pagination={{ page, size: pageSize, totalElements }}
          onPageChange={handlePageChange}
          machineCodeById={machineCodeById}
        />
      </section>

      <ErpFieldMappingDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={fetchData}
      />
    </Space>
  );
}
