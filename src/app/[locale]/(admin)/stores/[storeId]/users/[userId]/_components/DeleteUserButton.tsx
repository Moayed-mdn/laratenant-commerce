'use client';

/**
 * Delete user button with confirmation dialog.
 * Client component that uses the delete mutation hook.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDeleteUser } from '@/hooks/users/useDeleteUser';
import { useAuthStore, selectCan } from '@/stores/authStore';

interface Props {
  storeId: string;
  userId: string;
  userName: string;
}

export default function DeleteUserButton({ storeId, userId, userName }: Props) {
  const t = useTranslations('users');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  
  // Permission check
  const can = useAuthStore(selectCan);
  if (!can('canManageUsers')) return null;

  const mutation = useDeleteUser(storeId, {
    onSuccess: () => {
      toast.success(t('detail.deleteSuccess'));
      setOpen(false);
      router.push(`/stores/${storeId}/users`);
    },
    onError: () => {
      toast.error(t('detail.deleteError'));
    },
  });

  const handleDelete = () => {
    mutation.mutate(userId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        {t('detail.delete')}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('detail.delete')}</DialogTitle>
          <DialogDescription>
            {t('detail.deleteConfirm')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('loading') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
