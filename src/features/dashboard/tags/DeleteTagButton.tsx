'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDeleteTag } from '@/hooks/tags/useDeleteTag';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface Props { storeId: string; tagId: string }

export function DeleteTagButton({ storeId, tagId }: Props) {
  const t             = useTranslations('tags');
  const [open, setOpen] = useState(false);
  const deleteMutation  = useDeleteTag(storeId, tagId);

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
              onClick={() => { deleteMutation.mutate(); setOpen(false); }}
            >
              {deleteMutation.isPending ? t('form.deleting') : t('form.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
