import type { Page } from '@/models/types/Page';
import type { PageParams } from '@/models/types/PageParams';
import type { AuditLogResponse } from '@/models/types/AuditLogResponse';

/**
 * Filter set accepted by the paginated audit-log list endpoint
 * (`GET /audit-logs`). All fields are optional and combined with AND
 * semantics on the backend. The `from`/`to` window uses ISO 8601 with
 * offset.
 */
export type AuditLogFilters = {
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  from?: string;
  to?: string;
};

/**
 * Contract of the audit-log read endpoint delivered by EP-BE-08
 * sub-task 4. MANAGER-only. The backend forces the natural sort
 * (`timestamp DESC`) so the page never needs to pass `sort`.
 */
export interface IAuditLogService {
  /**
   * Lists audit-log entries paginated with optional filters.
   *
   * @param pageable - The pagination parameters for the request.
   * @param filters - Optional filter set (userId, endpoint, method, statusCode, from, to).
   * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during retrieval.
   * @returns A promise resolving to a `Page` of audit-log projections.
   */
  list(
    pageable: PageParams,
    filters?: AuditLogFilters,
    suppressError?: boolean,
  ): Promise<Page<AuditLogResponse>>;
}
