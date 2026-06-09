'use client';

import { Card, Col, Row, Statistic, Typography } from 'antd';
import type { Schemas } from '@/api/types';
import { MACHINES } from '@/constants/ConstantsAndParams';

const { Text } = Typography;

export type MachineKpisProps = {
  oee: Schemas['OeeResultDTO'] | null;
  cyclesInShift: number;
  averageCycleMs: number | null;
  mtbfMinutes: number | null;
  scrapPercent: number | null;
};

const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-';
  }
  return `${(value * 100).toFixed(1)}%`;
};

const formatMs = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) {
    return '-';
  }
  return `${value.toFixed(0)} ms`;
};

const formatMinutes = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) {
    return '-';
  }
  return `${value.toFixed(0)} min`;
};

/**
 * KPI strip displayed at the top of the machine detail page. Mirrors
 * the mockup `Machine_Detail_Part1_V1`: OEE, ciclos, tempo de ciclo
 * medio, MTBF e refugo. Quando o OEE volta partial (sem fator Q), o
 * componente exibe '-' nos campos derivados sem quebrar o layout.
 */
export function MachineKpis(props: MachineKpisProps): React.ReactNode {
  const { oee, cyclesInShift, averageCycleMs, mtbfMinutes, scrapPercent } = props;
  return (
    <Card>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={8} xl={4}>
          <Statistic
            title={MACHINES.DETAIL.LABELS.KPI_OEE}
            value={formatPercent(oee?.oee)}
            suffix={oee?.partial ? <Text type="warning"> · parcial</Text> : null}
          />
        </Col>
        <Col xs={12} md={8} xl={4}>
          <Statistic
            title={MACHINES.DETAIL.LABELS.KPI_AVAILABILITY}
            value={formatPercent(oee?.availability)}
          />
        </Col>
        <Col xs={12} md={8} xl={4}>
          <Statistic
            title={MACHINES.DETAIL.LABELS.KPI_PERFORMANCE}
            value={formatPercent(oee?.performance)}
          />
        </Col>
        <Col xs={12} md={8} xl={4}>
          <Statistic
            title={MACHINES.DETAIL.LABELS.KPI_QUALITY}
            value={formatPercent(oee?.quality)}
          />
        </Col>
        <Col xs={12} md={8} xl={4}>
          <Statistic title={MACHINES.DETAIL.LABELS.KPI_CYCLES} value={cyclesInShift} />
        </Col>
        <Col xs={12} md={8} xl={4}>
          <Statistic
            title={MACHINES.DETAIL.LABELS.KPI_AVG_CYCLE_TIME}
            value={formatMs(averageCycleMs)}
          />
        </Col>
        <Col xs={12} md={8} xl={4}>
          <Statistic title={MACHINES.DETAIL.LABELS.KPI_MTBF} value={formatMinutes(mtbfMinutes)} />
        </Col>
        <Col xs={12} md={8} xl={4}>
          <Statistic
            title={MACHINES.DETAIL.LABELS.KPI_SCRAP}
            value={formatPercent(scrapPercent)}
          />
        </Col>
      </Row>
    </Card>
  );
}
