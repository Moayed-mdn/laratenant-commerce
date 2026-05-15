// =============================================================================
// SplitLayout
//
// Two-column layout for showcase sections (copy left, visual right).
// Collapses to single column on mobile.
// Respects RTL direction.
//
// Rules:
//   - left column: text content
//   - right column: visual / image / preview
//   - gap is consistent and not arbitrary
//   - rtl: columns reverse via flex-row-reverse on RTL locales
// =============================================================================

import { cn } from '@/lib/utils'
import SectionContainer from './SectionContainer'

interface SplitLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
  className?: string
  /** Reverses column order — use for alternating showcase sections */
  reverse?: boolean
}

export default function SplitLayout({
  left,
  right,
  className,
  reverse = false,
}: SplitLayoutProps) {
  return (
    <SectionContainer>
      <div
        className={cn(
          'flex flex-col items-center gap-12 lg:flex-row lg:gap-16',
          reverse && 'lg:flex-row-reverse',
          className,
        )}
      >
        <div className="flex-1 space-y-6">{left}</div>
        <div className="flex-1">{right}</div>
      </div>
    </SectionContainer>
  )
}
