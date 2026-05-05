'use client';

/**
 * Delete user button with confirmation dialog.
 * Client component that uses the delete mutation hook.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
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
import { useCan } from '@/stores/authStore';
import { ROUTES } from '@/config/routes';

interface Props {
  storeId: string;
  userId: string;
  userName: string;
}

export default function DeleteUserButton({ storeId, userId, userName }: Props) {
  const t = useTranslations('users');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [open, setOpen] = useState(false);

  // Permission check - must be after all hooks
  const canManageUsers = useCan('canManageUsers');

  // Always call useDeleteUser to maintain hook order, disable when no permission
  const mutation = useDeleteUser(storeId, {
    onSuccess: () => {
      toast.success(t('detail.deleteSuccess'));
      setOpen(false);
      router.push(ROUTES.store(locale, storeId).users.list());
    },
    onError: () => {
      toast.error(t('detail.deleteError'));
    },
  });

  // Early return after all hooks are called
  if (!canManageUsers) return null;

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
