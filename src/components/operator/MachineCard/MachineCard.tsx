'use client';

import { Badge, Button, Card, Space, Tag, Typography } from 'antd';
import type { Schemas } from '@/api/types';
import { MACHINES } from '@/constants/ConstantsAndParams';
import { useResponsive } from '@/hooks/useResponsive';
import type { MachineCardProps } from '@/models/interfaces/components/MachineProps';
import { njPalette } from '@/theme/njTheme';

export type { MachineCardProps } from '@/models/interfaces/components/MachineProps';

const { Text } = Typography;

type MachineState = Schemas['MachineStatusEntryDTO']['state'];

const STATE_BADGE_COLOR: Record<MachineState | 'UNKNOWN', string> = {
  RUNNING: njPalette.cobalt,
  PAUSED: njPalette.cerulean,
  AUTO_STOPPED: njPalette.cinnabar,
  OFFLINE: njPalette.warmGray,
  UNKNOWN: njPalette.warmGray,
};

const STATE_LABEL: Record<MachineState | 'UNKNOWN', string> = {
  RUNNING: MACHINES.STATE_LABELS.RUNNING,
  PAUSED: MACHINES.STATE_LABELS.PAUSED,
  AUTO_STOPPED: MACHINES.STATE_LABELS.AUTO_STOPPED,
  OFFLINE: MACHINES.STATE_LABELS.OFFLINE,
  UNKNOWN: MACHINES.STATE_LABELS.UNKNOWN,
};

/**
 * Single machine tile rendered in the operator dashboard grid. The
 * badge colour, the bottom progress strip and the highlighted action
 * follow : Cobalt for production, Cerulean for an isolated
 * pause, Cinnabar for AUTO_STOPPED.
 */
export function MachineCard(props: MachineCardProps): React.ReactNode {
  const { machine, currentState, currentStop, cyclesInShift, onRegisterPause, onEditStopMessage, onViewDetail } =
    props;
  const { isMobile } = useResponsive();

  const stateKey = (currentState ?? 'UNKNOWN') as MachineState | 'UNKNOWN';
  const badgeColor = STATE_BADGE_COLOR[stateKey];
  const stateLabel = STATE_LABEL[stateKey];
  const isAutoStopped = stateKey === 'AUTO_STOPPED';
  const isPaused = stateKey === 'PAUSED';

  return (
    <Card
      hoverable
      onClick={onViewDetail}
      title={
        <Space wrap size={4}>
          <Text code style={{ fontSize: isMobile ? 14 : 16 }}>
            {machine.code}
          </Text>
          {machine.description ? <Text type="secondary">{machine.description}</Text> : null}
        </Space>
      }
      extra={<Badge color={badgeColor} text={stateLabel} />}
      style={{
        borderLeft: isAutoStopped ? `4px solid ${njPalette.cinnabar}` : undefined,
      }}
    >
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <Space orientation="vertical" size={0}>
          <Text type="secondary">Ciclos no turno</Text>
          <Text code style={{ fontSize: isMobile ? 22 : 28, color: njPalette.charcoal }}>
            {cyclesInShift ?? 0}
          </Text>
        </Space>

        {machine.sector ? (
          <Space>
            <Tag color="default">{machine.sector}</Tag>
            <Text type="secondary">
              {MACHINES.LIST.LABELS.STANDARD_CYCLE_MS}: <Text code>{machine.standardCycleMs}</Text>
            </Text>
          </Space>
        ) : null}

        {isAutoStopped && currentStop ? (
          <Space orientation="vertical" size={2}>
            <Text type="secondary">{MACHINES.STOPS.LABELS.MESSAGE}</Text>
            <Text>{currentStop.message ?? '-'}</Text>
          </Space>
        ) : null}

        <Space
          wrap
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {isPaused && onRegisterPause ? (
            <Button type="primary" onClick={onRegisterPause}>
              {MACHINES.DASHBOARD.BUTTONS.REGISTER_PAUSE}
            </Button>
          ) : null}
          {isAutoStopped && onEditStopMessage ? (
            <Button
              type="primary"
              danger
              style={{ background: njPalette.cinnabar, borderColor: njPalette.cinnabar }}
              onClick={onEditStopMessage}
            >
              {MACHINES.DASHBOARD.BUTTONS.EDIT_STOP_MESSAGE}
            </Button>
          ) : null}
          <Button onClick={onViewDetail}>{MACHINES.DASHBOARD.BUTTONS.VIEW_DETAIL}</Button>
        </Space>
      </Space>
    </Card>
  );
}
