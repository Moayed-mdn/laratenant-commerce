'use client';

/**
 * Hook for fetching users list with pagination and filters.
 */

import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/lib/api/users';
import { queryKeys } from '@/lib/queryKeys';
import { QUERY_CONFIG } from '@/config/query';
import type { UserFilters, UserListItemView } from '@/types/user';
import { mapUserListItem } from '@/lib/mappers/users';

export function useUsers(storeId: string, filters: UserFilters) {
  // TODO: storeStore currency defaults to 'USD' until store settings
  // endpoint is available. StoreInitializer will populate this later.

  return useQuery({
    queryKey: queryKeys.users(storeId).list(filters),
    queryFn: () => getUsers(storeId, filters),
    staleTime: QUERY_CONFIG.staleTime,
    select: (data) => ({
      ...data,
      data: data.data.map(mapUserListItem),
    }),
  });
}
