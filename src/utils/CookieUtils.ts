/**
 * Returns the value of a non-httpOnly cookie via `document.cookie`. Safe
 * to call from any client boundary; returns `null` during SSR or when the
 * cookie is missing.
 */
export const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }
  const prefix = `${name}=`;
  const match = document.cookie.split('; ').find((entry) => entry.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
};

/**
 * Returns the UNIX epoch seconds stored in the JS-readable
 * `access_token_exp` cookie emitted alongside `access_token` (httpOnly)
 * by the backend. Returns `null` when the cookie is missing, malformed
 * or being read during SSR.
 */
export const readAccessTokenExpSeconds = (): number | null => {
  const raw = readCookie('access_token_exp');
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};
