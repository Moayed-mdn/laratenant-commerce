'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Merchant Workspace — Brand View Page (Redirects to Edit).
 * Canonical route: /merchant/brands/[id]
 * 
 * This page redirects to the edit page since we don't have a separate view mode.
 */
export default function MerchantBrandViewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations();
  const brandId = params.id;

  useEffect(() => {
    // Redirect to edit page
    router.replace(`/merchant/brands/${brandId}/edit`);
  }, [brandId, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-muted-foreground">{t('redirecting')}</p>
    </div>
  );
}
