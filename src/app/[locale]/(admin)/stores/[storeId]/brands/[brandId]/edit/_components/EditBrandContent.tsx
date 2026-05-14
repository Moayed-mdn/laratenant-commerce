'use client';

/**
 * Edit brand content.
 * Fetches brand data then renders form + delete button.
 */

import { useTranslations } from 'next-intl';
import { useBrandDetail } from '@/hooks/brands/useBrandDetail';
import { EditBrandSkeleton } from './EditBrandSkeleton';
import EditBrandForm from './EditBrandForm';
import { DeleteBrandButton } from './DeleteBrandButton';

interface Props {
  storeId: string;
  brandId: string;
}

export default function EditBrandContent({ storeId, brandId }: Props) {
  const t = useTranslations('brands');
  const { data: brand, isLoading, error } = useBrandDetail(storeId, brandId);

  if (isLoading) return <EditBrandSkeleton />;

  if (error || !brand) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('detail.error')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EditBrandForm
        storeId={storeId}
        brandId={brandId}
        brand={brand}
      />

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
        <h3 className="font-semibold text-destructive mb-1">
          {t('form.dangerZone')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {brand.deletedAt
            ? t('form.restoreDescription')
            : t('form.deleteDescription')}
        </p>
        <DeleteBrandButton
          storeId={storeId}
          brandId={brandId}
          isDeleted={Boolean(brand.deletedAt)}
        />
      </div>
    </div>
  );
}
