'use client';

import { Card, Descriptions, Typography } from 'antd';
import type { Schemas } from '@/api/types';
import { MACHINES } from '@/constants/ConstantsAndParams';
import type { MoldInfoCardProps } from '@/models/interfaces/components/MachineProps';

export type { MoldInfoCardProps } from '@/models/interfaces/components/MachineProps';

const { Text } = Typography;

/**
 * Read-only summary of the detection parameters bound to the machine.
 * The mold projection itself is not exposed by yet (the ERP
 * mock does not seed cavity counts); for now the card shows the
 * cycle/tolerance/pause-threshold trio plus the cavity count when the
 * caller supplies one.
 */
export function MoldInfoCard(props: MoldInfoCardProps): React.ReactNode {
  const { detail, activeCavities } = props;
  return (
    <Card title={MACHINES.DETAIL.LABELS.MOLD_TITLE}>
      <Descriptions column={1} size="small">
        <Descriptions.Item label={MACHINES.DETAIL.LABELS.MOLD_STANDARD_CYCLE}>
          {detail ? <Text code>{detail.standardCycleMs} ms</Text> : '-'}
        </Descriptions.Item>
        <Descriptions.Item label={MACHINES.DETAIL.LABELS.MOLD_TOLERANCE}>
          {detail ? <Text code>{detail.toleranceFactor.toFixed(2)}</Text> : '-'}
        </Descriptions.Item>
        <Descriptions.Item label={MACHINES.DETAIL.LABELS.MOLD_CONSECUTIVE_PAUSES}>
          {detail ? <Text code>{detail.consecutivePausesToStop}</Text> : '-'}
        </Descriptions.Item>
        <Descriptions.Item label={MACHINES.DETAIL.LABELS.MOLD_CAVITIES}>
          {typeof activeCavities === 'number' ? (
            <Text code>{activeCavities}</Text>
          ) : (
            <Text type="secondary">-</Text>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
