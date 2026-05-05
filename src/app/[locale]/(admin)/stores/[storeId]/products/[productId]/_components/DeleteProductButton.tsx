'use client';

/**
 * Delete product button with confirmation dialog.
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
import { useDeleteProduct } from '@/hooks/products/useDeleteProduct';
import { useCan } from '@/stores/authStore';
import { ROUTES } from '@/config/routes';

interface Props {
  storeId: string;
  productId: string;
  productName: string;
}

export default function DeleteProductButton({ storeId, productId, productName }: Props) {
  const t = useTranslations('products');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [open, setOpen] = useState(false);

  const canManageProducts = useCan('canManageProducts');

  const mutation = useDeleteProduct(storeId, productId, {
    onSuccess: () => {
      toast.success(t('form.deleteSuccess'));
      setOpen(false);
      router.push(ROUTES.store(locale, storeId).products.list());
    },
    onError: () => {
      toast.error(t('form.deleteError'));
    },
  });

  if (!canManageProducts) return null;

  const handleDelete = () => {
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            {t('form.delete')}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('form.delete')}</DialogTitle>
          <DialogDescription>{t('form.deleteConfirm')}</DialogDescription>
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
