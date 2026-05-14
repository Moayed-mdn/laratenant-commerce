'use client';

/**
 * Hook for creating a new brand.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/lib/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { createBrand } from '@/lib/api/brands';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/config/routes';
import { logger } from '@/lib/logger';
import type { CreateBrandPayload } from '@/types/brand';
import type { ApiError } from '@/types/api';

export function useCreateBrand(storeId: string) {
  const queryClient = useQueryClient();
  const router      = useRouter();
  const t           = useTranslations('brands');

  return useMutation<unknown, ApiError, CreateBrandPayload>({
    mutationFn: (payload) => createBrand(storeId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.brands(storeId).lists(),
      });
      toast.success(t('form.createSuccess'));
      router.push(ROUTES.store(storeId).brands.list());
    },

    onError: (error) => {
      logger.error('Failed to create brand', { error });
      toast.error(error.message ?? t('form.createError'));
    },
  });
}
