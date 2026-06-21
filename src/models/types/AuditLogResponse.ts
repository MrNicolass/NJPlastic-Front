/**
 * Manual mirror of the backend AuditLogResponseDTO. The OpenAPI snapshot
 * committed in `src/api/openapi.json` predates the audit-log controller,
 * so the row shape is reconstructed here for typed consumption by the
 * Auditoria tab/page. Payloads are surfaced verbatim from the database
 * and were already sanitized at write time by the backend
 * PayloadSanitizer.
 */
export type AuditLogResponse = {
  id: string;
  timestamp: string;
  userId?: string | null;
  httpMethod: string;
  endpoint: string;
  httpStatus: number;
  requestPayload?: string | null;
  responsePayload?: string | null;
  sourceIp?: string | null;
  durationMs?: number | null;
};
