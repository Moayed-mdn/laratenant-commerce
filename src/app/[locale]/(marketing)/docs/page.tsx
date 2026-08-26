import { getLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { buildMetadataFromSeo } from '@/lib/seo/cms-seo'
import { cmsService } from '@/services/cms/cms.service'
import { JsonLd } from '@/components/cms/JsonLd'
import { CmsSectionRenderer } from '@/components/cms/CmsSectionRenderer'

// Force dynamic rendering since CMS content should be fresh
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  try {
    const page = await cmsService.getPage('docs')
    return buildMetadataFromSeo(page.seo, locale)
  } catch (error) {
    return {
      title: 'Documentation | LaraTenant Commerce',
      description: 'Platform documentation and guides',
    }
  }
}

export default async function DocsRootPage() {
  let cmsPage = null
  try {
    cmsPage = await cmsService.getPage('docs')
  } catch (error) {
    console.error('Failed to fetch docs page from CMS', error)
    notFound()
  }

  return (
    <>
      {cmsPage?.seo?.structured_data && (
        <JsonLd data={cmsPage.seo.structured_data} />
      )}
      
      {/* CMS sections for Hero, Categories, etc. (Excluding CTA which goes to bottom) */}
      <CmsSectionRenderer sections={cmsPage?.sections} exclude={['cta']} />
      
      {/* Final CTA from CMS at the bottom */}
      <CmsSectionRenderer sections={cmsPage?.sections} includeOnly={['cta']} />
    </>
  )
}
