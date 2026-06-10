import { act, renderHook, waitFor } from '@testing-library/react';

import { usePolling } from '@/hooks/usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('runs the fetcher immediately and stores the payload on success', async () => {
    const fetcher = jest.fn().mockResolvedValue({ count: 1 });
    const { result } = renderHook(() => usePolling(fetcher, 1000));

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.data).toEqual({ count: 1 }));
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdatedAt).toBeInstanceOf(Date);
  });

  it('exposes the error and clears it on the next successful tick', async () => {
    const fetcher = jest
      .fn()
      .mockRejectedValueOnce(new Error('first'))
      .mockResolvedValue({ count: 2 });

    const { result } = renderHook(() => usePolling(fetcher, 100));

    await waitFor(() => expect(result.current.error).not.toBeNull());

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => expect(result.current.data).toEqual({ count: 2 }));
    expect(result.current.error).toBeNull();
  });

  it('does not run the fetcher when disabled', async () => {
    const fetcher = jest.fn();
    renderHook(() => usePolling(fetcher, 100, { enabled: false }));

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(fetcher).not.toHaveBeenCalled();
  });

  it('does not start the loop when intervalMs is <= 0', async () => {
    const fetcher = jest.fn().mockResolvedValue('x');
    renderHook(() => usePolling(fetcher, 0));

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(fetcher).not.toHaveBeenCalled();
  });

  it('refetch_runsTheFetcherImmediately', async () => {
    const fetcher = jest.fn().mockResolvedValue('x');
    const { result } = renderHook(() => usePolling(fetcher, 5000, { enabled: false }));

    await act(async () => {
      await result.current.refetch();
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
