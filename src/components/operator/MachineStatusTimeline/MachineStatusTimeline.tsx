'use client';

import { Empty, Space, Tooltip, Typography } from 'antd';
import { useMemo } from 'react';
import type { Schemas } from '@/api/types';
import { MACHINES } from '@/constants/ConstantsAndParams';
import type { MachineStatusTimelineProps } from '@/models/interfaces/components/MachineProps';
import { njPalette } from '@/theme/njTheme';

export type { MachineStatusTimelineProps } from '@/models/interfaces/components/MachineProps';

const { Text } = Typography;

type State = NonNullable<Schemas['MachineStatusEntryDTO']['state']>;

const STATE_COLOR: Record<State | 'UNKNOWN', string> = {
  RUNNING: njPalette.cobalt,
  PAUSED: njPalette.cerulean,
  AUTO_STOPPED: njPalette.cinnabar,
  OFFLINE: njPalette.warmGray,
  UNKNOWN: njPalette.warmGray,
};

const STATE_LABEL: Record<State | 'UNKNOWN', string> = {
  RUNNING: MACHINES.STATE_LABELS.RUNNING,
  PAUSED: MACHINES.STATE_LABELS.PAUSED,
  AUTO_STOPPED: MACHINES.STATE_LABELS.AUTO_STOPPED,
  OFFLINE: MACHINES.STATE_LABELS.OFFLINE,
  UNKNOWN: MACHINES.STATE_LABELS.UNKNOWN,
};

const formatHour = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * Horizontal bar that visualises the machine state transitions inside
 * the requested window. Each entry maps to a coloured segment whose
 * width is proportional to its duration; the legend at the bottom
 * doubles as the state colour key. Open entries (`endTime` null) are
 * extended to the window end so the bar always covers the full range.
 */
export function MachineStatusTimeline(props: MachineStatusTimelineProps): React.ReactNode {
  const { windowStartIso, windowEndIso, entries } = props;
  const startMs = new Date(windowStartIso).getTime();
  const endMs = new Date(windowEndIso).getTime();
  const span = Math.max(1, endMs - startMs);

  const segments = useMemo(() => {
    return entries
      .map((entry) => {
        const segStart = Math.max(startMs, new Date(entry.startTime).getTime());
        const segEnd = entry.endTime
          ? Math.min(endMs, new Date(entry.endTime).getTime())
          : endMs;
        const widthPct = ((segEnd - segStart) / span) * 100;
        const offsetPct = ((segStart - startMs) / span) * 100;
        return {
          id: entry.id,
          state: entry.state,
          startTime: entry.startTime,
          endTime: entry.endTime,
          message: entry.message,
          offsetPct,
          widthPct,
        };
      })
      .filter((segment) => segment.widthPct > 0);
  }, [entries, startMs, endMs, span]);

  if (segments.length === 0) {
    return <Empty description={MACHINES.DETAIL.LABELS.TIMELINE_EMPTY} />;
  }

  return (
    <Space orientation="vertical" size={8} style={{ width: '100%' }}>
      <div
        style={{
          position: 'relative',
          height: 24,
          background: njPalette.bone,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {segments.map((segment) => {
          const stateKey = (segment.state ?? 'UNKNOWN') as State | 'UNKNOWN';
          return (
            <Tooltip
              key={segment.id}
              title={
                <Space orientation="vertical" size={0}>
                  <Text style={{ color: '#fff' }}>{STATE_LABEL[stateKey]}</Text>
                  <Text style={{ color: '#fff' }}>
                    {formatHour(segment.startTime)} →{' '}
                    {segment.endTime ? formatHour(segment.endTime) : '...'}
                  </Text>
                  {segment.message ? (
                    <Text style={{ color: '#fff' }}>{segment.message}</Text>
                  ) : null}
                </Space>
              }
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${segment.offsetPct}%`,
                  width: `${segment.widthPct}%`,
                  background: STATE_COLOR[stateKey],
                }}
              />
            </Tooltip>
          );
        })}
      </div>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Text type="secondary">{formatHour(windowStartIso)}</Text>
        <Text type="secondary">{formatHour(windowEndIso)}</Text>
      </Space>
    </Space>
  );
}
