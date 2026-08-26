// =============================================================================
// FeatureGridSection
//
// Responsive grid of FeatureCard items.
// Server Component — purely presentational.
//
// Rules:
//   - heading and subtitle come from props (translated at page level)
//   - items come from props (wired from content/homepage/features.ts)
//   - grid is responsive: 1 → 2 → 4 columns
//   - no motion beyond CSS hover on cards
//   - section aria-labelledby references SectionHeading id
// =============================================================================

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import SectionContainer from '@/features/marketing/layouts/SectionContainer'
import SectionHeading from '@/features/marketing/components/SectionHeading'
import FeatureCard from '@/features/marketing/components/FeatureCard'
import type { FeatureItem } from '@/features/marketing/types'

interface FeatureGridSectionProps {
  heading: string
  eyebrow?: string
  subtitle?: string
  items: FeatureItem[]
}

export default function FeatureGridSection({
  heading,
  eyebrow,
  subtitle,
  items,
}: FeatureGridSectionProps) {
  const t = useTranslations('marketing.sections.features')
  return (
    <section
      aria-labelledby="features-heading"
      className="w-full py-20 sm:py-28"
    >
      <SectionContainer>
        {/* Section heading */}
        <SectionHeading
          id="features-heading"
          as="h2"
          heading={heading}
          eyebrow={eyebrow}
          subtext={subtitle}
          align="center"
        />

        {/* Feature grid */}
        <div
          className={cn(
            'mt-16 grid grid-cols-1 gap-6',
            'sm:grid-cols-2 lg:grid-cols-4',
          )}
          role="list"
          aria-label={t('a11yLabel')}
        >
          {items.map((item) => (
            <div key={item.id} role="listitem">
              <FeatureCard
                icon={item.icon}
                title={item.title}
                description={item.description}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  )
}
