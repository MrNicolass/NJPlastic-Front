import type { Schemas } from '@/api/types';
import type { ProductionOrderResponse } from '@/models/types/ProductionOrderResponse';

export type OrdersSnapshot = {
  summary: Schemas['ProductionOrderSummaryDTO'] | null;
  page: {
    rows: ProductionOrderResponse[];
    page: number;
    size: number;
    totalElements: number;
  };
  machines: Schemas['MachineSummaryDTO'][];
};
