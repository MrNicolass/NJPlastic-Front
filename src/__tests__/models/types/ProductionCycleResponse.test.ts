import type { ProductionCycleResponse } from '@/models/types/ProductionCycleResponse';

describe('ProductionCycleResponse', () => {
  it('accepts a complete cycle entry', () => {
    const cycle: ProductionCycleResponse = {
      id: '11111111-1111-1111-1111-111111111111',
      machineId: '22222222-2222-2222-2222-222222222222',
      pulseTimestamp: '2026-06-03T12:00:00-03:00',
      receivedAt: '2026-06-03T12:00:00.123-03:00',
      sequence: 42,
      intervalMs: 1500,
      state: 'CONFIRMED',
    };

    expect(cycle.id).toMatch(/-/);
    expect(cycle.sequence).toBe(42);
    expect(cycle.intervalMs).toBe(1500);
    expect(cycle.state).toBe('CONFIRMED');
  });

  it('allows omitting intervalMs', () => {
    const cycle: ProductionCycleResponse = {
      id: 'a',
      machineId: 'b',
      pulseTimestamp: '2026-06-03T12:00:00-03:00',
      receivedAt: '2026-06-03T12:00:00.123-03:00',
      sequence: 1,
      state: 'PENDING',
    };

    expect(cycle.intervalMs).toBeUndefined();
  });

  it.each(['PENDING', 'CONFIRMED', 'SYNCED', 'DISCARDED'] as const)(
    'accepts the %s state',
    (state) => {
      const cycle: ProductionCycleResponse = {
        id: 'a',
        machineId: 'b',
        pulseTimestamp: '2026-06-03T12:00:00-03:00',
        receivedAt: '2026-06-03T12:00:00.123-03:00',
        sequence: 1,
        state,
      };

      expect(cycle.state).toBe(state);
    },
  );
});
