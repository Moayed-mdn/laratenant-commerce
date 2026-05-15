// =============================================================================
// Homepage — Dashboard Showcase Content
//
// Content for the DashboardShowcaseSection split layout.
// Translatable strings come from i18n via page-level wiring.
// previewSrc is undefined until a real screenshot asset is provided.
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const showcase = getShowcaseContent(t)
//   <DashboardShowcaseSection {...showcase} />
// =============================================================================

import { CTA_START_SELLING } from '@/features/marketing/constants/cta-links'
import type { ShowcaseContent } from '@/features/marketing/types'

export function getShowcaseContent(
  t: (key: string) => string,
): ShowcaseContent {
  return {
    heading: t('home.showcase.heading'),
    subtext: t('home.showcase.subtext'),
    cta: {
      label: t('home.showcase.cta'),
      href: CTA_START_SELLING.href,
    },
    previewAlt: t('home.showcase.previewAlt'),
    // previewSrc: '/images/dashboard-screenshot.png',
    // Uncomment and set when real asset is available.
    // DashboardPreview renders coded mockup when undefined.
  }
}
