import { Suspense } from 'react';
import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import EditTagContent from './_components/EditTagContent';
import { EditTagSkeleton } from './_components/EditTagSkeleton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tagId: string }>;
}) {
  const { tagId } = await params;
  return { title: `Edit Tag ${tagId}`, description: 'Update tag details' };
}

export default async function EditTagPage({
  params,
}: {
  params: Promise<{ storeId: string; tagId: string; locale: string }>;
}) {
  const { storeId, tagId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.store(storeId).tags.list()}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          &larr; Back to tags
        </Link>
      </div>
      <Suspense fallback={<EditTagSkeleton />}>
        <EditTagContent storeId={storeId} tagId={tagId} />
      </Suspense>
    </div>
  );
}
