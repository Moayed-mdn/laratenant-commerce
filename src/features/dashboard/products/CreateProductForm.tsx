'use client';
// Reason: wizard with client state + mutations

/**
 * Create product page entry point.
 *
 * Thin wrapper — wires CreateProductWizard to:
 * - storeId from page props
 * - available locales (defaults to ['en', 'ar'] matching the app config)
 * - onSuccess redirect to the edit page
 */

import { useRouter } from '@/lib/navigation';
import { ROUTES } from '@/config/routes';
import { CreateProductWizard } from '@/features/products/creation/CreateProductWizard';

interface Props {
  storeId: string;
}

// Locales supported by the admin editor.
// Must match config('content.editable_locales') on the backend.
const EDITOR_LOCALES = ['en', 'ar'];

export default function CreateProductForm({ storeId }: Props) {
  const router = useRouter();

  return (
    <CreateProductWizard
      storeId={storeId}
      availableLocales={EDITOR_LOCALES}
      onSuccess={(productId) => {
        router.push(ROUTES.store(storeId).products.edit(String(productId)));
      }}
    />
  );
}
