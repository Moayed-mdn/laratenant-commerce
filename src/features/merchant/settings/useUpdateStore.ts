'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { queryKeys } from '@/lib/queryKeys';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { updateStore } from '@/lib/api/stores';
import { toast } from 'sonner';
import type { ApiError, ApiResponse } from '@/types/api';
import type { Store, UpdateStorePayload } from '@/types/store';

/**
 * Hook to update a store's settings.
 * Refreshes both the specific store detail and the global bootstrap state on success.
 */
export function useUpdateStore(storeSlug: string) {
  const queryClient = useQueryClient();
  const fetchBootstrap = useBootstrapStore((state) => state.fetchBootstrap);
  const t = useTranslations('stores');

  return useMutation<ApiResponse<Store>, ApiError, UpdateStorePayload>({
    mutationFn: (payload: UpdateStorePayload) => updateStore(storeSlug, payload),
    onSuccess: async (response) => {
      // 1. Invalidate the store detail in the query cache
      await queryClient.invalidateQueries({
        queryKey: queryKeys.merchant.store(storeSlug).detail(),
      });

      // 2. Refresh global bootstrap state to sync the store name in switcher/sidebar
      try {
        await fetchBootstrap();
      } catch (error) {
        console.error('[useUpdateStore] Failed to refresh bootstrap after store update', error);
      }

      toast.success(t('updateSuccess'));
    },
    onError: (error) => {
      toast.error(error.message || t('updateError'));
    },
  });
}
