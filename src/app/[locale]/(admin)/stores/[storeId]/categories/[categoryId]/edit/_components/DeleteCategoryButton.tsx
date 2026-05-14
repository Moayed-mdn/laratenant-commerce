'use client';

/**
 * Delete (soft) category button with confirmation dialog.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDeleteCategory } from '@/hooks/categories/useDeleteCategory';
import { useRestoreCategory } from '@/hooks/categories/useRestoreCategory';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface Props {
  storeId:    string;
  categoryId: string;
  isDeleted:  boolean;
}

export function DeleteCategoryButton({ storeId, categoryId, isDeleted }: Props) {
  const t       = useTranslations('categories');
  const [open, setOpen] = useState(false);

  const deleteMutation  = useDeleteCategory(storeId, categoryId);
  const restoreMutation = useRestoreCategory(storeId, categoryId);

  if (isDeleted) {
    return (
      <Button
        variant="outline"
        onClick={() => restoreMutation.mutate()}
        disabled={restoreMutation.isPending}
      >
        {restoreMutation.isPending
          ? t('form.restoring')
          : t('form.restore')}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
      >
        {t('form.delete')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('form.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('form.deleteConfirm')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t('form.cancel')}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                deleteMutation.mutate();
                setOpen(false);
              }}
            >
              {deleteMutation.isPending
                ? t('form.deleting')
                : t('form.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
