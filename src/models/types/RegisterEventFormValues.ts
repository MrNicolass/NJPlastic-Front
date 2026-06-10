import type { Dayjs } from 'dayjs';
import { EVENTS } from '@/constants/ConstantsAndParams';

export type EventTypeKey = keyof typeof EVENTS.TYPES;

export type RegisterEventFormValues = {
  machineId: string;
  type: EventTypeKey;
  description?: string;
  startedAt: Dayjs;
  endedAt?: Dayjs | null;
};
