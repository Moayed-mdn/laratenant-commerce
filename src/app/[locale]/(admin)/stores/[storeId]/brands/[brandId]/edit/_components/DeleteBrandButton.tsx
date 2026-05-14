'use client';

/**
 * Delete (soft) brand button with confirmation dialog.
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDeleteBrand } from '@/hooks/brands/useDeleteBrand';
import { useRestoreBrand } from '@/hooks/brands/useRestoreBrand';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  storeId:   string;
  brandId:   string;
  isDeleted: boolean;
}

export function DeleteBrandButton({ storeId, brandId, isDeleted }: Props) {
  const t       = useTranslations('brands');
  const [open, setOpen] = useState(false);

  const deleteMutation  = useDeleteBrand(storeId, brandId);
  const restoreMutation = useRestoreBrand(storeId, brandId);

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
      <Button variant="destructive" onClick={() => setOpen(true)}>
        {t('form.delete')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('form.deleteTitle')}</DialogTitle>
            <DialogDescription>{t('form.deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
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
