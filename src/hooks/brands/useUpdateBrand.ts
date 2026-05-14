'use client';

/**
 * Hook for updating an existing brand.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { updateBrand } from '@/lib/api/brands';
import { queryKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/logger';
import type { UpdateBrandPayload } from '@/types/brand';
import type { ApiError } from '@/types/api';

export function useUpdateBrand(storeId: string, brandId: string) {
  const queryClient = useQueryClient();
  const t           = useTranslations('brands');

  return useMutation<unknown, ApiError, UpdateBrandPayload>({
    mutationFn: (payload) => updateBrand(storeId, brandId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.brands(storeId).lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.brands(storeId).detail(brandId),
      });
      toast.success(t('form.updateSuccess'));
    },

    onError: (error) => {
      logger.error('Failed to update brand', { error });
      toast.error(error.message ?? t('form.updateError'));
    },
  });
}
