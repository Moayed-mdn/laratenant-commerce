'use client';

/**
 * Hook for restoring a soft-deleted category.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { restoreCategory } from '@/lib/api/categories';
import { queryKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/logger';
import type { ApiError } from '@/types/api';

export function useRestoreCategory(storeId: string, categoryId: string) {
  const queryClient = useQueryClient();
  const t           = useTranslations('categories');

  return useMutation<unknown, ApiError, void>({
    mutationFn: () => restoreCategory(storeId, categoryId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(storeId).lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories(storeId).detail(categoryId),
      });
      toast.success(t('form.restoreSuccess'));
    },

    onError: (error) => {
      logger.error('Failed to restore category', { error });
      toast.error(error.message ?? t('form.restoreError'));
    },
  });
}
