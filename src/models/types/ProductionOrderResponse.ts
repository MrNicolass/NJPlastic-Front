/**
 * Manual mirror of the backend ProductionOrderResponseDTO. The OpenAPI
 * snapshot only exposes the generic `Page` schema with `content:
 * unknown[]` and does not declare a top-level ProductionOrderResponseDTO
 * schema, so the row shape is reconstructed here for typed consumption
 * by the {@code /ordens} screen.
 */
export type ProductionOrderResponse = {
  id: string;
  erpOrderId: string;
  machineId?: string | null;
  productCode?: string | null;
  targetQuantity?: number | null;
  status?: string | null;
  lastSyncAt: string;
};
