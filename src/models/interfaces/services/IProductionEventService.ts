import type { Schemas } from '@/api/types';
import type { Page } from '@/models/types/Page';
import type { PageParams } from '@/models/types/PageParams';
import type { RecentEventResponse } from '@/models/types/RecentEvent';

/**
 * Contract for the manual production-event endpoints (EP-BE-05 reopened
 * + EP-FE-05 Fase A). Mirrors the IEMS service convention: paginated
 * methods take {@link PageParams} as the first parameter; every method
 * accepts an optional {@link suppressError} flag so the Axios
 * interceptor skips its own error notification.
 */
export interface IProductionEventService {
  /**
   * Registers a manual production event on a machine (UC05/UC11 ext).
   *
   * @param request - Payload describing the event.
   * @param suppressError - If true, suppress the global error notification.
   * @returns The persisted event.
   */
  registerEvent(
    request: Schemas['EventRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['EventResponseDTO']>;

  /**
   * Lists manual events of a machine, optionally restricted to a window.
   *
   * @param pageable - Pagination parameters.
   * @param machineId - The machine UUID.
   * @param from - Optional window start (ISO 8601 with offset).
   * @param to - Optional window end (ISO 8601 with offset).
   * @param suppressError - If true, suppress the global error notification.
   * @returns Page of events ordered newest-first.
   */
  listForMachine(
    pageable: PageParams,
    machineId: string,
    from: string | undefined,
    to: string | undefined,
    suppressError?: boolean,
  ): Promise<Page<Schemas['EventResponseDTO']>>;

  /**
   * Aggregated "Eventos recentes" feed for the Leader dashboard
   * (EP-FE-05 item 6). Merges manual events, manual pauses, auto stops
   * and stop-message edits across the accessible machines.
   *
   * @param limit - Max number of entries to return.
   * @param from - Optional window start (ISO 8601 with offset).
   * @param to - Optional window end (ISO 8601 with offset).
   * @param suppressError - If true, suppress the global error notification.
   * @returns List of feed entries ordered by timestamp DESC.
   */
  findRecent(
    limit: number,
    from: string | undefined,
    to: string | undefined,
    suppressError?: boolean,
  ): Promise<RecentEventResponse[]>;
}
