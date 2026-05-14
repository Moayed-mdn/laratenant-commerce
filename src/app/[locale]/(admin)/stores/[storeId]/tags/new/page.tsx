import { Link } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import CreateTagForm from './_components/CreateTagForm';

export async function generateMetadata() {
  return { title: 'New Tag', description: 'Create a new tag' };
}

export default async function NewTagPage({
  params,
}: {
  params: Promise<{ storeId: string; locale: string }>;
}) {
  const { storeId } = await params;

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
      <CreateTagForm storeId={storeId} />
    </div>
  );
}
