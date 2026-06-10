import { act, renderHook, waitFor } from '@testing-library/react';

const listStopEditsMock = jest.fn();
jest.mock('@/services/MachineService', () => ({
  __esModule: true,
  default: { listStopEdits: (...args: unknown[]) => listStopEditsMock(...args) },
}));

import { useStopEditHistory } from '@/hooks/useStopEditHistory';

describe('useStopEditHistory', () => {
  beforeEach(() => {
    listStopEditsMock.mockReset();
  });

  it('isDisabledByDefaultAndDoesNotFetchOnMount', () => {
    renderHook(() => useStopEditHistory('m1', 's1'));

    expect(listStopEditsMock).not.toHaveBeenCalled();
  });

  it('fetchesOnMountWhenEnabledAndExposesTheContentArray', async () => {
    listStopEditsMock.mockResolvedValueOnce({ content: [{ id: 'e1' }, { id: 'e2' }] });

    const { result } = renderHook(() => useStopEditHistory('m1', 's1', { enabled: true }));

    await waitFor(() => expect(result.current.editHistory).toHaveLength(2));
    expect(listStopEditsMock).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0, size: 20, sort: 'editedAt,desc' }),
      'm1',
      's1',
      true,
    );
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdatedAt).toBeInstanceOf(Date);
  });

  it('respectsTheCustomPageSize', async () => {
    listStopEditsMock.mockResolvedValueOnce({ content: [] });

    renderHook(() => useStopEditHistory('m1', 's1', { enabled: true, pageSize: 5 }));

    await waitFor(() =>
      expect(listStopEditsMock).toHaveBeenCalledWith(
        expect.objectContaining({ size: 5 }),
        'm1', 's1', true,
      ),
    );
  });

  it('storesTheErrorWhenFetchFails', async () => {
    const failure = new Error('boom');
    listStopEditsMock.mockRejectedValueOnce(failure);

    const { result } = renderHook(() => useStopEditHistory('m1', 's1', { enabled: true }));

    await waitFor(() => expect(result.current.error).toBe(failure));
    expect(result.current.editHistory).toEqual([]);
  });

  it('refetchTriggersANewListCall', async () => {
    listStopEditsMock.mockResolvedValue({ content: [] });
    const { result } = renderHook(() => useStopEditHistory('m1', 's1', { enabled: true }));

    await waitFor(() => expect(listStopEditsMock).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.refetch();
    });

    expect(listStopEditsMock).toHaveBeenCalledTimes(2);
  });

  it('doesNothingWhenMachineIdOrStopIdIsMissing', async () => {
    const { result } = renderHook(() => useStopEditHistory('', '', { enabled: true }));

    await act(async () => {
      await result.current.refetch();
    });

    expect(listStopEditsMock).not.toHaveBeenCalled();
  });
});
