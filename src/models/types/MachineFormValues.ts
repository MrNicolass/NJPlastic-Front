export type MachineFormValues = {
  code?: string;
  description: string;
  sector?: string;
  standardCycleMs: number;
  toleranceFactor: number;
  consecutivePausesToStop: number;
  offlineWindowMs: number;
  active?: boolean;
  shifts?: string[];
};
