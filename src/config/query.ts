/**
 * TanStack Query configuration.
 */

export const QUERY_CONFIG = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10, // 10 minutes
  retry: 2, // for queries only — mutations get 0
  retryDelay: (attempt: number): number => {
    // Exponential backoff: attempt 0 → 1000ms, 1 → 2000ms, 2 → 4000ms, cap at 30000ms
    return Math.min(1000 * 2 ** attempt, 30000);
  },
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
} as const;
