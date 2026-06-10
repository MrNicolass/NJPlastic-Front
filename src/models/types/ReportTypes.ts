export type ReportType = 'SHIFT' | 'DAILY' | 'WEEKLY';

export type ReportFormat = 'CSV' | 'PDF' | 'XLSX';

export type ReportHistoryResponse = {
  id: string;
  scheduleId: string | null;
  type: ReportType;
  generatedAt: string;
  format: ReportFormat;
  path: string;
  sizeBytes: number;
};

export type ReportScheduleResponse = {
  id: string;
  type: ReportType;
  params: string | null;
  cron: string;
  deliveryEmail: string;
  format: ReportFormat;
  active: boolean;
  createdBy: string | null;
  createdAt: string;
};

export type ReportScheduleRequest = {
  type: ReportType;
  params?: string;
  cron: string;
  deliveryEmail: string;
  format: ReportFormat;
};

export type ReportHistoryFilters = {
  type?: ReportType;
  from?: string;
  to?: string;
};
