import type { AxiosResponse } from 'axios';
import type { Schemas } from '@/api/types';
import { ORDERS } from '@/constants/ConstantsAndParams';
import type { IProductionOrderService } from '@/models/interfaces/services/IProductionOrderService';
import type { Page } from '@/models/types/Page';
import type { PageParams } from '@/models/types/PageParams';
import type { ProductionOrderResponse } from '@/models/types/ProductionOrderResponse';
import { http } from '@/services/AxiosConfigService';

const buildNotificationConfig = (key: string, suppressError?: boolean) => ({
  key,
  suppressErrorNotification: suppressError ?? false,
});

const ProductionOrderService: IProductionOrderService = {
  async list(
    pageable: PageParams,
    filters: { status?: string; machineId?: string; from?: string; to?: string },
    suppressError?: boolean,
  ): Promise<Page<ProductionOrderResponse>> {
    try {
      const response: AxiosResponse<Page<ProductionOrderResponse>> = await http.get(
        '/production-orders',
        {
          params: { ...pageable, ...filters },
          notificationConfig: buildNotificationConfig(ORDERS.KEY, suppressError),
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getSummary(suppressError?: boolean): Promise<Schemas['ProductionOrderSummaryDTO']> {
    try {
      const response: AxiosResponse<Schemas['ProductionOrderSummaryDTO']> = await http.get(
        '/production-orders/summary',
        { notificationConfig: buildNotificationConfig(ORDERS.KEY, suppressError) },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default ProductionOrderService;
