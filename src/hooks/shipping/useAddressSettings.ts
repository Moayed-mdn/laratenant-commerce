/**
 * React Query hooks for store address settings.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { ApiError } from '@/types/api';
import type {
  StoreAddressSetting,
  UpdateStoreAddressSettingsPayload,
} from '@/types/shipping';
import {
  getAddressSettings,
  updateAddressSettings,
} from '@/lib/api/shipping';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Fetch store address settings.
 */
export function useAddressSettings(storeSlug: string) {
  return useQuery({
    queryKey: queryKeys.shipping.addressSettings(storeSlug).detail(),
    queryFn: () => getAddressSettings(storeSlug),
    enabled: !!storeSlug,
  });
}

/**
 * Update store address settings.
 */
export function useUpdateAddressSettings(storeSlug: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('shipping.addressSettings');

  return useMutation<StoreAddressSetting, ApiError, UpdateStoreAddressSettingsPayload>({
    mutationFn: (payload) => updateAddressSettings(storeSlug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shipping.addressSettings(storeSlug).all() });
      toast.success(t('updateSuccess'));
    },
    onError: (error) => {
      logger.error('Failed to update address settings', error);
      toast.error(error.message || t('updateError'));
    },
  });
}
