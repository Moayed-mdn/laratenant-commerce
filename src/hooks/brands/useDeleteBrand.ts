'use client';

/**
 * Hook for soft-deleting a brand.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/lib/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { deleteBrand } from '@/lib/api/brands';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/config/routes';
import { logger } from '@/lib/logger';
import type { ApiError } from '@/types/api';

export function useDeleteBrand(storeId: string, brandId: string) {
  const queryClient = useQueryClient();
  const router      = useRouter();
  const t           = useTranslations('brands');

  return useMutation<void, ApiError, void>({
    mutationFn: () => deleteBrand(storeId, brandId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.brands(storeId).lists(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.brands(storeId).detail(brandId),
      });
      toast.success(t('form.deleteSuccess'));
      router.push(ROUTES.store(storeId).brands.list());
    },

    onError: (error) => {
      logger.error('Failed to delete brand', { error });
      toast.error(error.message ?? t('form.deleteError'));
    },
  });
}
