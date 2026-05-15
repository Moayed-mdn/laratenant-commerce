// =============================================================================
// Enterprise Page — Reserved
// Populate when /enterprise marketing page is built.
// =============================================================================

import { getTranslations, getLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/features/marketing/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketing')
  const locale = await getLocale()
  return buildPageMetadata({
    locale,
    title: t('meta.enterprise.title'),
    description: t('meta.enterprise.description'),
    path: '/enterprise',
  })
}

export default async function EnterprisePage() {
  const locale = await getLocale()
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">
        Coming soon — /{locale}/enterprise
      </p>
    </div>
  )
}
