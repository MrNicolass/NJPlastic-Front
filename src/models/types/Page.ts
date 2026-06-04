/**
 * Generic counterpart of the `org.springframework.data.domain.Page<T>`
 * response Spring controllers return for paginated endpoints. The
 * OpenAPI generator emits a non-generic `Page` schema with `content:
 * unknown[]`, so the typed view is reconstructed here for service
 * consumers.
 */
export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};
