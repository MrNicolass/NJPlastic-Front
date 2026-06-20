'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Schemas } from '@/api/types';
import { createPageParams } from '@/models/types/PageParams';
import type { UseStopEditHistoryOptions, UseStopEditHistoryResult } from '@/models/types/UseStopEditHistory';
import MachineService from '@/services/MachineService';

export type { UseStopEditHistoryOptions, UseStopEditHistoryResult } from '@/models/types/UseStopEditHistory';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Loads the audit-log-backed edition history of an AUTO_STOPPED message
 *. Disabled by default so the Operator variant of
 * `<StopMessageEditModal>` — which does not render the timeline — does
 * not pay the cost of a fetch. Líder/Gestor variants pass
 * `enabled: true` and receive the result through the `editHistory` prop
 * of the shared modal.
 *
 * Errors (403 outside scope, 404 unknown machine/stop) bubble through
 * `error` for the consumer to render an inline fallback; the Axios
 * interceptor stays silent because the service call passes
 * `suppressError: true`.
 *
 * @param machineId - The owning machine UUID.
 * @param stopId - The stop record UUID.
 * @param options - `pageSize` (default 20) and `enabled` (default false).
 * @returns Latest edition list, loading and error state, instant of the
 * last successful fetch, and an imperative refetch handle.
 */
export function useStopEditHistory(
  machineId: string,
  stopId: string,
  options?: UseStopEditHistoryOptions,
): UseStopEditHistoryResult {
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const enabled = options?.enabled ?? false;

  const [editHistory, setEditHistory] = useState<Schemas['StopEditDTO'][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchHistory = useCallback(async (): Promise<void> => {
    if (!machineId || !stopId) {
      return;
    }
    setLoading(true);
    try {
      const page = await MachineService.listStopEdits(
        createPageParams(0, pageSize, 'editedAt,desc'),
        machineId,
        stopId,
        true,
      );
      if (!mountedRef.current) {
        return;
      }
      setEditHistory(page.content);
      setError(null);
      setLastUpdatedAt(new Date());
    } catch (caught) {
      if (!mountedRef.current) {
        return;
      }
      setError(caught);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [machineId, stopId, pageSize]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void fetchHistory();
  }, [enabled, fetchHistory]);

  return { editHistory, loading, error, lastUpdatedAt, refetch: fetchHistory };
}
