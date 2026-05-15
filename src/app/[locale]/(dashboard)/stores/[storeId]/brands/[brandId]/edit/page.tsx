/**
 * Edit brand page.
 * Server component — thin wrapper with Suspense.
 */

import { Suspense } from 'react';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import EditBrandContent from '@/features/dashboard/brands/EditBrandContent';
import { EditBrandSkeleton } from '@/features/dashboard/brands/EditBrandSkeleton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;
  return {
    title:       `Edit Brand ${brandId}`,
    description: 'Update brand details',
  };
}

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ storeId: string; brandId: string; locale: string }>;
}) {
  const { storeId, brandId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.store(storeId).brands.list()}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          &larr; Back to brands
        </Link>
      </div>
      <Suspense fallback={<EditBrandSkeleton />}>
        <EditBrandContent storeId={storeId} brandId={brandId} />
      </Suspense>
    </div>
  );
}