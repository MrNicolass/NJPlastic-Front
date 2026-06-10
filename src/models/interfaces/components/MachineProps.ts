import type { Schemas } from '@/api/types';
import type { CyclePoint } from '@/models/types/CycleTimeChart';
import type { OperatorOfShift } from '@/models/types/OperatorsOfShift';

type MachineState = Schemas['MachineStatusEntryDTO']['state'];

export type MachineCardProps = {
  machine: Schemas['MachineSummaryDTO'];
  currentState: MachineState | null;
  currentStop: Schemas['MachineStatusEntryDTO'] | null;
  cyclesInShift?: number;
  onRegisterPause?(): void;
  onEditStopMessage?(): void;
  onViewDetail(): void;
};

export type MachineKpisProps = {
  oee: Schemas['OeeResultDTO'] | null;
  cyclesInShift: number;
  averageCycleMs: number | null;
  mtbfMinutes: number | null;
  scrapPercent: number | null;
};

export type MachineStatusTimelineProps = {
  windowStartIso: string;
  windowEndIso: string;
  entries: Schemas['MachineStatusEntryDTO'][];
};

export type MachineStopsTableProps = {
  entries: Schemas['MachineStatusEntryDTO'][];
  onEditAutoStop(entry: Schemas['MachineStatusEntryDTO']): void;
  onRegisterPause(entry: Schemas['MachineStatusEntryDTO']): void;
};

export type MoldInfoCardProps = {
  detail: Schemas['MachineDetailResponseDTO'] | null;
  activeCavities?: number;
};

export type OperatorsOfShiftProps = {
  operators: OperatorOfShift[];
};

export type CycleTimeChartProps = {
  cycles: CyclePoint[];
  standardCycleMs: number;
  toleranceFactor: number;
  aggregationWindowMs?: number;
};
