/**
 * Hook for updating user avatar.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { updateAvatar } from '@/lib/api/profile';
import type { ApiError } from '@/types/api';
import { toast } from 'sonner';
import { useBootstrapStore } from '@/stores/bootstrapStore';

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const fetchBootstrap = useBootstrapStore((state) => state.fetchBootstrap);
  const t = useTranslations('profile');

  return useMutation<unknown, ApiError, File>({
    mutationFn: (file: File) => updateAvatar(file),
    onSuccess: async () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
      
      // Force refetch bootstrap to update avatar immediately
      await fetchBootstrap();
      
      toast.success(t('avatarUpdateSuccess'));
    },
    onError: (error) => {
      toast.error(error.message || t('avatarUpdateError'));
    },
  });
}
