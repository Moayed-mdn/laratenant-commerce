// =============================================================================
// DashboardShowcaseSection
//
// Split layout: copy on one side, dashboard visual on the other.
// Server Component — purely presentational.
//
// Rules:
//   - uses SplitLayout primitive for consistent two-column structure
//   - copy side: heading, subtext, optional CTA
//   - visual side: DashboardPreview (coded mockup or real screenshot)
//   - RTL: SplitLayout handles column reversal via dir attribute
//   - no motion at section level
// =============================================================================

import Link from 'next/link'
import { cn } from '@/lib/utils'
import SplitLayout from '@/features/marketing/layouts/SplitLayout'
import SectionHeading from '@/features/marketing/components/SectionHeading'
import DashboardPreview from '@/features/marketing/components/DashboardPreview'
import type { ShowcaseContent } from '@/features/marketing/types'

type DashboardShowcaseSectionProps = ShowcaseContent

export default function DashboardShowcaseSection({
  heading,
  subtext,
  cta,
  previewAlt,
}: DashboardShowcaseSectionProps) {
  return (
    <section
      aria-labelledby="showcase-heading"
      className={cn(
        'w-full py-20 sm:py-28',
        'bg-muted/20',
      )}
    >
      <SplitLayout
        left={
          <div className="flex flex-col gap-8">
            <SectionHeading
              as="h2"
              heading={heading}
              subtext={subtext}
              align="left"
            />

            {cta && (
              <div>
                <Link
                  href={cta.href}
                  className={cn(
                    'inline-flex items-center justify-center rounded-lg',
                    'bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground',
                    'transition-colors duration-150 hover:bg-primary/90',
                    'focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-ring focus-visible:ring-offset-2',
                  )}
                >
                  {cta.label}
                </Link>
              </div>
            )}
          </div>
        }
        right={
          <DashboardPreview alt={previewAlt} />
        }
      />
    </section>
  )
}
