'use client';

/**
 * Hook for updating an existing category.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { updateCategory } from '@/lib/api/categories';
import { queryKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/logger';
import type { UpdateCategoryPayload } from '@/types/category';
import type { ApiError } from '@/types/api';

export function useUpdateCategory(storeId: string, categoryId: string) {
  const queryClient = useQueryClient();
  const t           = useTranslations('categories');

  return useMutation<unknown, ApiError, UpdateCategoryPayload>({
    mutationFn: (payload) => updateCategory(storeId, categoryId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(storeId).lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(storeId).detail(categoryId),
      });
      toast.success(t('form.updateSuccess'));
    },

    onError: (error) => {
      logger.error('Failed to update category', { error });
      toast.error(error.message ?? t('form.updateError'));
    },
  });
}
