'use client';

import { Tag } from 'antd';
import { ORDERS } from '@/constants/ConstantsAndParams';

export type SyncStatus = 'SYNCED' | 'PENDING' | 'ERROR_RETRY' | 'UNKNOWN';

const COLOR_BY_STATUS: Record<SyncStatus, string> = {
  SYNCED: 'green',
  PENDING: 'gold',
  ERROR_RETRY: 'red',
  UNKNOWN: 'default',
};

/**
 * Derives the effective sync status of a {@code ProductionOrderResponseDTO}
 * from its {@code lastSyncAt}. The backend does not yet expose a dedicated
 * sync-status field, so this approximation marks rows refreshed in the last
 * hour as SYNCED, anything older as PENDING, and unparsable timestamps as
 * UNKNOWN. Will be replaced by the canonical value once the backend ships
 * an explicit field.
 */
export function resolveSyncStatus(lastSyncAt: string | undefined): SyncStatus {
  if (!lastSyncAt) {
    return 'UNKNOWN';
  }
  const parsed = Date.parse(lastSyncAt);
  if (Number.isNaN(parsed)) {
    return 'UNKNOWN';
  }
  const ageMs = Date.now() - parsed;
  if (ageMs <= 60 * 60 * 1000) {
    return 'SYNCED';
  }
  return 'PENDING';
}

type SyncStatusBadgeProps = {
  status: SyncStatus;
};

export function SyncStatusBadge({ status }: SyncStatusBadgeProps) {
  return <Tag color={COLOR_BY_STATUS[status]}>{ORDERS.SYNC_STATUS_LABELS[status]}</Tag>;
}
