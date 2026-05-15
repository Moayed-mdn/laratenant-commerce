// =============================================================================
// Homepage — FAQ Content
//
// FAQ items for the homepage FAQSection.
// Translatable strings come from i18n via page-level wiring.
// IDs are stable — used as accordion keys and JSON-LD entity identifiers.
//
// Page wiring pattern:
//   const t = await getTranslations({ locale, namespace: 'marketing' })
//   const faqs = getHomepageFAQs(t)
//   <FAQSection
//     heading={t('home.faq.heading')}
//     items={faqs}
//   />
//   <script
//     type="application/ld+json"
//     dangerouslySetInnerHTML={{ __html: buildFAQJsonLd(faqs) }}
//   />
// =============================================================================

import type { FAQItem } from '@/features/marketing/types'

const FAQ_IDS = [
  'what-is-laratenant',
  'multi-store-support',
  'localization-support',
  'how-to-get-started',
  'enterprise-options',
  'data-security',
] as const

export function getHomepageFAQs(
  t: (key: string) => string,
): FAQItem[] {
  return FAQ_IDS.map((id) => ({
    id,
    question: t(`home.faq.items.${id}.question`),
    answer: t(`home.faq.items.${id}.answer`),
  }))
}
