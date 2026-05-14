'use client';

/**
 * Edit category content.
 * Fetches category data then renders the form + delete button.
 */

import { useTranslations } from 'next-intl';
import { useCategoryDetail } from '@/hooks/categories/useCategoryDetail';
import { EditCategorySkeleton } from './EditCategorySkeleton';
import EditCategoryForm from './EditCategoryForm';
import { DeleteCategoryButton } from './DeleteCategoryButton';

interface Props {
  storeId:    string;
  categoryId: string;
}

export default function EditCategoryContent({ storeId, categoryId }: Props) {
  const t = useTranslations('categories');
  const { data: category, isLoading, error } = useCategoryDetail(storeId, categoryId);

  if (isLoading) return <EditCategorySkeleton />;

  if (error || !category) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('detail.error')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EditCategoryForm
        storeId={storeId}
        categoryId={categoryId}
        category={category}
      />

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
        <h3 className="font-semibold text-destructive mb-1">
          {t('form.dangerZone')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {category.deletedAt
            ? t('form.restoreDescription')
            : t('form.deleteDescription')}
        </p>
        <DeleteCategoryButton
          storeId={storeId}
          categoryId={categoryId}
          isDeleted={Boolean(category.deletedAt)}
        />
      </div>
    </div>
  );
}
