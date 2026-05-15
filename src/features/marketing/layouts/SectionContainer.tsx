// =============================================================================
// SectionContainer
//
// Layout primitive that enforces consistent horizontal padding and max-width
// across all marketing sections.
//
// Rules:
//   - max-w-[1280px] boundary
//   - consistent horizontal padding (responsive)
//   - no visual styling beyond layout constraints
//   - accepts className for one-off section overrides
//   - renders a <div> by default; accepts `as` for semantic override
// =============================================================================

import { type ComponentPropsWithoutRef, type ElementType } from 'react'
import { cn } from '@/lib/utils'

interface SectionContainerProps {
  children: React.ReactNode
  className?: string
  as?: ElementType
}

export default function SectionContainer({
  children,
  className,
  as: Tag = 'div',
}: SectionContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
