/**
 * Base API types used across the entire application.
 */

/** Wraps all single-resource API responses */
export interface ApiResponse<T> {
  status: boolean;
  data: T;
  message: string;
}

/** Wraps all paginated list responses */
export interface PaginatedResponse<T> {
  status: boolean;
  message: string;
  data: T[];
  meta: {
    pagination: PaginationMeta;
  };
}

/** Pagination metadata */
export interface PaginationMeta {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  // Computed client-side (optional)
  from?: number;
  to?: number;
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
