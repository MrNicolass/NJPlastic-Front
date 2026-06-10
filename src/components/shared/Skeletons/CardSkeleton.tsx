'use client';

import { Card, Skeleton } from 'antd';

type CardSkeletonProps = {
  rows?: number;
  style?: React.CSSProperties;
};

/**
 * Card-shaped loading placeholder. Use while a single card-bound payload is
 * fetching (e.g. KPI block, OEE summary). Mirrors the visual weight of the
 * real card to avoid layout shift when content lands.
 */
export function CardSkeleton({ rows = 3, style }: CardSkeletonProps) {
  return (
    <Card style={style}>
      <Skeleton active title paragraph={{ rows }} />
    </Card>
  );
}
