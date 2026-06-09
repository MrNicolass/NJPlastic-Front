'use client';

import { Alert, Button, Space, Typography } from 'antd';
import { MACHINES } from '@/constants/ConstantsAndParams';
import { njPalette } from '@/theme/njTheme';

const { Text } = Typography;

export type UnreviewedAutoStop = {
  machineId: string;
  machineCode: string;
  stopId: string;
};

export type AttentionBannerProps = {
  items: UnreviewedAutoStop[];
  onSelect(item: UnreviewedAutoStop): void;
};

/**
 * Persistent warning shown at the top of the operator dashboard while
 * one or more machines under the user's shift carry an AUTO_STOPPED
 * record whose default system message has not been replaced (RF11,
 * UC12). The component disappears as soon as the last unreviewed stop
 * is reclassified through `<StopMessageEditModal>` — the parent
 * recomputes `items` on every polling tick.
 */
export function AttentionBanner({ items, onSelect }: AttentionBannerProps): React.ReactNode {
  if (items.length === 0) {
    return null;
  }
  return (
    <Alert
      type="warning"
      showIcon
      banner
      style={{ borderLeft: `4px solid ${njPalette.cinnabar}` }}
      message={<Text strong>{MACHINES.BANNER.ATTENTION.TITLE}</Text>}
      description={
        <Space orientation="vertical" size={6} style={{ width: '100%' }}>
          <Text>{MACHINES.BANNER.ATTENTION.MESSAGE(items.length)}</Text>
          <Space wrap>
            {items.map((item) => (
              <Button
                key={item.stopId}
                size="small"
                type="link"
                onClick={() => onSelect(item)}
              >
                {MACHINES.BANNER.ATTENTION.EDIT_LINK(item.machineCode)}
              </Button>
            ))}
          </Space>
        </Space>
      }
    />
  );
}
