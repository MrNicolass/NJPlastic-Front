'use client';

import { Col, Row, Statistic } from 'antd';
import type { Schemas } from '@/api/types';
import { ORDERS } from '@/constants/ConstantsAndParams';
import type { OrdersKpisProps } from '@/models/interfaces/components/OrderProps';

export type { OrdersKpisProps } from '@/models/interfaces/components/OrderProps';

/**
 * Top strip of {@code /ordens} (mockup OS_Part1_V1). Renders the four
 * production-order counters returned by {@code GET /production-orders/summary}.
 */
export function OrdersKpis({ summary }: OrdersKpisProps) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Statistic title={ORDERS.LABELS.KPI_IN_PROD} value={summary?.inProd ?? 0} />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Statistic title={ORDERS.LABELS.KPI_QUEUED} value={summary?.queued ?? 0} />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Statistic title={ORDERS.LABELS.KPI_OVERDUE} value={summary?.overdue ?? 0} />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Statistic title={ORDERS.LABELS.KPI_COMPLETED} value={summary?.completed ?? 0} />
      </Col>
    </Row>
  );
}
