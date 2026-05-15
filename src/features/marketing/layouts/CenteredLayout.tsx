// =============================================================================
// CenteredLayout
//
// Centers content horizontally and optionally vertically.
// Used for CTA sections, hero inner content, and confirmation-style sections.
//
// Rules:
//   - wraps SectionContainer
//   - text-center by default
//   - max-w-prose or custom maxWidth for content column
// =============================================================================

import { cn } from '@/lib/utils'
import SectionContainer from './SectionContainer'

interface CenteredLayoutProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

export default function CenteredLayout({
  children,
  className,
  innerClassName,
}: CenteredLayoutProps) {
  return (
    <SectionContainer className={className}>
      <div className={cn('mx-auto max-w-3xl text-center', innerClassName)}>
        {children}
      </div>
    </SectionContainer>
  )
}
