import { RecentEventType } from '@/models/enums/RecentEventType';

export { RecentEventType };

export type RecentEventResponse = {
  type: RecentEventType;
  machineId: string;
  machineCode: string;
  timestamp: string;
  description?: string | null;
  userId?: string | null;
  userName?: string | null;
};
