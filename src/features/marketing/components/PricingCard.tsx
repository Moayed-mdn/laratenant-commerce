// =============================================================================
// PricingCard
//
// Displays a single pricing tier.
// Used in PricingSection.
//
// Rules:
//   - Server Component — no toggle state here
//   - highlighted tier gets visual emphasis via border + shadow
//   - price display handles null (contact sales) gracefully
//   - feature list uses semantic <ul> with accessible check/cross icons
//   - CTA is an <a> tag — no client router needed for external/auth routes
// =============================================================================

import { Link } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import type { PricingPlan } from '@/features/marketing/types'

type PricingCardProps = PricingPlan & {
  /** Which price to display — controlled by parent PricingSection */
  interval: 'monthly' | 'annual'
  className?: string
}

export default function PricingCard({
  name,
  description,
  monthlyPrice,
  annualPrice,
  currency,
  highlighted,
  ctaLabel,
  ctaHref,
  features,
  interval,
  className,
}: PricingCardProps) {
  const displayPrice = interval === 'annual' ? annualPrice : monthlyPrice
  const isContactSales = displayPrice === null

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border p-8',
        'transition-shadow duration-200',
        highlighted
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-border bg-card hover:shadow-md',
        className,
      )}
    >
      {/* Popular badge */}
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1',
              'bg-primary text-xs font-semibold text-primary-foreground',
            )}
          >
            Most Popular
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-foreground">{name}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Price */}
      <div className="mt-6 flex items-baseline gap-1">
        {isContactSales ? (
          <span className="text-3xl font-bold text-foreground">
            Contact Sales
          </span>
        ) : (
          <>
            <span className="text-sm font-medium text-muted-foreground">
              {currency}
            </span>
            <span className="text-4xl font-bold text-foreground">
              {displayPrice}
            </span>
            <span className="text-sm text-muted-foreground">
              /{interval === 'annual' ? 'yr' : 'mo'}
            </span>
          </>
        )}
      </div>

      {/* CTA */}
      <Link
        href={ctaHref}
        className={cn(
          'mt-8 inline-flex w-full items-center justify-center rounded-lg px-5 py-2.5',
          'text-sm font-semibold transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          highlighted
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        )}
      >
        {ctaLabel}
      </Link>

      {/* Feature list */}
      <ul className="mt-8 flex flex-col gap-3" role="list">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className={cn(
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-xs',
                feature.included
                  ? 'bg-primary/15 text-primary'
                  : 'bg-muted text-muted-foreground',
              )}
              aria-hidden="true"
            >
              {feature.included ? '✓' : '–'}
            </span>
            <span
              className={cn(
                'text-sm leading-snug',
                feature.included
                  ? 'text-foreground'
                  : 'text-muted-foreground line-through',
              )}
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
