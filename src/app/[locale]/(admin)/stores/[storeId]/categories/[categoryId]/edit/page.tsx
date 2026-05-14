/**
 * Edit category page.
 * Server component — thin wrapper with Suspense.
 */

import { Suspense } from 'react';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import EditCategoryContent from './_components/EditCategoryContent';
import { EditCategorySkeleton } from './_components/EditCategorySkeleton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  return {
    title:       `Edit Category ${categoryId}`,
    description: 'Update category details',
  };
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ storeId: string; categoryId: string; locale: string }>;
}) {
  const { storeId, categoryId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.store(storeId).categories.list()}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent hover:bg-muted hover:text-foreground h-7 gap-1 px-2.5 text-[0.8rem] font-medium transition-all"
        >
          &larr; Back to categories
        </Link>
      </div>
      <Suspense fallback={<EditCategorySkeleton />}>
        <EditCategoryContent storeId={storeId} categoryId={categoryId} />
      </Suspense>
    </div>
  );
}