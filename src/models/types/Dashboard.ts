import type { Schemas } from '@/api/types';

export type DashboardEntry = {
  machine: Schemas['MachineSummaryDTO'];
  status: Schemas['MachineStatusResponseDTO'] | null;
  oee: Schemas['OeeResultDTO'] | null;
};

export type DashboardSnapshot = { entries: DashboardEntry[] };

export type ActiveStopModal = {
  machineId: string;
  machineCode: string;
  stop: Schemas['MachineStatusEntryDTO'];
};

export type ConsolidatedDashboardPageProps = {
  userRole: 'LEADER' | 'MANAGER' | 'ADMIN';
  recentEventsSlot?: React.ReactNode;
  onRegisterEventClick?: () => void;
};
