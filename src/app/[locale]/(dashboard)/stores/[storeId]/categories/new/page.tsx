/**
 * Create new category page.
 * Server component — thin wrapper.
 */

import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import CreateCategoryForm from '@/features/dashboard/categories/CreateCategoryForm';

export async function generateMetadata() {
  return {
    title:       'New Category',
    description: 'Create a new category',
  };
}

export default async function NewCategoryPage({
  params,
}: {
  params: Promise<{ storeId: string; locale: string }>;
}) {
  const { storeId } = await params;

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
      <CreateCategoryForm storeId={storeId} />
    </div>
  );
}