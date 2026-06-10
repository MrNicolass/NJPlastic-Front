export type { JwtPayload } from '@/models/types/JwtPayload';
import type { JwtPayload } from '@/models/types/JwtPayload';

/**
 * Decodes the payload section of a compact JWT without verifying the
 * signature. Used by the Next.js middleware on the Edge runtime to read
 * the `role` and `exp` claims for routing decisions. The backend is the
 * source of truth: `JwtAuthenticationFilter` re-verifies the signature
 * on every authenticated API call, so a tampered token cannot reach a
 * real endpoint even if it survives the middleware.
 *
 * @returns the decoded payload, or `null` when the token is malformed
 */
export const decodeJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }
  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const json =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * Returns `true` when the token's `exp` claim is in the past or missing.
 */
export const isJwtExpired = (payload: JwtPayload | null, nowSeconds: number): boolean => {
  if (!payload || typeof payload.exp !== 'number') {
    return true;
  }
  return payload.exp <= nowSeconds;
};
