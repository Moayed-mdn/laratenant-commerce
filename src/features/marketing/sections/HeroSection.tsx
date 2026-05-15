// =============================================================================
// HeroSection
//
// Above-the-fold hero. Owns the page's only H1.
// Server Component — no interactivity, no client state.
//
// Rules:
//   - exactly one h1 per page — this section owns it
//   - all content via typed props — no internal data imports
//   - DashboardPreview below CTAs as visual anchor
//   - motion: subtle fade-in via CSS animate-in — no JS animation lib
//   - prefers-reduced-motion respected via Tailwind motion-safe: variant
//   - RTL: flex direction and text alignment inherited from html[dir]
// =============================================================================

import { Link } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import SectionContainer from '@/features/marketing/layouts/SectionContainer'
import SectionHeading from '@/features/marketing/components/SectionHeading'
import DashboardPreview from '@/features/marketing/components/DashboardPreview'
import type { HeroContent } from '@/features/marketing/types'

type HeroSectionProps = HeroContent

export default function HeroSection({
  badge,
  headline,
  subtext,
  primaryCta,
  secondaryCta,
  previewAlt,
}: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        'relative w-full overflow-hidden',
        'py-20 sm:py-28 lg:py-36',
        // Subtle radial gradient background — design tokens only
        'bg-background',
      )}
    >
      {/* Background decoration — purely visual, aria-hidden */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 -z-10',
          'bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)]',
        )}
      />

      <SectionContainer>
        {/* Hero text block */}
        <div
          className={cn(
            'mx-auto flex max-w-3xl flex-col items-center text-center',
            'motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700',
          )}
        >
          <SectionHeading
            as="h1"
            heading={headline}
            eyebrow={badge}
            subtext={subtext}
            align="center"
          />

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
                'bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground',
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
                  'border border-border bg-background px-6 py-3',
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
        </div>

        {/* Dashboard preview */}
        <div
          className={cn(
            'relative mx-auto mt-16 w-full max-w-5xl',
            'motion-safe:animate-in motion-safe:fade-in',
            'motion-safe:slide-in-from-bottom-4 motion-safe:duration-700',
            'motion-safe:delay-200',
          )}
        >
          {/* Glow behind preview — aria-hidden decoration */}
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute -inset-x-4 -top-4 -z-10 h-1/2',
              'bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--primary)/0.12),transparent)]',
            )}
          />

          <DashboardPreview alt={previewAlt} />
        </div>
      </SectionContainer>
    </section>
  )
}
