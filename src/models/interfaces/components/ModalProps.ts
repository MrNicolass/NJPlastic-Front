import type { Schemas } from '@/api/types';
import type { Role } from '@/models/types/Session';

export type RegisterPauseModalProps = {
  open: boolean;
  onClose(): void;
  machineId: string;
  machineCode: string;
  productionOrderCode?: string;
  pauseStartedAt: string;
  onRegistered?(): void;
};

export type RegisterQualityModalProps = {
  open: boolean;
  onClose(): void;
  machineId: string;
  machineCode: string;
  defaultFrom?: string;
  defaultTo?: string;
  onRegistered?(): void;
};

export type StopMessageEditModalProps = {
  open: boolean;
  onClose(): void;
  machineId: string;
  machineCode: string;
  stopId: string;
  userRole: Role;
  currentMessage: string;
  currentMessageAuthor?: { name: string; editedAt: string } | null;
  detectedAt: string;
  scopeSectorLabel?: string;
  scopeShiftLabel?: string;
  editHistory?: Schemas['StopEditDTO'][];
  editHistoryLoading?: boolean;
  editHistoryError?: unknown;
  onSaved?(): void;
};

export type RegisterEventModalProps = {
  open: boolean;
  onClose: () => void;
  onRegistered?: () => void;
};
