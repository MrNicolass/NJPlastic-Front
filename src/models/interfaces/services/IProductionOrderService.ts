import type { Schemas } from '@/api/types';
import type { Page } from '@/models/types/Page';
import type { PageParams } from '@/models/types/PageParams';
import type { ProductionOrderResponse } from '@/models/types/ProductionOrderResponse';

/**
 * Contract for the production-order read endpoints exposed by
 * {@code /production-orders}. Sector scoping is enforced
 * server-side via the principal in the JWT; the frontend just forwards
 * pagination and filters.
 */
export interface IProductionOrderService {
 /**
 * Paginated list of orders accessible to the principal.
 *
 * @param pageable - Pagination parameters.
 * @param filters - Optional filter set (status, machineId, from, to).
 * @param suppressError - If true, suppress the global error notification.
 * @returns Page of order projections.
 */
  list(
    pageable: PageParams,
    filters: {
      status?: string;
      machineId?: string;
      from?: string;
      to?: string;
    },
    suppressError?: boolean,
  ): Promise<Page<ProductionOrderResponse>>;

 /**
 * Aggregated counters for the orders KPIs (mockup OS_Part1_V1).
 *
 * @param suppressError - If true, suppress the global error notification.
 * @returns The summary counters.
 */
  getSummary(suppressError?: boolean): Promise<Schemas['ProductionOrderSummaryDTO']>;
}
