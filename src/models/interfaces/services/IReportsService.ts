import type { Page } from '@/models/types/Page';
import type { PageParams } from '@/models/types/PageParams';
import type {
  ReportHistoryFilters,
  ReportHistoryResponse,
  ReportScheduleRequest,
  ReportScheduleResponse,
} from '@/models/types/ReportTypes';

/**
 * Contract of the report library and scheduling endpoints delivered by
 * sub-task 5 (history + schedule CRUD) and (download).
 * Suppression rules and notification keys follow the same pattern as the
 * other services - see {@link IAuditLogService}.
 */
export interface IReportsService {
 /**
 * Paginated read of the 90-day report library (LEADER/MANAGER).
 */
  listHistory(
    pageable: PageParams,
    filters?: ReportHistoryFilters,
    suppressError?: boolean,
  ): Promise<Page<ReportHistoryResponse>>;

 /**
 * List active report schedules (MANAGER-only).
 */
  listSchedules(suppressError?: boolean): Promise<ReportScheduleResponse[]>;

 /**
 * Create a new report schedule (MANAGER-only).
 */
  createSchedule(
    payload: ReportScheduleRequest,
    suppressError?: boolean,
  ): Promise<ReportScheduleResponse>;

 /**
 * Soft-delete a report schedule (MANAGER-only).
 */
  deleteSchedule(id: string, suppressError?: boolean): Promise<void>;

 /**
 * Stream the binary artifact for a stored report (LEADER/MANAGER).
 * Returns a Blob the caller can wrap with URL.createObjectURL.
 */
  downloadArtifact(id: string, suppressError?: boolean): Promise<Blob>;
}
