/**
 * Create new brand page.
 * Server component — thin wrapper.
 */

import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import CreateBrandForm from '@/features/dashboard/brands/CreateBrandForm';

export async function generateMetadata() {
  return {
    title:       'New Brand',
    description: 'Create a new brand',
  };
}

export default async function NewBrandPage({
  params,
}: {
  params: Promise<{ storeId: string; locale: string }>;
}) {
  const { storeId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.store(storeId).brands.list()}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-transparent px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          &larr; Back to brands
        </Link>
      </div>
      <CreateBrandForm storeId={storeId} />
    </div>
  );
}