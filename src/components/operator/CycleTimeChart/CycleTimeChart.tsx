'use client';

import { Empty, Segmented, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { MACHINES } from '@/constants/ConstantsAndParams';
import { njPalette } from '@/theme/njTheme';

const { Text } = Typography;

export type CyclePoint = {
  timestamp: string;
  intervalMs: number;
};

export type CycleTimeChartProps = {
  cycles: CyclePoint[];
  standardCycleMs: number;
  toleranceFactor: number;
  aggregationWindowMs?: number;
};

type RangeKey = '4H' | 'SHIFT' | '24H' | '7D';

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: '4H', label: MACHINES.DETAIL.LABELS.CHART_RANGE_4H },
  { value: 'SHIFT', label: MACHINES.DETAIL.LABELS.CHART_RANGE_SHIFT },
  { value: '24H', label: MACHINES.DETAIL.LABELS.CHART_RANGE_24H },
  { value: '7D', label: MACHINES.DETAIL.LABELS.CHART_RANGE_7D },
];

const RANGE_TO_MS: Record<RangeKey, number> = {
  '4H': 4 * 60 * 60 * 1000,
  SHIFT: 8 * 60 * 60 * 1000,
  '24H': 24 * 60 * 60 * 1000,
  '7D': 7 * 24 * 60 * 60 * 1000,
};

const DEFAULT_AGGREGATION_MS = 30_000;

type Aggregated = { x: number; y: number; count: number };

const aggregate = (cycles: CyclePoint[], windowMs: number): Aggregated[] => {
  if (cycles.length === 0) {
    return [];
  }
  const buckets = new Map<number, { sum: number; count: number }>();
  for (const cycle of cycles) {
    const ts = new Date(cycle.timestamp).getTime();
    if (Number.isNaN(ts)) {
      continue;
    }
    const bucket = Math.floor(ts / windowMs) * windowMs;
    const acc = buckets.get(bucket) ?? { sum: 0, count: 0 };
    acc.sum += cycle.intervalMs;
    acc.count += 1;
    buckets.set(bucket, acc);
  }
  return Array.from(buckets.entries())
    .map(([x, { sum, count }]) => ({ x, y: sum / count, count }))
    .sort((a, b) => a.x - b.x);
};

const formatTime = (epoch: number): string => {
  const d = new Date(epoch);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * Time-series view of the cycle interval aggregated in 30-second
 * buckets, overlaid with the tolerance band derived from the machine
 * detection parameters (`standardCycleMs * toleranceFactor`, RN06).
 * Rendered as a self-contained SVG to avoid pulling a chart runtime
 * for a single view; the SVG is responsive via `preserveAspectRatio`.
 */
export function CycleTimeChart(props: CycleTimeChartProps): React.ReactNode {
  const { cycles, standardCycleMs, toleranceFactor, aggregationWindowMs } = props;
  const [range, setRange] = useState<RangeKey>('SHIFT');

  const windowMs = aggregationWindowMs ?? DEFAULT_AGGREGATION_MS;

  const filtered = useMemo(() => {
    const cutoff = Date.now() - RANGE_TO_MS[range];
    return cycles.filter((cycle) => new Date(cycle.timestamp).getTime() >= cutoff);
  }, [cycles, range]);

  const aggregated = useMemo(() => aggregate(filtered, windowMs), [filtered, windowMs]);

  const upperBand = standardCycleMs * toleranceFactor;
  const lowerBand = standardCycleMs;

  const innerWidth = 800;
  const innerHeight = 240;
  const paddingLeft = 56;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 32;
  const plotWidth = innerWidth - paddingLeft - paddingRight;
  const plotHeight = innerHeight - paddingTop - paddingBottom;

  const yMax = useMemo(() => {
    const observed = aggregated.reduce((acc, point) => Math.max(acc, point.y), 0);
    return Math.max(upperBand * 1.2, observed * 1.1, standardCycleMs * 2);
  }, [aggregated, upperBand, standardCycleMs]);

  const xValues = aggregated.map((point) => point.x);
  const xMin = xValues.length > 0 ? xValues[0] : Date.now() - RANGE_TO_MS[range];
  const xMax = xValues.length > 0 ? xValues[xValues.length - 1] : Date.now();
  const xSpan = Math.max(1, xMax - xMin);

  const xScale = (x: number) => paddingLeft + ((x - xMin) / xSpan) * plotWidth;
  const yScale = (y: number) => paddingTop + plotHeight - (y / yMax) * plotHeight;

  const polyline = aggregated.map((point) => `${xScale(point.x)},${yScale(point.y)}`).join(' ');

  const bandTop = yScale(upperBand);
  const bandBottom = yScale(lowerBand);

  const tickCount = 4;
  const xTicks = Array.from({ length: tickCount + 1 }, (_, index) =>
    xMin + (xSpan / tickCount) * index,
  );
  const yTicks = Array.from({ length: 5 }, (_, index) => (yMax / 4) * index);

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }} align="center">
        <Text strong>{MACHINES.DETAIL.LABELS.CHART_TITLE}</Text>
        <Segmented
          value={range}
          onChange={(value) => setRange(value as RangeKey)}
          options={RANGE_OPTIONS}
        />
      </Space>

      {aggregated.length === 0 ? (
        <Empty description="Sem ciclos no periodo selecionado" />
      ) : (
        <svg
          role="img"
          aria-label={MACHINES.DETAIL.LABELS.CHART_TITLE}
          viewBox={`0 0 ${innerWidth} ${innerHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: 'auto', background: njPalette.bone }}
        >
          <rect
            x={paddingLeft}
            y={bandTop}
            width={plotWidth}
            height={Math.max(0, bandBottom - bandTop)}
            fill={njPalette.cerulean}
            opacity={0.15}
          />
          <line
            x1={paddingLeft}
            x2={innerWidth - paddingRight}
            y1={yScale(lowerBand)}
            y2={yScale(lowerBand)}
            stroke={njPalette.cobalt}
            strokeDasharray="4 4"
          />
          <line
            x1={paddingLeft}
            x2={innerWidth - paddingRight}
            y1={yScale(upperBand)}
            y2={yScale(upperBand)}
            stroke={njPalette.cinnabar}
            strokeDasharray="4 4"
          />
          {yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={paddingLeft}
                x2={innerWidth - paddingRight}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke={njPalette.warmGray}
                opacity={0.2}
              />
              <text
                x={paddingLeft - 8}
                y={yScale(tick) + 4}
                textAnchor="end"
                fontSize="11"
                fill={njPalette.charcoal}
              >
                {tick.toFixed(0)}
              </text>
            </g>
          ))}
          {xTicks.map((tick) => (
            <text
              key={`x-${tick}`}
              x={xScale(tick)}
              y={innerHeight - paddingBottom + 18}
              textAnchor="middle"
              fontSize="11"
              fill={njPalette.charcoal}
            >
              {formatTime(tick)}
            </text>
          ))}
          <polyline
            points={polyline}
            fill="none"
            stroke={njPalette.charcoal}
            strokeWidth={1.5}
          />
          {aggregated.map((point) => {
            const isOutside = point.y > upperBand || point.y < lowerBand;
            return (
              <circle
                key={point.x}
                cx={xScale(point.x)}
                cy={yScale(point.y)}
                r={isOutside ? 3 : 2}
                fill={isOutside ? njPalette.cinnabar : njPalette.cobalt}
              />
            );
          })}
        </svg>
      )}
    </Space>
  );
}
