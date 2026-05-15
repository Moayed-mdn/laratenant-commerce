// =============================================================================
// PricingSection
//
// Pricing tier grid with optional billing interval toggle.
// Shell is a Server Component.
// PricingToggle (interval state) is a Client Component boundary — isolated.
//
// Rules:
//   - PricingCard receives interval as prop — controlled by toggle state
//   - toggle state lives in PricingToggle (Client Component)
//   - server shell renders heading, subtitle, and card grid structure
//   - highlighted plan has visual emphasis (handled in PricingCard)
//   - no fake discounts, no fake scarcity
// =============================================================================

import { cn } from '@/lib/utils'
import SectionContainer from '@/features/marketing/layouts/SectionContainer'
import SectionHeading from '@/features/marketing/components/SectionHeading'
import PricingToggle from '@/features/marketing/sections/PricingToggle'
import type { PricingPlan } from '@/features/marketing/types'

interface PricingSectionProps {
  heading: string
  eyebrow?: string
  subtitle?: string
  plans: PricingPlan[]
  toggleLabel?: {
    monthly: string
    annual: string
    badge?: string
  }
}

export default function PricingSection({
  heading,
  eyebrow,
  subtitle,
  plans,
  toggleLabel,
}: PricingSectionProps) {
  return (
    <section
      aria-labelledby="pricing-heading"
      className={cn(
        'w-full py-20 sm:py-28',
        'bg-muted/20',
      )}
    >
      <SectionContainer>
        {/* Section heading */}
        <SectionHeading
          as="h2"
          heading={heading}
          eyebrow={eyebrow}
          subtext={subtitle}
          align="center"
        />

        {/* Billing toggle + card grid — Client Component boundary */}
        <div className="mt-12">
          <PricingToggle
            plans={plans}
            toggleLabel={toggleLabel}
          />
        </div>
      </SectionContainer>
    </section>
  )
}
