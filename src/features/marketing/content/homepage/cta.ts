// =============================================================================
// Homepage — Final CTA Content
//
// Content for the closing CTASection.
// Translatable strings come from i18n via page-level wiring.
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const cta = getHomepageCTA(t)
//   <CTASection {...cta} />
// =============================================================================

import {
  CTA_START_SELLING,
  CTA_VIEW_DEMO,
} from '@/features/marketing/constants/cta-links'
import type { CTAContent } from '@/features/marketing/types'

export function getHomepageCTA(
  t: (key: string) => string,
): CTAContent {
  return {
    title: t('home.cta.title'),
    description: t('home.cta.description'),
    primaryCta: {
      label: t('home.cta.primaryCta'),
      href: CTA_START_SELLING.href,
    },
    secondaryCta: {
      label: t('home.cta.secondaryCta'),
      href: CTA_VIEW_DEMO.href,
    },
  }
}
