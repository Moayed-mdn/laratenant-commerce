'use client';

/**
 * Hook for fetching user detail by ID.
 */

import { useQuery } from '@tanstack/react-query';
import { getUserDetail } from '@/lib/api/users';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import { mapUserDetail } from '@/lib/mappers/users';

export function useUserDetail(storeId: string, userId: string) {
  // TODO: storeStore currency defaults to 'USD' until store settings
  // endpoint is available. StoreInitializer will populate this later.

  return useQuery({
    queryKey: queryKeys.users(storeId).detail(userId),
    queryFn: () => getUserDetail(storeId, userId),
    staleTime: QUERY_CONFIG.staleTime,
    select: mapUserDetail,
    enabled: !!userId,
  });
}
