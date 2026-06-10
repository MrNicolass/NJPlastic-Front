export type UsePollingOptions = {
  enabled?: boolean;
  pauseInBackground?: boolean;
};

export type UsePollingResult<T> = {
  data: T | null;
  loading: boolean;
  error: unknown;
  lastUpdatedAt: Date | null;
  refetch: () => Promise<void>;
};
