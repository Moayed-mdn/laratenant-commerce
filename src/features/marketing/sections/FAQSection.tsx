// =============================================================================
// FAQSection
//
// Accordion FAQ section. Shell is Server Component.
// FAQAccordion is a Client Component boundary — isolated to open/close state.
//
// Rules:
//   - FAQ content is server-rendered — visible to crawlers for SEO
//   - JSON-LD structured data injected at page level (not here)
//   - accordion open/close state is local client state — no URL needed
//   - heading from props (translated at page level)
//   - items from props (wired from content/*/faqs.ts)
// =============================================================================

import { cn } from '@/lib/utils'
import SectionContainer from '@/features/marketing/layouts/SectionContainer'
import SectionHeading from '@/features/marketing/components/SectionHeading'
import FAQAccordion from '@/features/marketing/sections/FAQAccordion'
import type { FAQItem } from '@/features/marketing/types'

interface FAQSectionProps {
  heading: string
  eyebrow?: string
  items: FAQItem[]
}

export default function FAQSection({
  heading,
  eyebrow,
  items,
}: FAQSectionProps) {
  return (
    <section
      aria-labelledby="faq-heading"
      className="w-full py-20 sm:py-28"
    >
      <SectionContainer>
        <div
          className={cn(
            'mx-auto max-w-3xl',
          )}
        >
          {/* Section heading */}
          <SectionHeading
            as="h2"
            heading={heading}
            eyebrow={eyebrow}
            align="center"
          />

          {/* Accordion — Client Component boundary */}
          <div className="mt-12">
            <FAQAccordion items={items} />
          </div>
        </div>
      </SectionContainer>
    </section>
  )
}
