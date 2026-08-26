/**
 * Hook for updating user password.
 */

import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { updatePassword } from '@/lib/api/profile';
import type { UpdatePasswordPayload } from '@/lib/api/profile';
import type { ApiError } from '@/types/api';
import { toast } from 'sonner';

export function useUpdatePassword() {
  const t = useTranslations('profile');
  return useMutation<unknown, ApiError, UpdatePasswordPayload>({
    mutationFn: (payload: UpdatePasswordPayload) => updatePassword(payload),
    onSuccess: () => {
      toast.success(t('passwordUpdateSuccess'));
    },
    onError: (error) => {
      toast.error(error.message || t('passwordUpdateError'));
    },
  });
}
