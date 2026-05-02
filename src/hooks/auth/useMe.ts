'use client';

/**
 * Query hook for current user.
 * Used by components that need live auth state.
 * The layout uses RSC for initial load — this is for client-side refetch.
 */

import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/lib/api/auth';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';

/**
 * Hook to fetch and cache the current authenticated user.
 * 
 * @returns TanStack Query object with user data
 */
export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    staleTime: QUERY_CONFIG.staleTime,
    retry: QUERY_CONFIG.retry,
  });
}
