// =============================================================================
// LogoCloudSection
//
// Trust signal strip below hero. Displays merchant/partner logos.
// Server Component — purely presentational.
//
// Rules:
//   - logos use next/image with explicit dimensions to prevent CLS
//   - logo images have descriptive alt text (brand name)
//   - label text rendered above logo strip for context
//   - no motion — static trust element
//   - when no real logo assets exist, section renders graceful placeholder row
// =============================================================================

import Image from 'next/image'
import { cn } from '@/lib/utils'
import SectionContainer from '@/features/marketing/layouts/SectionContainer'
import type { LogoItem } from '@/features/marketing/types'

interface LogoCloudSectionProps {
  items: LogoItem[]
  label: string
}

export default function LogoCloudSection({
  items,
  label,
}: LogoCloudSectionProps) {
  return (
    <section
      aria-label="Trusted by merchants"
      className="w-full border-y border-border/50 bg-muted/30 py-12"
    >
      <SectionContainer>
        {/* Label */}
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>

        {/* Logo strip */}
        <div
          className={cn(
            'flex flex-wrap items-center justify-center gap-x-10 gap-y-6',
            'sm:gap-x-16',
          )}
          role="list"
          aria-label="Partner and customer logos"
        >
          {items.length > 0 ? (
            items.map((logo) => (
              <div
                key={logo.name}
                role="listitem"
                className="flex items-center justify-center opacity-60 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0"
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  className="h-8 w-auto object-contain"
                />
              </div>
            ))
          ) : (
            // Placeholder skeleton when no real assets exist
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                role="listitem"
                aria-hidden="true"
                className="h-8 w-24 rounded-md bg-muted"
              />
            ))
          )}
        </div>
      </SectionContainer>
    </section>
  )
}
