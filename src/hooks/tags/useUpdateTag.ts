'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { updateTag } from '@/lib/api/tags';
import { queryKeys } from '@/lib/queryKeys';
import { logger } from '@/lib/logger';
import type { UpdateTagPayload } from '@/types/tag';
import type { ApiError } from '@/types/api';

export function useUpdateTag(storeId: string, tagId: string) {
  const queryClient = useQueryClient();
  const t           = useTranslations('tags');

  return useMutation<unknown, ApiError, UpdateTagPayload>({
    mutationFn: (payload) => updateTag(storeId, tagId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags(storeId).lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tags(storeId).detail(tagId) });
      toast.success(t('form.updateSuccess'));
    },

    onError: (error) => {
      logger.error('Failed to update tag', { error });
      toast.error(error.message ?? t('form.updateError'));
    },
  });
}
