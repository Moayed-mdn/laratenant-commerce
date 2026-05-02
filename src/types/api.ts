/**
 * Base API types used across the entire application.
 */

/** Wraps all single-resource API responses */
export interface ApiResponse<T> {
  data: T;
  message: string;
}

/** Wraps all paginated list responses */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

/** Pagination metadata */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

/** Pagination links */
export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

/** Normalized error shape used everywhere in the app */
export interface ApiError {
  message: string;
  errors: Record<string, string[]>;
  status: number;
  code: string;
}

/** HTTP methods supported by the API */
export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
