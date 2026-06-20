import type { Schemas } from '@/api/types';
import type { Page } from '@/models/types/Page';
import type { PageParams } from '@/models/types/PageParams';
import type { ProductionCycleResponse } from '@/models/types/ProductionCycleResponse';

/**
 * Contract of every machine-bound REST call delivered by the backend.
 * All methods accept an optional {@link suppressError} flag as the last
 * parameter; when true, the global Axios interceptor skips the error
 * notification so the caller can render its own feedback. Paginated
 * methods take {@link PageParams} as the first parameter, mirroring the
 * project service convention.
 */
export interface IMachineService {
 /**
 * Lists active machines visible to the current user (scoped by sector
 * for OPERATOR/LEADER, unrestricted for MANAGER).
 *
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during retrieval.
 * @returns A promise resolving to the list of accessible machine summaries.
 */
  listMachines(suppressError?: boolean): Promise<Schemas['MachineSummaryDTO'][]>;

 /**
 * Retrieves the current state and the status timeline of a machine
 * within `[from, to]`.
 *
 * @param machineId - The machine UUID.
 * @param from - Window start in ISO 8601 with offset.
 * @param to - Window end in ISO 8601 with offset.
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during retrieval.
 * @returns A promise resolving to the machine status response.
 */
  getStatus(
    machineId: string,
    from: string,
    to: string,
    suppressError?: boolean,
  ): Promise<Schemas['MachineStatusResponseDTO']>;

 /**
 * Retrieves the paginated cycle history of a machine.
 *
 * @param pageable - The pagination parameters for the request.
 * @param machineId - The machine UUID.
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during retrieval.
 * @returns A promise resolving to a `Page` of production cycles.
 */
  getCycles(
    pageable: PageParams,
    machineId: string,
    suppressError?: boolean,
  ): Promise<Page<ProductionCycleResponse>>;

 /**
 * Classifies the latest open isolated pause of a machine by attaching
 * a reason.
 *
 * @param machineId - The machine UUID.
 * @param reason - The reason text supplied by the user.
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during the request.
 * @returns A promise resolving to the updated status entry.
 */
  registerPause(
    machineId: string,
    reason: string,
    suppressError?: boolean,
  ): Promise<Schemas['MachineStatusEntryDTO']>;

 /**
 * Edits the message of an AUTO_STOPPED record.
 *
 * @param machineId - The owning machine UUID.
 * @param stopId - The stop record UUID.
 * @param message - The new message text.
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during the request.
 * @returns A promise resolving to the updated status entry.
 */
  editStopMessage(
    machineId: string,
    stopId: string,
    message: string,
    suppressError?: boolean,
  ): Promise<Schemas['MachineStatusEntryDTO']>;

 /**
 * Calculates the OEE of a machine over the requested window.
 *
 * @param machineId - The machine UUID.
 * @param from - Window start in ISO 8601 with offset.
 * @param to - Window end in ISO 8601 with offset.
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during retrieval.
 * @returns A promise resolving to the OEE result (may be partial).
 */
  getOee(
    machineId: string,
    from: string,
    to: string,
    suppressError?: boolean,
  ): Promise<Schemas['OeeResultDTO']>;

 /**
 * Registers quality counts that close the OEE quality factor.
 *
 * @param machineId - The machine UUID.
 * @param request - The good/total counts payload.
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during the request.
 * @returns A promise resolving to the stored quality record.
 */
  registerQuality(
    machineId: string,
    request: Schemas['QualityRegistrationRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['QualityRecord']>;

 /**
 * Generates the consolidated shift report.
 *
 * @param from - Window start in ISO 8601 with offset.
 * @param to - Window end in ISO 8601 with offset.
 * @param sector - Optional sector filter applied on top of the principal scope.
 * @param shift - Optional shift label echoed in the response.
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during retrieval.
 * @returns A promise resolving to the shift report aggregate.
 */
  getShiftReport(
    from: string,
    to: string,
    sector: string | undefined,
    shift: string | undefined,
    suppressError?: boolean,
  ): Promise<Schemas['ShiftReportResponseDTO']>;

 /**
 * Retrieves the full machine projection including detection parameters
 * (standard cycle, tolerance factor, consecutive pauses to stop) used
 * by the machine detail screen.
 *
 * @param machineId - The machine UUID.
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during retrieval.
 * @returns A promise resolving to the machine detail projection.
 */
  getDetail(
    machineId: string,
    suppressError?: boolean,
  ): Promise<Schemas['MachineDetailResponseDTO']>;

 /**
 * Retrieves the audit-log-backed edition history of an AUTO_STOPPED
 * message. Paginated and ordered newest-first by
 * the backend.
 *
 * @param pageable - The pagination parameters for the request.
 * @param machineId - The owning machine UUID.
 * @param stopId - The stop record UUID.
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during retrieval.
 * @returns A promise resolving to a `Page` of stop edition entries.
 */
  listStopEdits(
    pageable: PageParams,
    machineId: string,
    stopId: string,
    suppressError?: boolean,
  ): Promise<Page<Schemas['StopEditDTO']>>;

 /**
 * Registers a new machine (sub-task 2). The backend
 * validates uniqueness of the short code; on conflict it returns
 * 409. The machine is created active.
 *
 * @param payload - Create payload (code, description, sector, cycle params).
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during the request.
 * @returns A promise resolving to the created machine projection.
 */
  createMachine(
    payload: Schemas['MachineRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['MachineDetailResponseDTO']>;

 /**
 * Updates an existing machine. The short code is immutable on this
 * endpoint - it identifies the machine on the MQTT payload
 * and on historical cycles.
 *
 * @param machineId - The machine UUID.
 * @param payload - Update payload (description, sector, cycle params, active).
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during the request.
 * @returns A promise resolving to the updated machine projection.
 */
  updateMachine(
    machineId: string,
    payload: Schemas['MachineUpdateRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['MachineDetailResponseDTO']>;

 /**
 * Soft-deletes a machine. Flips the `active` flag to `false` while
 * preserving cycle history and audit traceability.
 *
 * @param machineId - The machine UUID.
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during the request.
 * @returns A promise resolving once the request is acknowledged.
 */
  softDeleteMachine(machineId: string, suppressError?: boolean): Promise<void>;
}
