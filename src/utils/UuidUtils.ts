/**
 * RFC 4122 UUID format (8-4-4-4-12 hex groups). Used by audit filters
 * and other client-side validations to avoid hitting the backend with
 * malformed identifiers.
 */
export const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isUuid(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }
  return UUID_REGEX.test(value.trim());
}
