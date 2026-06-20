import type { Schemas } from '@/api/types';
import type { Page } from '@/models/types/Page';
import type { PageParams } from '@/models/types/PageParams';

/**
 * Filter set accepted by the paginated user list endpoint
 * (`GET /users`). All fields are optional and combined with AND
 * semantics on the backend.
 */
export type UserListFilters = {
  role?: Schemas['UserResponseDTO']['role'];
  sector?: string;
  shift?: string;
  active?: boolean;
};

/**
 * Contract of every user-administration REST call delivered by
 * sub-task 1. All methods accept an optional
 * {@link suppressError} flag as the last parameter; when true, the
 * global Axios interceptor skips the error notification. Paginated
 * methods take {@link PageParams} as the first parameter, mirroring
 * the project service convention.
 */
export interface IUserService {
 /**
 * Lists users paginated with optional filters.
 *
 * @param pageable - The pagination parameters for the request.
 * @param filters - Optional filter set (role, sector, shift, active).
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during retrieval.
 * @returns A promise resolving to a `Page` of user projections.
 */
  list(
    pageable: PageParams,
    filters?: UserListFilters,
    suppressError?: boolean,
  ): Promise<Page<Schemas['UserResponseDTO']>>;

 /**
 * Retrieves a single user by UUID.
 *
 * @param id - The user UUID.
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during retrieval.
 * @returns A promise resolving to the user projection.
 */
  getById(id: string, suppressError?: boolean): Promise<Schemas['UserResponseDTO']>;

 /**
 * Creates a new user. The backend hashes the password (BCrypt
 * factor 12) and validates login/email uniqueness (409 on conflict).
 *
 * @param payload - Create payload with login, name, email, password, role, sector, shift.
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during the request.
 * @returns A promise resolving to the created user projection.
 */
  create(
    payload: Schemas['UserRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['UserResponseDTO']>;

 /**
 * Updates administrative fields of an existing user. Login and
 * password are immutable on this endpoint - the password rotates
 * only through the password-reset flow.
 *
 * @param id - The user UUID.
 * @param payload - Update payload (name, email, role, sector, shift, active).
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during the request.
 * @returns A promise resolving to the updated user projection.
 */
  update(
    id: string,
    payload: Schemas['UserUpdateRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['UserResponseDTO']>;

 /**
 * Soft-deletes a user. Flips the `active` flag to `false` while
 * preserving the FK semantic on `audit_log.user_id`.
 *
 * @param id - The user UUID.
 * @param suppressError - Optional. If set to `true`, suppresses errors that may occur during the request.
 * @returns A promise resolving once the request is acknowledged.
 */
  softDelete(id: string, suppressError?: boolean): Promise<void>;
}
