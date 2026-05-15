// =============================================================================
// SectionHeading
//
// Reusable heading block for all marketing sections.
// Renders eyebrow label, primary heading, and optional subtext.
//
// Rules:
//   - heading level is explicit via `as` prop — never assumed
//   - hero passes as="h1" — all other sections pass as="h2"
//   - alignment is prop-driven (left | center)
//   - no data fetching, no translation calls — parent passes strings
//   - subtext is optional and renders only when provided
// =============================================================================

import { cn } from '@/lib/utils'
import GradientBadge from './GradientBadge'
import type { HeadingAlign, HeadingLevel } from '@/features/marketing/types'

interface SectionHeadingProps {
  heading: string
  as?: HeadingLevel
  eyebrow?: string
  subtext?: string
  align?: HeadingAlign
  className?: string
}

export default function SectionHeading({
  heading,
  as: Tag = 'h2',
  eyebrow,
  subtext,
  align = 'center',
  className,
}: SectionHeadingProps) {
  const isCenter = align === 'center'

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        isCenter ? 'items-center text-center' : 'items-start text-start',
        className,
      )}
    >
      {eyebrow && <GradientBadge label={eyebrow} />}

      <Tag
        className={cn(
          'font-bold tracking-tight text-foreground',
          Tag === 'h1'
            ? 'text-4xl sm:text-5xl lg:text-6xl'
            : 'text-3xl sm:text-4xl',
        )}
      >
        {heading}
      </Tag>

      {subtext && (
        <p
          className={cn(
            'max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg',
            isCenter && 'mx-auto',
          )}
        >
          {subtext}
        </p>
      )}
    </div>
  )
}
