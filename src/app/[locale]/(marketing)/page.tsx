// =============================================================================
// Homepage — Marketing Route
//
// Thin page orchestrator. Owns:
//   - generateMetadata (SEO)
//   - content wiring (content/* → section props)
//   - section composition in canonical order
//
// Rules:
//   - no business logic
//   - no inline content — all strings from i18n or content files
//   - sections receive typed props only
//   - JSON-LD structured data injected server-side here
//   - all content resolvers accept translator function — CMS-swap ready
// =============================================================================

import { getTranslations, getLocale } from 'next-intl/server'
import type { Metadata } from 'next'

import { buildPageMetadata, buildFAQJsonLd, buildSoftwareJsonLd } from '@/features/marketing/lib/seo'

import { getHeroContent }       from '@/features/marketing/content/homepage/hero'
import { getFeatureItems }      from '@/features/marketing/content/homepage/features'
import { getShowcaseContent }   from '@/features/marketing/content/homepage/showcase'
import { getTestimonials }      from '@/features/marketing/content/homepage/testimonials'
import { getLogoItems }         from '@/features/marketing/content/homepage/logos'
import { getHomepageFAQs }      from '@/features/marketing/content/homepage/faqs'
import { getHomepageCTA }       from '@/features/marketing/content/homepage/cta'
import { getPricingPlans }      from '@/features/marketing/content/pricing/plans'

import HeroSection               from '@/features/marketing/sections/HeroSection'
import LogoCloudSection          from '@/features/marketing/sections/LogoCloudSection'
import FeatureGridSection        from '@/features/marketing/sections/FeatureGridSection'
import DashboardShowcaseSection  from '@/features/marketing/sections/DashboardShowcaseSection'
import TestimonialsSection       from '@/features/marketing/sections/TestimonialsSection'
import PricingSection            from '@/features/marketing/sections/PricingSection'
import FAQSection                from '@/features/marketing/sections/FAQSection'
import CTASection                from '@/features/marketing/sections/CTASection'

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketing')
  const locale = await getLocale()

  return buildPageMetadata({
    locale,
    title: t('meta.home.title'),
    description: t('meta.home.description'),
    path: '',
  })
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function HomePage() {
  const t = await getTranslations('marketing')

  // Wire content resolvers — each accepts translator, returns typed content.
  // To integrate a CMS: replace these calls with CMS resolver calls.
  // Section props interfaces do not change.
  const hero        = getHeroContent(t)
  const features    = getFeatureItems(t)
  const showcase    = getShowcaseContent(t)
  const testimonials = getTestimonials(t)
  const logos       = getLogoItems()
  const faqs        = getHomepageFAQs(t)
  const cta         = getHomepageCTA(t)
  const plans       = getPricingPlans(t)

  return (
    <>
      {/* Structured data — server-rendered, zero JS cost */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildSoftwareJsonLd() }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildFAQJsonLd(faqs) }}
      />

      {/* Section composition — canonical order */}
      <HeroSection
        {...hero}
      />

      <LogoCloudSection
        items={logos}
        label={t('home.logos.label')}
      />

      <FeatureGridSection
        heading={t('home.features.heading')}
        eyebrow={t('home.features.eyebrow')}
        subtitle={t('home.features.subtitle')}
        items={features}
      />

      <DashboardShowcaseSection
        {...showcase}
      />

      <TestimonialsSection
        heading={t('home.testimonials.heading')}
        eyebrow={t('home.testimonials.eyebrow')}
        items={testimonials}
      />

      <PricingSection
        heading={t('home.pricing.heading')}
        eyebrow={t('home.pricing.eyebrow')}
        subtitle={t('home.pricing.subtitle')}
        plans={plans}
        toggleLabel={{
          monthly: t('pricing.toggle.monthly'),
          annual:  t('pricing.toggle.annual'),
          badge:   t('pricing.toggle.badge'),
        }}
      />

      <FAQSection
        heading={t('home.faq.heading')}
        eyebrow={t('home.faq.eyebrow')}
        items={faqs}
      />

      <CTASection
        {...cta}
      />
    </>
  )
}
