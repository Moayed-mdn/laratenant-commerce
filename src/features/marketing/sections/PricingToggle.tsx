'use client'

// =============================================================================
// PricingToggle
//
// Client Component — owns billing interval toggle state.
// Renders toggle UI and passes interval down to PricingCard instances.
//
// Rules:
//   - this is the ONLY client boundary in PricingSection
//   - PricingSection shell stays Server Component
//   - interval state is local — no Zustand, no URL state needed here
//   - PricingCard is a Server Component rendered inside this client boundary
//     (valid — Server Components can be passed as children or imported
//      into Client Components as long as they don't use client-only APIs)
//   - toggle uses accessible button group pattern with aria-pressed
// =============================================================================

import { useState } from 'react'
import { cn } from '@/lib/utils'
import PricingCard from '@/features/marketing/components/PricingCard'
import type { PricingInterval, PricingPlan } from '@/features/marketing/types'

interface PricingToggleProps {
  plans: PricingPlan[]
  toggleLabel?: {
    monthly: string
    annual: string
    badge?: string
  }
}

const DEFAULT_LABELS = {
  monthly: 'Monthly',
  annual: 'Annual',
  badge: 'Save 17%',
}

export default function PricingToggle({
  plans,
  toggleLabel,
}: PricingToggleProps) {
  const [interval, setInterval] = useState<PricingInterval>('monthly')
  const labels = { ...DEFAULT_LABELS, ...toggleLabel }

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Toggle group */}
      <div
        role="group"
        aria-label="Billing interval"
        className={cn(
          'inline-flex items-center rounded-lg border border-border bg-muted p-1',
        )}
      >
        {(['monthly', 'annual'] as PricingInterval[]).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={interval === option}
            onClick={() => setInterval(option)}
            className={cn(
              'relative inline-flex items-center gap-2 rounded-md px-4 py-2',
              'text-sm font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              interval === option
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option === 'monthly' ? labels.monthly : labels.annual}

            {/* Savings badge on annual option */}
            {option === 'annual' && labels.badge && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-1.5 py-0.5',
                  'text-[10px] font-semibold',
                  interval === 'annual'
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted-foreground/15 text-muted-foreground',
                )}
              >
                {labels.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pricing card grid */}
      <div
        className={cn(
          'grid w-full grid-cols-1 gap-8',
          'md:grid-cols-3',
          // Center single/double card layouts
          plans.length === 1 && 'md:max-w-sm',
          plans.length === 2 && 'md:max-w-2xl',
        )}
      >
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            {...plan}
            interval={interval}
          />
        ))}
      </div>
    </div>
  )
}
