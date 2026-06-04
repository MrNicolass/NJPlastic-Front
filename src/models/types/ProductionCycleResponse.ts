/**
 * Manual mirror of the backend ProductionCycleResponse DTO. The OpenAPI
 * snapshot only exposes the generic `Page` schema with `content:
 * unknown[]`, so the cycle item shape is reconstructed here for typed
 * consumption by the cycle history table.
 */
export type ProductionCycleResponse = {
  id: string;
  machineId: string;
  pulseTimestamp: string;
  receivedAt: string;
  sequence: number;
  intervalMs?: number;
  state: 'PENDING' | 'CONFIRMED' | 'SYNCED' | 'DISCARDED';
};
