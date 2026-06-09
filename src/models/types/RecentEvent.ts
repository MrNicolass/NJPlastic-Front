/**
 * Manual mirror of the backend {@code RecentEventDTO} (EP-FE-05, Fase A).
 * Replace with {@code Schemas['RecentEventDTO']} once `npm run api:generate`
 * regenerates {@link ../../api/schema.ts}.
 */
export type RecentEventType =
  | 'MANUAL_EVENT'
  | 'MANUAL_PAUSE'
  | 'AUTO_STOP'
  | 'STOP_MESSAGE_EDIT';

export type RecentEventResponse = {
  type: RecentEventType;
  machineId: string;
  machineCode: string;
  timestamp: string;
  description?: string | null;
  userId?: string | null;
  userName?: string | null;
};
