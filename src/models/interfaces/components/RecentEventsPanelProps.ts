import type { Ref } from 'react';
import type { RecentEventResponse } from '@/models/types/RecentEvent';

export type RecentEventsPanelHandle = {
  refetch: () => Promise<void>;
};

export type RecentEventsPanelProps = {
  panelRef?: Ref<RecentEventsPanelHandle>;
  onItemClick?: (event: RecentEventResponse) => void;
};
