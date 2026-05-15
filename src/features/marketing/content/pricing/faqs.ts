// =============================================================================
// Pricing — FAQ Content
//
// FAQ items specific to the /pricing page.
// Separate from homepage FAQs — different questions, different JSON-LD scope.
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const faqs = getPricingFAQs(t)
//   <FAQSection
//     heading={t('pricing.faq.heading')}
//     items={faqs}
//   />
//   <script
//     type="application/ld+json"
//     dangerouslySetInnerHTML={{ __html: buildFAQJsonLd(faqs) }}
//   />
// =============================================================================

import type { FAQItem } from '@/features/marketing/types'

const PRICING_FAQ_IDS = [
  'free-trial',
  'change-plan',
  'annual-discount',
  'cancel-anytime',
  'payment-methods',
  'enterprise-custom',
] as const

export function getPricingFAQs(
  t: (key: string) => string,
): FAQItem[] {
  return PRICING_FAQ_IDS.map((id) => ({
    id,
    question: t(`pricing.faq.items.${id}.question`),
    answer: t(`pricing.faq.items.${id}.answer`),
  }))
}
