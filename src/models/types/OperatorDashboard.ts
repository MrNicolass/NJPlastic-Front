import type { Schemas } from '@/api/types';

export type OperatorDashboardEntry = {
  machine: Schemas['MachineSummaryDTO'];
  status: Schemas['MachineStatusResponseDTO'] | null;
};

export type OperatorDashboardSnapshot = {
  entries: OperatorDashboardEntry[];
};

export type OperatorActiveStopModal = {
  machineId: string;
  machineCode: string;
  stop: Schemas['MachineStatusEntryDTO'];
};

export type ActivePauseModal = {
  machineId: string;
  machineCode: string;
  pauseStartedAt: string;
};
