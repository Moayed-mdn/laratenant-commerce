// =============================================================================
// TestimonialCard
//
// Displays a single testimonial: quote, author name, role, company.
// Used in TestimonialsSection.
//
// Rules:
//   - Server Component — purely presentational
//   - quote uses <blockquote> for semantic correctness
//   - avatar renders next/image when src is provided, initials fallback otherwise
//   - no fake data — content comes from parent via props
// =============================================================================

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { TestimonialItem } from '@/features/marketing/types'

type TestimonialCardProps = TestimonialItem & {
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function TestimonialCard({
  quote,
  authorName,
  authorRole,
  authorCompany,
  avatarSrc,
  className,
}: TestimonialCardProps) {
  return (
    <figure
      className={cn(
        'flex flex-col justify-between gap-6 rounded-xl border border-border bg-card p-6',
        className,
      )}
    >
      {/* Quote */}
      <blockquote className="text-sm leading-relaxed text-foreground">
        <p>&ldquo;{quote}&rdquo;</p>
      </blockquote>

      {/* Author */}
      <figcaption className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={authorName}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground"
              aria-hidden="true"
            >
              {getInitials(authorName)}
            </span>
          )}
        </div>

        {/* Name + role */}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {authorName}
          </span>
          <span className="text-xs text-muted-foreground">
            {authorRole}
            {authorCompany && `, ${authorCompany}`}
          </span>
        </div>
      </figcaption>
    </figure>
  )
}
