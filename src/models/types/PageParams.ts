/**
 * Pagination request shape consumed by Spring Data controllers in the
 * backend. The {@link sort} string follows the `property,direction`
 * syntax accepted by Spring (e.g. `"pulseTimestamp,desc"`).
 */
export type PageParams = {
  page: number;
  size: number;
  sort?: string;
};

/**
 * Tiny helper that mirrors the IEMS createPageParams convention so all
 * paginated calls build the request object the same way.
 */
export function createPageParams(page: number, size: number, sort?: string): PageParams {
  return sort ? { page, size, sort } : { page, size };
}
