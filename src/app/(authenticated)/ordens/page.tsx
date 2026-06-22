'use client';

import { Button, Col, Row, Space, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { OrdersKpis } from '@/components/orders/OrdersKpis';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { ExportButton, type ExportFormat } from '@/components/shared/ExportButton';
import { TableSkeleton } from '@/components/shared/Skeletons';
import { EXPORT, ORDERS, UTILS } from '@/constants/ConstantsAndParams';
import { usePolling } from '@/hooks/usePolling';
import type { OrdersSnapshot } from '@/models/types/OrdersSnapshot';
import MachineService from '@/services/MachineService';
import ProductionOrderService from '@/services/ProductionOrderService';
import {
  buildExportFilename,
  exportToCsv,
  exportToPdf,
  type ExportColumn,
} from '@/utils/ExportUtils';
import { NotificationUtils } from '@/utils/NotificationUtils';

const { Title, Text } = Typography;

const ORDERS_POLL_INTERVAL_MS = 30_000;
const PAGE_SIZE_DEFAULT = 20;

/**
 * Production Orders screen (item 5). Owner is the
 * Shift Leader, reused by the Manager via the same route.
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

  const handleExport = useCallback(
    (format: ExportFormat) => {
      if (tableRows.length === 0) {
        NotificationUtils({
          key: EXPORT.NOTIFICATIONS.ERROR.KEYS.EXPORT_FAILED,
          type: 'warning',
          message: EXPORT.NOTIFICATIONS.ERROR.TITLES.EXPORT_FAILED,
          description: EXPORT.NOTIFICATIONS.ERROR.MESSAGES.EMPTY_DATASET,
        });
        return;
      }
      const columns: ExportColumn<Record<string, unknown>>[] = [
        { key: 'erpOrderId', label: 'OS (ERP)' },
        { key: 'productCode', label: 'Produto' },
        { key: 'machineCode', label: 'Máquina' },
        { key: 'targetQuantity', label: 'Quantidade meta' },
        { key: 'status', label: 'Status' },
        { key: 'lastSyncAt', label: 'Última sincronização' },
      ];
      const rows: Record<string, unknown>[] = tableRows.map((order) => ({
        erpOrderId: order.erpOrderId ?? '',
        productCode: order.productCode ?? '',
        machineCode: machineCodeById.get(order.machineId ?? '') ?? '-',
        targetQuantity: order.targetQuantity ?? '',
        status: order.status ?? '',
        lastSyncAt: order.lastSyncAt ? dayjs(order.lastSyncAt).format(UTILS.DATE_FORMATS.DISPLAY) : '-',
      }));
      const filename = buildExportFilename(EXPORT.FILENAMES.ORDERS, format);
      try {
        if (format === 'csv') {
          exportToCsv(rows, columns, filename);
        } else {
          exportToPdf(rows, columns, filename, {
            title: ORDERS.LABELS.TITLE,
            subtitle: dayjs().format(UTILS.DATE_FORMATS.DISPLAY),
          });
        }
        NotificationUtils({
          key: EXPORT.NOTIFICATIONS.SUCCESS.KEYS.EXPORTED,
          type: 'success',
          message: EXPORT.NOTIFICATIONS.SUCCESS.TITLES.EXPORTED,
          description: EXPORT.NOTIFICATIONS.SUCCESS.MESSAGES.EXPORTED(
            format.toUpperCase() as 'CSV' | 'PDF',
            rows.length,
          ),
        });
      } catch {
        NotificationUtils({
          key: EXPORT.NOTIFICATIONS.ERROR.KEYS.EXPORT_FAILED,
          type: 'error',
          message: EXPORT.NOTIFICATIONS.ERROR.TITLES.EXPORT_FAILED,
          description: EXPORT.NOTIFICATIONS.ERROR.MESSAGES.EXPORT_FAILED,
        });
      }
    },
    [machineCodeById, tableRows],
  );

  if (loading && !data) {
    return <TableSkeleton rowCount={8} />;
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
            <Space>
              <ExportButton
                onExport={handleExport}
                disabled={tableRows.length === 0}
              />
              <Tooltip title={ORDERS.LABELS.NEW_ORDER_TOOLTIP}>
                <Button disabled>{ORDERS.BUTTONS.NEW_ORDER}</Button>
              </Tooltip>
            </Space>
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
