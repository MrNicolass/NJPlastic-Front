'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { UsePollingOptions, UsePollingResult } from '@/models/types/UsePolling';

export type { UsePollingOptions, UsePollingResult } from '@/models/types/UsePolling';

/**
 * Polls {@link fetcher} every {@link intervalMs} milliseconds, preserving
 * the last successful payload across refreshes so consumers never flash
 * a loading state once the first tick lands. When `pauseInBackground` is
 * true (default) the polling stops while the document is hidden — the
 * Page Visibility API — and runs an immediate catch-up tick the moment
 * the tab becomes visible again. Disabling via `enabled: false` cancels
 * the loop without clearing the last cached payload, useful when a
 * parent toggles a sub-tab on and off.
 *
 * Anchored to the EP-FE-04 dashboard real-time loop (Operator, 5s) and
 * reused by the machine detail page. Cited in RFC §7.3.2 EP-FE-07 as
 * the shared utility — delivered here ahead of schedule and referenced
 * from there.
 *
 * @template T Payload type returned by the fetcher.
 * @param fetcher Function that resolves the latest payload.
 * @param intervalMs Delay between ticks in milliseconds; must be > 0.
 * @param options Toggle and visibility options.
 * @returns Latest payload, loading and error state, instant of the last
 *   successful tick, and an imperative refetch handle.
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  options?: UsePollingOptions,
): UsePollingResult<T> {
  const enabled = options?.enabled ?? true;
  const pauseInBackground = options?.pauseInBackground ?? true;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runTick = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const payload = await fetcherRef.current();
      if (!mountedRef.current) {
        return;
      }
      setData(payload);
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
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (intervalMs <= 0) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (intervalId !== null) {
        return;
      }
      intervalId = setInterval(() => {
        void runTick();
      }, intervalMs);
    };

    const stop = () => {
      if (intervalId === null) {
        return;
      }
      clearInterval(intervalId);
      intervalId = null;
    };

    void runTick();

    const isDocumentHidden = (): boolean =>
      typeof document !== 'undefined' && document.visibilityState === 'hidden';

    if (pauseInBackground && isDocumentHidden()) {
      // Skip starting until the tab becomes visible again.
    } else {
      start();
    }

    const handleVisibilityChange = () => {
      if (!pauseInBackground) {
        return;
      }
      if (isDocumentHidden()) {
        stop();
        return;
      }
      void runTick();
      start();
    };

    if (pauseInBackground && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      stop();
      if (pauseInBackground && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [enabled, intervalMs, pauseInBackground, runTick]);

  return { data, loading, error, lastUpdatedAt, refetch: runTick };
}
