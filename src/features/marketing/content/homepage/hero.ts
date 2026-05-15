// =============================================================================
// Homepage — Hero Content
//
// Structural and non-translatable content for the hero section.
// Translatable strings (headline, subtext, cta labels) come from i18n.
// This file owns: preview alt, badge key, CTA hrefs.
//
// Page wiring pattern:
//   const t = await getTranslations('marketing')
//   const hero = getHeroContent(t)
//   <HeroSection {...hero} />
// =============================================================================

import {
  CTA_START_SELLING,
  CTA_VIEW_DEMO,
} from '@/features/marketing/constants/cta-links'
import type { HeroContent } from '@/features/marketing/types'

export function getHeroContent(
  t: (key: string) => string,
): HeroContent {
  return {
    badge: t('home.hero.badge'),
    headline: t('home.hero.headline'),
    subtext: t('home.hero.subtext'),
    primaryCta: {
      label: t('home.hero.primaryCta'),
      href: CTA_START_SELLING.href,
    },
    secondaryCta: {
      label: t('home.hero.secondaryCta'),
      href: CTA_VIEW_DEMO.href,
    },
    previewAlt: t('home.hero.previewAlt'),
  }
}
