import type { Schemas } from '@/api/types';

export type UseStopEditHistoryOptions = {
  pageSize?: number;
  enabled?: boolean;
};

export type UseStopEditHistoryResult = {
  editHistory: Schemas['StopEditDTO'][];
  loading: boolean;
  error: unknown;
  lastUpdatedAt: Date | null;
  refetch: () => Promise<void>;
};
