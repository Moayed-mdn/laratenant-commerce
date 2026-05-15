// =============================================================================
// TestimonialsSection
//
// Masonry-style responsive grid of TestimonialCard items.
// Server Component — purely presentational.
//
// Rules:
//   - heading from props (translated at page level)
//   - items from props (wired from content/homepage/testimonials.ts)
//   - grid: 1 col mobile → 2 col tablet → 3 col desktop
//   - cards use semantic blockquote/figcaption (handled in TestimonialCard)
//   - no fake quotes, no fake metrics — content guardrail in content file
// =============================================================================

import { cn } from '@/lib/utils'
import SectionContainer from '@/features/marketing/layouts/SectionContainer'
import SectionHeading from '@/features/marketing/components/SectionHeading'
import TestimonialCard from '@/features/marketing/components/TestimonialCard'
import type { TestimonialItem } from '@/features/marketing/types'

interface TestimonialsSectionProps {
  heading: string
  eyebrow?: string
  items: TestimonialItem[]
}

export default function TestimonialsSection({
  heading,
  eyebrow,
  items,
}: TestimonialsSectionProps) {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="w-full py-20 sm:py-28"
    >
      <SectionContainer>
        {/* Section heading */}
        <SectionHeading
          as="h2"
          heading={heading}
          eyebrow={eyebrow}
          align="center"
        />

        {/* Testimonial grid */}
        <div
          className={cn(
            'mt-16 grid grid-cols-1 gap-6',
            'sm:grid-cols-2 lg:grid-cols-3',
          )}
        >
          {items.map((item) => (
            <TestimonialCard
              key={item.id}
              {...item}
            />
          ))}
        </div>
      </SectionContainer>
    </section>
  )
}
