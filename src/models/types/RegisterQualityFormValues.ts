import type { Dayjs } from 'dayjs';

export type RegisterQualityFormValues = {
  goodCount: number;
  totalCount: number;
  range: [Dayjs, Dayjs];
};
