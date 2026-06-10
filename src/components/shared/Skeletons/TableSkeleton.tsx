'use client';

import { Skeleton, Space } from 'antd';

type TableSkeletonProps = {
  rowCount?: number;
};

/**
 * Skeleton stand-in for a paginated table. Used while a list payload is
 * fetching - one Skeleton.Input for the header strip and a row block for
 * each expected row.
 */
export function TableSkeleton({ rowCount = 5 }: TableSkeletonProps) {
  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Skeleton.Input active block style={{ height: 32 }} />
      {Array.from({ length: rowCount }).map((_, index) => (
        <Skeleton key={index} active title={false} paragraph={{ rows: 1, width: '100%' }} />
      ))}
    </Space>
  );
}
