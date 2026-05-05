'use client';
// Reason: form with RHF + mutations

/**
 * Create product form component.
 * Uses shared ProductForm with create mode.
 */

import { useRouter } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useCreateProduct } from '@/hooks/products/useCreateProduct';
import { ROUTES } from '@/config/routes';
import ProductForm from '@/components/shared/ProductForm';
import type { ProductFormData } from '@/schemas/products';

interface Props {
  storeId: string;
}

export default function CreateProductForm({ storeId }: Props) {
  const t = useTranslations('products');
  const router = useRouter();

  const mutation = useCreateProduct(storeId, {
    onSuccess: (product) => {
      toast.success(t('form.createSuccess'));
      router.push(ROUTES.store(storeId).products.edit(String(product.id)));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (data: ProductFormData) => {
    mutation.mutate({
      name: data.name,
      description: data.description,
      price: data.price,
      compare_at_price: data.compare_at_price,
      cost_per_item: data.cost_per_item,
      sku: data.sku,
      barcode: data.barcode,
      quantity: data.quantity,
      track_quantity: data.track_quantity,
      weight: data.weight,
      weight_unit: data.weight_unit,
      status: data.status,
    });
  };

  return (
    <ProductForm
      mode="create"
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      storeId={storeId}
    />
  );
}
