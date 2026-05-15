// =============================================================================
// Templates Page — Reserved
// Populate when /templates marketing page is built.
// =============================================================================

import { getTranslations, getLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/features/marketing/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketing')
  const locale = await getLocale()
  return buildPageMetadata({
    locale,
    title: t('meta.templates.title'),
    description: t('meta.templates.description'),
    path: '/templates',
  })
}

export default async function TemplatesPage() {
  const locale = await getLocale()
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">
        Coming soon — /{locale}/templates
      </p>
    </div>
  )
}
