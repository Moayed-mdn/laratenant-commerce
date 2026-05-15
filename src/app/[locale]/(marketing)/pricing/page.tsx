// =============================================================================
// Pricing Page — Marketing Route
//
// Dedicated pricing page. Owns its own metadata, content wiring,
// and section composition. Reuses PricingSection and FAQSection.
//
// Rules:
//   - thin orchestrator — no business logic
//   - pricing FAQs are separate from homepage FAQs (different questions)
//   - JSON-LD FAQPage schema scoped to pricing FAQs only
//   - CTA section is reusable with pricing-specific copy
// =============================================================================

import { getTranslations, getLocale } from 'next-intl/server'
import type { Metadata } from 'next'

import { buildPageMetadata, buildFAQJsonLd } from '@/features/marketing/lib/seo'

import { getPricingPlans } from '@/features/marketing/content/pricing/plans'
import { getPricingFAQs }  from '@/features/marketing/content/pricing/faqs'

import PricingSection from '@/features/marketing/sections/PricingSection'
import FAQSection     from '@/features/marketing/sections/FAQSection'
import CTASection     from '@/features/marketing/sections/CTASection'

import {
  CTA_START_SELLING,
  CTA_CONTACT_SALES,
} from '@/features/marketing/constants/cta-links'

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketing')
  const locale = await getLocale()

  return buildPageMetadata({
    locale,
    title: t('meta.pricing.title'),
    description: t('meta.pricing.description'),
    path: '/pricing',
  })
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function PricingPage() {
  const t = await getTranslations('marketing')

  const plans = getPricingPlans(t)
  const faqs  = getPricingFAQs(t)

  return (
    <>
      {/* Pricing-scoped FAQ structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildFAQJsonLd(faqs) }}
      />

      <PricingSection
        heading={t('pricing.heading')}
        eyebrow={t('pricing.eyebrow')}
        subtitle={t('pricing.subtitle')}
        plans={plans}
        toggleLabel={{
          monthly: t('pricing.toggle.monthly'),
          annual:  t('pricing.toggle.annual'),
          badge:   t('pricing.toggle.badge'),
        }}
      />

      <FAQSection
        heading={t('pricing.faq.heading')}
        eyebrow={t('pricing.faq.eyebrow')}
        items={faqs}
      />

      <CTASection
        title={t('pricing.cta.title')}
        description={t('pricing.cta.description')}
        primaryCta={{
          label: t('pricing.cta.primaryCta'),
          href: CTA_START_SELLING.href,
        }}
        secondaryCta={{
          label: t('pricing.cta.secondaryCta'),
          href: CTA_CONTACT_SALES.href,
        }}
      />
    </>
  )
}
