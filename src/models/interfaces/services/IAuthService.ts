import type { Schemas } from '@/api/types';

/**
 * Contract of every authentication-bound REST call delivered by EP-BE-02
 * and consumed by EP-FE-02. Mirrors the IEMS service convention: every
 * method accepts an optional `suppressError` flag as the last parameter;
 * when true the global Axios interceptor skips the error notification so
 * the caller can render its own feedback.
 */
export interface IAuthService {
  /**
   * Authenticates the user against `POST /auth/login`. On success the
   * backend also emits the dual cookies `access_token` (httpOnly) and
   * `access_token_exp` (JS-readable) that drive proactive refresh.
   *
   * @param request - Credentials payload (login + password).
   * @param suppressError - Optional. If true, suppresses notifications on failure.
   * @returns A promise resolving to the issued login response (JWT meta + user).
   */
  login(
    request: Schemas['LoginRequestDTO'],
    suppressError?: boolean,
  ): Promise<Schemas['LoginResponseDTO']>;

  /**
   * Loads the authenticated user via `GET /auth/me`. Used to rehydrate
   * the session store after a hard reload, since the access_token cookie
   * is httpOnly and JavaScript cannot read the user attributes from it.
   *
   * @param suppressError - Optional. If true, suppresses notifications on failure.
   * @returns A promise resolving to the current user summary.
   */
  me(suppressError?: boolean): Promise<Schemas['UserSummaryDTO']>;

  /**
   * Refreshes the JWT via `POST /auth/refresh`. The backend re-emits the
   * dual cookies; the response body carries the new expiration metadata.
   *
   * @param suppressError - Optional. If true, suppresses notifications on failure.
   * @returns A promise resolving to the refreshed token response.
   */
  refresh(suppressError?: boolean): Promise<Schemas['RefreshResponseDTO']>;

  /**
   * Clears the authentication cookies on the backend via
   * `POST /auth/logout`. The browser drops both cookies; the caller is
   * responsible for resetting the local session store and redirecting.
   *
   * @param suppressError - Optional. If true, suppresses notifications on failure.
   */
  logout(suppressError?: boolean): Promise<void>;

  /**
   * Requests a password reset link via `POST /auth/password-reset`. The
   * endpoint is idempotent and returns 204 regardless of whether the
   * login exists (OWASP A07 anti-enumeration).
   *
   * @param request - Login identifier of the account to recover.
   * @param suppressError - Optional. If true, suppresses notifications on failure.
   */
  requestPasswordReset(
    request: Schemas['PasswordResetRequestDTO'],
    suppressError?: boolean,
  ): Promise<void>;

  /**
   * Confirms a password reset via `POST /auth/password-reset/confirm`.
   * Validates the opaque token, rotates the BCrypt hash and invalidates
   * every other token for the same user.
   *
   * @param request - Opaque reset token and the new plaintext password.
   * @param suppressError - Optional. If true, suppresses notifications on failure.
   */
  confirmPasswordReset(
    request: Schemas['PasswordResetConfirmDTO'],
    suppressError?: boolean,
  ): Promise<void>;
}
