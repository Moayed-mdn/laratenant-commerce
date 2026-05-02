'use client';
// Reason: form with RHF + mutations

/**
 * Edit product form component.
 * Uses shared ProductForm with edit mode.
 */

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useUpdateProduct } from '@/hooks/products/useUpdateProduct';
import ProductForm from '@/components/shared/ProductForm';
import DeleteProductButton from './DeleteProductButton';
import type { ProductDetailView } from '@/types/product';
import type { ProductFormData } from '@/schemas/products';

interface Props {
  product: ProductDetailView;
  storeId: string;
}

export default function EditProductForm({ product, storeId }: Props) {
  const t = useTranslations('products');

  const mutation = useUpdateProduct(storeId, String(product.id), {
    onSuccess: () => {
      toast.success(t('form.updateSuccess'));
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
    <div className="space-y-6">
      <ProductForm
        mode="edit"
        initialData={product}
        onSubmit={handleSubmit}
        isPending={mutation.isPending}
        storeId={storeId}
      />
      <div className="flex justify-end">
        <DeleteProductButton
          storeId={storeId}
          productId={String(product.id)}
          productName={product.name}
        />
      </div>
    </div>
  );
}
