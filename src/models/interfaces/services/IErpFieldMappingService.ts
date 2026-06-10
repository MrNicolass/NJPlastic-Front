import type { Schemas } from '@/api/types';

/**
 * Contract of the ERP field-mapping endpoint delivered by EP-BE-06
 * reopened. Reads are allowed for LEADER/MANAGER; writes are
 * MANAGER-only and atomic (replace-all for the entity_type).
 */
export interface IErpFieldMappingService {
  /**
   * Lists the field mapping rows for an entity type
   * (e.g. `production_order`).
   *
   * @param entityType - The target ERP entity type.
   * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during retrieval.
   * @returns A promise resolving to the list of mapping rows.
   */
  getMapping(
    entityType: string,
    suppressError?: boolean,
  ): Promise<Schemas['ErpFieldMappingDTO'][]>;

  /**
   * Replaces every mapping row for the entity type contained in the
   * payload. The change is captured by the backend AuditFilter
   * (RF20, RN12).
   *
   * @param payload - Update payload with entityType and field overrides.
   * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during the request.
   * @returns A promise resolving to the resulting mapping list.
   */
  replaceMapping(
    payload: Schemas['ErpFieldMappingUpdateRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['ErpFieldMappingDTO'][]>;
}
