// =============================================================================
// CTASection
//
// Final conversion section. Fully prop-driven and reusable across all
// marketing pages. Server Component — no interactivity.
//
// Rules:
//   - all content via props — no internal data imports
//   - primary and secondary CTAs both optional (primary strongly recommended)
//   - centered layout via CenteredLayout primitive
//   - visual emphasis via subtle background treatment — design tokens only
//   - reusable: drop anywhere with different props
//   - no hardcoded copy
// =============================================================================

import { Link } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import CenteredLayout from '@/features/marketing/layouts/CenteredLayout'
import type { CTAContent } from '@/features/marketing/types'

type CTASectionProps = CTAContent & {
  className?: string
}

export default function CTASection({
  title,
  description,
  primaryCta,
  secondaryCta,
  className,
}: CTASectionProps) {
  return (
    <section
      aria-labelledby="cta-heading"
      className={cn(
        'relative w-full overflow-hidden py-20 sm:py-28',
        className,
      )}
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 -z-10',
          'bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,hsl(var(--primary)/0.07),transparent)]',
        )}
      />

      <CenteredLayout>
        {/* Heading */}
        <h2
          id="cta-heading"
          className={cn(
            'text-3xl font-bold tracking-tight text-foreground',
            'sm:text-4xl',
          )}
        >
          {title}
        </h2>

        {/* Description */}
        <p
          className={cn(
            'mt-4 text-base leading-relaxed text-muted-foreground',
            'sm:text-lg',
          )}
        >
          {description}
        </p>

        {/* CTA group */}
        <div
          className={cn(
            'mt-10 flex flex-wrap items-center justify-center gap-4',
          )}
        >
          <Link
            href={primaryCta.href}
            className={cn(
              'inline-flex items-center justify-center rounded-lg',
              'bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground',
              'transition-colors duration-150 hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            {primaryCta.label}
          </Link>

          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className={cn(
                'inline-flex items-center justify-center rounded-lg',
                'border border-border bg-background px-8 py-3',
                'text-sm font-semibold text-foreground',
                'transition-colors duration-150 hover:bg-muted',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </CenteredLayout>
    </section>
  )
}
