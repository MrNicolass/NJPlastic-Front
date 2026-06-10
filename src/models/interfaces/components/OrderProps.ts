import type { Schemas } from '@/api/types';
import type { ProductionOrderResponse } from '@/models/types/ProductionOrderResponse';
import type { SyncStatus } from '@/models/types/SyncStatus';

export type OrdersKpisProps = {
  summary: Schemas['ProductionOrderSummaryDTO'] | null;
};

export type OrdersTableProps = {
  rows: ProductionOrderResponse[];
  loading: boolean;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
  };
  onPageChange: (page: number, size: number) => void;
  machineCodeById: Map<string, string>;
};

export type SyncStatusBadgeProps = {
  status: SyncStatus;
};
