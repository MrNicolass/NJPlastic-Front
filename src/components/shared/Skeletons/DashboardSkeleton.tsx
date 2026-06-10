'use client';

import { Col, Row } from 'antd';
import { CardSkeleton } from './CardSkeleton';

type DashboardSkeletonProps = {
  cardCount?: number;
};

/**
 * Grid of card skeletons sized for a dashboard hydration window. Mirrors
 * the responsive grid used by the operator / leader / manager dashboards
 * so the first paint does not jump when data lands.
 */
export function DashboardSkeleton({ cardCount = 4 }: DashboardSkeletonProps) {
  return (
    <Row gutter={[16, 16]}>
      {Array.from({ length: cardCount }).map((_, index) => (
        <Col key={index} xs={24} sm={12} md={8} lg={6}>
          <CardSkeleton rows={4} />
        </Col>
      ))}
    </Row>
  );
}
