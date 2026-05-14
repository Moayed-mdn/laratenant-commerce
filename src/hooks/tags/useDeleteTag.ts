'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/lib/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { deleteTag } from '@/lib/api/tags';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/config/routes';
import { logger } from '@/lib/logger';
import type { ApiError } from '@/types/api';

export function useDeleteTag(storeId: string, tagId: string) {
  const queryClient = useQueryClient();
  const router      = useRouter();
  const t           = useTranslations('tags');

  return useMutation<void, ApiError, void>({
    mutationFn: () => deleteTag(storeId, tagId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags(storeId).lists() });
      queryClient.removeQueries({ queryKey: queryKeys.tags(storeId).detail(tagId) });
      toast.success(t('form.deleteSuccess'));
      router.push(ROUTES.store(storeId).tags.list());
    },

    onError: (error) => {
      logger.error('Failed to delete tag', { error });
      toast.error(error.message ?? t('form.deleteError'));
    },
  });
}
