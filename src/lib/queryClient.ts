/**
 * TanStack Query client configuration.
 */

import { QueryClient } from '@tanstack/react-query';
import { QUERY_CONFIG } from '@/config/query';

/**
 * Create a QueryClient with the app's default configuration.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_CONFIG.staleTime,
        gcTime: QUERY_CONFIG.gcTime,
        retry: QUERY_CONFIG.retry,
        retryDelay: QUERY_CONFIG.retryDelay,
        refetchOnWindowFocus: QUERY_CONFIG.refetchOnWindowFocus,
        refetchOnReconnect: QUERY_CONFIG.refetchOnReconnect,
      },
      mutations: {
        retry: 0, // Hard rule — mutations never retry
      },
    },
  });
}

/**
 * Default QueryClient instance for client-side use.
 * For SSR, use makeQueryClient() to create a fresh instance per request.
 */
export const queryClient = makeQueryClient();

export default queryClient;
