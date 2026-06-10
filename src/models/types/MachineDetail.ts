import type { Schemas } from '@/api/types';
import type { CyclePoint } from '@/models/types/CycleTimeChart';

export type MachineSnapshot = {
  detail: Schemas['MachineDetailResponseDTO'];
  status: Schemas['MachineStatusResponseDTO'];
  cycles: CyclePoint[];
  oee: Schemas['OeeResultDTO'] | null;
  windowStartIso: string;
  windowEndIso: string;
};
