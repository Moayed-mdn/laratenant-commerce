/**
 * Hook for updating user profile information.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { updateProfileInfo } from '@/lib/api/profile';
import type { UpdateProfileInfoPayload } from '@/lib/api/profile';
import type { ApiError } from '@/types/api';
import { toast } from 'sonner';
import { useBootstrapStore } from '@/stores/bootstrapStore';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const fetchBootstrap = useBootstrapStore((state) => state.fetchBootstrap);
  const t = useTranslations('profile');

  return useMutation<unknown, ApiError, UpdateProfileInfoPayload>({
    mutationFn: (payload: UpdateProfileInfoPayload) => updateProfileInfo(payload),
    onSuccess: async () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['bootstrap'] });
      
      // Force refetch bootstrap to update user info immediately
      await fetchBootstrap();
      
      toast.success(t('profileUpdateSuccess'));
    },
    onError: (error) => {
      toast.error(error.message || t('profileUpdateError'));
    },
  });
}
