'use client';

import { useState }        from 'react';
import { useRouter }       from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { toast }           from 'sonner';

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
import { useCan }           from '@/stores/authStore';
import { ROUTES }           from '@/config/routes';

interface Props {
  storeId:     string;
  productId:   string;
  productName: string;
}

export default function DeleteProductButton({
  storeId,
  productId,
  productName,
}: Props) {
  const t      = useTranslations('products');
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const canManageProducts = useCan('canManageProducts');

  const mutation = useDeleteProduct(storeId, productId, {
    onSuccess: () => {
      toast.success(t('form.deleteSuccess'));
      setOpen(false);
      router.push(ROUTES.store(storeId).products.list());
    },
    onError: () => {
      toast.error(t('form.deleteError'));
    },
  });

  if (!canManageProducts) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/*
       * Base UI DialogTrigger does not support asChild.
       * Use render prop to replace the trigger element entirely.
       * Base UI merges its click/keyboard handlers onto the rendered element.
       */}
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
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('loading') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
