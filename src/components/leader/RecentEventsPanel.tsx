'use client';

import {
  EditOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Empty, List, Skeleton, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';
import { useImperativeHandle, useMemo, type Ref } from 'react';
import { EVENTS } from '@/constants/ConstantsAndParams';
import { usePolling } from '@/hooks/usePolling';
import type { RecentEventResponse, RecentEventType } from '@/models/types/RecentEvent';
import ProductionEventService from '@/services/ProductionEventService';

dayjs.extend(relativeTime);
try {
  dayjs.locale('pt-br');
} catch {
  // Locale package may be missing in the test environment; fall back to default.
}

const { Text } = Typography;

const PANEL_POLL_INTERVAL_MS = 15_000;
const RECENT_LOOKBACK_HOURS = 4;
const RECENT_LIMIT = 50;

const ICON_BY_TYPE: Record<RecentEventType, React.ReactNode> = {
  MANUAL_EVENT: <ToolOutlined />,
  MANUAL_PAUSE: <PauseCircleOutlined />,
  AUTO_STOP: <StopOutlined style={{ color: '#E84A1F' }} />,
  STOP_MESSAGE_EDIT: <EditOutlined />,
};

const fetchRecent = async (): Promise<RecentEventResponse[]> => {
  const to = dayjs();
  const from = to.subtract(RECENT_LOOKBACK_HOURS, 'hour');
  return ProductionEventService.findRecent(RECENT_LIMIT, from.toISOString(), to.toISOString(), true);
};

export type RecentEventsPanelHandle = {
  refetch: () => Promise<void>;
};

type RecentEventsPanelProps = {
  panelRef?: Ref<RecentEventsPanelHandle>;
  onItemClick?: (event: RecentEventResponse) => void;
};

/**
 * Right-column panel of the Leader dashboard (EP-FE-05 item 6, mockup
 * {@code Dashboard_Part2_V1}). Polls {@code GET /events/recent} every 15s
 * with Page-Visibility-aware pause and renders a timeline ordered by
 * timestamp DESC. The `panelRef` exposes a {@code refetch} handle so the
 * consumer (Leader dashboard) can force a refresh right after registering
 * a manual event from the header CTA.
 */
export function RecentEventsPanel({ panelRef, onItemClick }: RecentEventsPanelProps) {
  const { data, loading, error, refetch } = usePolling<RecentEventResponse[]>(
    fetchRecent,
    PANEL_POLL_INTERVAL_MS,
  );

  useImperativeHandle(panelRef, () => ({ refetch }), [refetch]);

  const entries = useMemo<RecentEventResponse[]>(() => data ?? [], [data]);

  if (loading && entries.length === 0 && !error) {
    return <Skeleton active paragraph={{ rows: 4 }} />;
  }
  if (error && entries.length === 0) {
    return (
      <Empty
        description={
          <Text type="secondary">{EVENTS.RECENT.LABELS.LOAD_ERROR}</Text>
        }
      />
    );
  }
  if (entries.length === 0) {
    return <Empty description={EVENTS.RECENT.LABELS.EMPTY} />;
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={entries}
      renderItem={(event) => {
        const typeLabel = EVENTS.RECENT.TYPE_LABELS[event.type];
        const description = event.description ?? typeLabel;
        const relative = (() => {
          try {
            return dayjs(event.timestamp).fromNow();
          } catch {
            return EVENTS.RECENT.LABELS.RELATIVE_FALLBACK;
          }
        })();
        return (
          <List.Item
            onClick={onItemClick ? () => onItemClick(event) : undefined}
            style={onItemClick ? { cursor: 'pointer' } : undefined}
          >
            <List.Item.Meta
              avatar={ICON_BY_TYPE[event.type]}
              title={
                <Space size={8} wrap>
                  <Text strong>{typeLabel}</Text>
                  <Text code>{event.machineCode}</Text>
                </Space>
              }
              description={
                <Space orientation="vertical" size={0} style={{ width: '100%' }}>
                  <Text>{description}</Text>
                  <Space size={8} wrap>
                    <Text type="secondary">{relative}</Text>
                    {event.userName ? <Text type="secondary">· {event.userName}</Text> : null}
                  </Space>
                </Space>
              }
            />
          </List.Item>
        );
      }}
    />
  );
}
