// =============================================================================
// GradientBadge
//
// Eyebrow label pill used above section headings.
// Subtle brand accent — not a CTA, not a navigation element.
//
// Rules:
//   - presentational only — label string from parent
//   - no onClick, no href — use Button or Link for interactive variants
//   - border + background use design tokens only
//   - motion: none — static element
// =============================================================================

import { cn } from '@/lib/utils'

interface GradientBadgeProps {
  label: string
  className?: string
}

export default function GradientBadge({ label, className }: GradientBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border',
        'bg-muted px-3 py-1',
        'text-xs font-medium tracking-wide text-muted-foreground',
        className,
      )}
    >
      {label}
    </span>
  )
}
