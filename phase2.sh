#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# LaraTenant Commerce — Marketing Site Foundation
# Phase 2: Shared Components (Steps 7–14)
# SectionHeading, GradientBadge, DashboardPreview,
# FeatureCard, TestimonialCard, PricingCard,
# MarketingNavbar, MarketingFooter
# =============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MARKETING="$PROJECT_ROOT/src/features/marketing"
COMPONENTS="$MARKETING/components"

echo "→ Writing Phase 2 components..."

# =============================================================================
# STEP 7 — components/SectionHeading.tsx
# =============================================================================

cat > "$COMPONENTS/SectionHeading.tsx" << 'EOF'
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
EOF

echo "✓ components/SectionHeading.tsx"

# =============================================================================
# STEP 8 — components/GradientBadge.tsx
# =============================================================================

cat > "$COMPONENTS/GradientBadge.tsx" << 'EOF'
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
EOF

echo "✓ components/GradientBadge.tsx"

# =============================================================================
# STEP 9 — components/DashboardPreview.tsx
# =============================================================================

cat > "$COMPONENTS/DashboardPreview.tsx" << 'EOF'
// =============================================================================
// DashboardPreview
//
// Browser-chrome mockup shell that renders a structured placeholder
// representing the admin dashboard UI.
//
// Rules:
//   - Server Component — no client state, no browser APIs
//   - structured placeholder until real screenshot asset exists
//   - swap interior for next/image with zero structural change
//   - alt text required via prop for accessibility
//   - dimensions are explicit to prevent CLS
//   - no hardcoded colors — design tokens only
// =============================================================================

import { cn } from '@/lib/utils'

interface DashboardPreviewProps {
  alt: string
  className?: string
}

export default function DashboardPreview({
  alt,
  className,
}: DashboardPreviewProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        'relative w-full overflow-hidden rounded-xl border border-border',
        'bg-card shadow-2xl',
        className,
      )}
    >
      {/* Browser chrome bar */}
      <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
        {/* Traffic lights */}
        <span className="h-3 w-3 rounded-full bg-red-400/60" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/60" />
        <span className="h-3 w-3 rounded-full bg-green-400/60" />

        {/* Fake URL bar */}
        <div className="mx-auto flex h-6 w-full max-w-xs items-center rounded-md border border-border bg-background px-3">
          <span className="truncate text-xs text-muted-foreground">
            app.laratenant.com/dashboard
          </span>
        </div>
      </div>

      {/* Dashboard interior placeholder */}
      <div className="flex h-[420px] bg-background">
        {/* Sidebar */}
        <aside className="flex w-16 flex-col gap-3 border-e border-border bg-muted/40 p-3 sm:w-48">
          <div className="h-8 rounded-md bg-muted" />
          <div className="mt-2 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-7 rounded-md bg-muted"
                style={{ opacity: 1 - i * 0.12 }}
              />
            ))}
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Stat cards row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
              >
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-6 w-20 rounded bg-muted" />
                <div className="h-2 w-12 rounded bg-muted/60" />
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="flex-1 rounded-lg border border-border bg-card p-4">
            <div className="mb-3 h-4 w-32 rounded bg-muted" />
            <div className="flex h-full max-h-40 items-end gap-2 pb-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-primary/20"
                  style={{
                    height: `${30 + Math.round(Math.sin(i * 0.7 + 1) * 25 + 40)}%`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Table placeholder */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 h-4 w-24 rounded bg-muted" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="h-3 flex-1 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted/60" />
                  <div className="h-5 w-14 rounded-full bg-primary/15" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

echo "✓ components/DashboardPreview.tsx"

# =============================================================================
# STEP 10 — components/FeatureCard.tsx
# =============================================================================

cat > "$COMPONENTS/FeatureCard.tsx" << 'EOF'
// =============================================================================
// FeatureCard
//
// Displays a single feature item: icon, title, description.
// Used in FeatureGridSection.
//
// Rules:
//   - Server Component — purely presentational
//   - no data fetching, no translation calls
//   - all content via typed props
//   - icon is a string (emoji or icon name) — parent resolves rendering
//   - hover state uses CSS transition only, no JS
// =============================================================================

import { cn } from '@/lib/utils'
import type { FeatureItem } from '@/features/marketing/types'

type FeatureCardProps = Pick<FeatureItem, 'icon' | 'title' | 'description'> & {
  className?: string
}

export default function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'group flex flex-col gap-4 rounded-xl border border-border bg-card p-6',
        'transition-shadow duration-200 hover:shadow-md',
        className,
      )}
    >
      {/* Icon container */}
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-lg',
          'bg-primary/10 text-primary',
          'transition-colors duration-200 group-hover:bg-primary/15',
        )}
        aria-hidden="true"
      >
        <span className="text-xl leading-none">{icon}</span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}
EOF

echo "✓ components/FeatureCard.tsx"

# =============================================================================
# STEP 11 — components/TestimonialCard.tsx
# =============================================================================

cat > "$COMPONENTS/TestimonialCard.tsx" << 'EOF'
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
EOF

echo "✓ components/TestimonialCard.tsx"

# =============================================================================
# STEP 12 — components/PricingCard.tsx
# =============================================================================

cat > "$COMPONENTS/PricingCard.tsx" << 'EOF'
// =============================================================================
// PricingCard
//
// Displays a single pricing tier.
// Used in PricingSection.
//
// Rules:
//   - Server Component — no toggle state here
//   - highlighted tier gets visual emphasis via border + shadow
//   - price display handles null (contact sales) gracefully
//   - feature list uses semantic <ul> with accessible check/cross icons
//   - CTA is an <a> tag — no client router needed for external/auth routes
// =============================================================================

import { cn } from '@/lib/utils'
import type { PricingPlan } from '@/features/marketing/types'

type PricingCardProps = PricingPlan & {
  /** Which price to display — controlled by parent PricingSection */
  interval: 'monthly' | 'annual'
  className?: string
}

export default function PricingCard({
  name,
  description,
  monthlyPrice,
  annualPrice,
  currency,
  highlighted,
  ctaLabel,
  ctaHref,
  features,
  interval,
  className,
}: PricingCardProps) {
  const displayPrice = interval === 'annual' ? annualPrice : monthlyPrice
  const isContactSales = displayPrice === null

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border p-8',
        'transition-shadow duration-200',
        highlighted
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-border bg-card hover:shadow-md',
        className,
      )}
    >
      {/* Popular badge */}
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1',
              'bg-primary text-xs font-semibold text-primary-foreground',
            )}
          >
            Most Popular
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-foreground">{name}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Price */}
      <div className="mt-6 flex items-baseline gap-1">
        {isContactSales ? (
          <span className="text-3xl font-bold text-foreground">
            Contact Sales
          </span>
        ) : (
          <>
            <span className="text-sm font-medium text-muted-foreground">
              {currency}
            </span>
            <span className="text-4xl font-bold text-foreground">
              {displayPrice}
            </span>
            <span className="text-sm text-muted-foreground">
              /{interval === 'annual' ? 'yr' : 'mo'}
            </span>
          </>
        )}
      </div>

      {/* CTA */}
      <a
        href={ctaHref}
        className={cn(
          'mt-8 inline-flex w-full items-center justify-center rounded-lg px-5 py-2.5',
          'text-sm font-semibold transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          highlighted
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'border border-border bg-background text-foreground hover:bg-muted',
        )}
      >
        {ctaLabel}
      </a>

      {/* Feature list */}
      <ul className="mt-8 flex flex-col gap-3" role="list">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className={cn(
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-xs',
                feature.included
                  ? 'bg-primary/15 text-primary'
                  : 'bg-muted text-muted-foreground',
              )}
              aria-hidden="true"
            >
              {feature.included ? '✓' : '–'}
            </span>
            <span
              className={cn(
                'text-sm leading-snug',
                feature.included
                  ? 'text-foreground'
                  : 'text-muted-foreground line-through',
              )}
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
EOF

echo "✓ components/PricingCard.tsx"

# =============================================================================
# STEP 13 — components/MarketingNavbar.tsx
# =============================================================================

cat > "$COMPONENTS/MarketingNavbar.tsx" << 'EOF'
'use client'

// =============================================================================
// MarketingNavbar
//
// Top navigation bar for all marketing pages.
// Client Component — owns mobile menu open/close state only.
//
// Rules:
//   - mobile menu toggle is the ONLY reason this is a Client Component
//   - no auth state — auth-conditional nav is a future isolated addition
//   - locale-aware hrefs built at render time from locale prop
//   - nav links and CTA links sourced from constants — no inline strings
//   - keyboard accessible: Escape closes mobile menu
//   - aria-expanded on mobile toggle button
//   - sticky top with backdrop blur — CSS only, no JS scroll listener
// =============================================================================

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PRIMARY_NAV_LINKS } from '@/features/marketing/constants/nav-links'
import { CTA_LOGIN, CTA_GET_STARTED } from '@/features/marketing/constants/cta-links'

interface MarketingNavbarProps {
  locale: string
}

export default function MarketingNavbar({ locale }: MarketingNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // Close menu on Escape
  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen, closeMenu])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  function buildHref(path: string): string {
    return `/${locale}${path}`
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        'border-b border-border/60 bg-background/80 backdrop-blur-md',
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href={buildHref('')}
          className="flex items-center gap-2 text-lg font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={closeMenu}
          aria-label="LaraTenant Commerce — Home"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground"
            aria-hidden="true"
          >
            L
          </span>
          <span className="hidden sm:inline">LaraTenant</span>
        </Link>

        {/* Desktop nav */}
        <ul
          className="hidden items-center gap-1 md:flex"
          role="list"
        >
          {PRIMARY_NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={buildHref(link.href)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground',
                  'transition-colors duration-150 hover:bg-muted hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={buildHref(CTA_LOGIN.href)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium text-muted-foreground',
              'transition-colors duration-150 hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            {CTA_LOGIN.label}
          </Link>
          <Link
            href={buildHref(CTA_GET_STARTED.href)}
            className={cn(
              'rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground',
              'transition-colors duration-150 hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            {CTA_GET_STARTED.label}
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md md:hidden',
            'text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {/* Hamburger / Close icon — CSS only */}
          <span className="relative flex h-4 w-5 flex-col justify-between" aria-hidden="true">
            <span
              className={cn(
                'block h-0.5 w-full rounded-full bg-current transition-transform duration-200',
                menuOpen && 'translate-y-[7px] rotate-45',
              )}
            />
            <span
              className={cn(
                'block h-0.5 w-full rounded-full bg-current transition-opacity duration-200',
                menuOpen && 'opacity-0',
              )}
            />
            <span
              className={cn(
                'block h-0.5 w-full rounded-full bg-current transition-transform duration-200',
                menuOpen && '-translate-y-[7px] -rotate-45',
              )}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={cn(
          'fixed inset-x-0 top-16 z-40 md:hidden',
          'border-b border-border bg-background',
          'transition-all duration-200',
          menuOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0',
        )}
      >
        <div className="mx-auto max-w-[1280px] px-4 pb-6 pt-4 sm:px-6">
          <ul className="flex flex-col gap-1" role="list">
            {PRIMARY_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={buildHref(link.href)}
                  className={cn(
                    'block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground',
                    'transition-colors duration-150 hover:bg-muted hover:text-foreground',
                  )}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile CTAs */}
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
            <Link
              href={buildHref(CTA_LOGIN.href)}
              className={cn(
                'block rounded-lg border border-border px-4 py-2.5 text-center',
                'text-sm font-medium text-foreground',
                'transition-colors duration-150 hover:bg-muted',
              )}
              onClick={closeMenu}
            >
              {CTA_LOGIN.label}
            </Link>
            <Link
              href={buildHref(CTA_GET_STARTED.href)}
              className={cn(
                'block rounded-lg bg-primary px-4 py-2.5 text-center',
                'text-sm font-semibold text-primary-foreground',
                'transition-colors duration-150 hover:bg-primary/90',
              )}
              onClick={closeMenu}
            >
              {CTA_GET_STARTED.label}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
EOF

echo "✓ components/MarketingNavbar.tsx"

# =============================================================================
# STEP 14 — components/MarketingFooter.tsx
# =============================================================================

cat > "$COMPONENTS/MarketingFooter.tsx" << 'EOF'
// =============================================================================
// MarketingFooter
//
// Global footer for all marketing pages.
// Server Component — no interactivity.
//
// Rules:
//   - locale-aware hrefs built from locale prop
//   - link groups sourced from FOOTER_NAV_GROUPS constant
//   - semantic <footer> with aria-label
//   - copyright year is static — dynamic year requires 'use client' which
//     is not justified; update manually or accept build-time year
// =============================================================================

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { FOOTER_NAV_GROUPS } from '@/features/marketing/constants/nav-links'

interface MarketingFooterProps {
  locale: string
}

const CURRENT_YEAR = new Date().getFullYear()

export default function MarketingFooter({ locale }: MarketingFooterProps) {
  function buildHref(path: string): string {
    return `/${locale}${path}`
  }

  return (
    <footer
      className="w-full border-t border-border bg-background"
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 flex flex-col gap-4 sm:col-span-3 lg:col-span-1">
            <Link
              href={buildHref('')}
              className={cn(
                'inline-flex items-center gap-2',
                'text-base font-bold text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              )}
              aria-label="LaraTenant Commerce — Home"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-black text-primary-foreground"
                aria-hidden="true"
              >
                L
              </span>
              LaraTenant
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Modern multi-tenant ecommerce infrastructure for growing brands
              and merchants.
            </p>
          </div>

          {/* Nav groups */}
          {FOOTER_NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                {group.label}
              </h3>
              <ul className="flex flex-col gap-3" role="list">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={buildHref(link.href)}
                      className={cn(
                        'text-sm text-muted-foreground',
                        'transition-colors duration-150 hover:text-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      )}
                      {...(link.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {CURRENT_YEAR} LaraTenant Commerce. All rights reserved.
          </p>

          {/* Locale switcher placeholder */}
          <div className="flex items-center gap-4">
            <Link
              href="/en"
              className={cn(
                'text-xs text-muted-foreground transition-colors hover:text-foreground',
                locale === 'en' && 'font-semibold text-foreground',
              )}
              aria-label="Switch to English"
            >
              EN
            </Link>
            <Link
              href="/ar"
              className={cn(
                'text-xs text-muted-foreground transition-colors hover:text-foreground',
                locale === 'ar' && 'font-semibold text-foreground',
              )}
              aria-label="التبديل إلى العربية"
            >
              AR
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
EOF

echo "✓ components/MarketingFooter.tsx"

# =============================================================================
# Done
# =============================================================================

echo ""
echo "============================================="
echo " Phase 2 Complete — Shared Components"
echo "============================================="
echo ""
echo " Created:"
echo "   src/features/marketing/components/SectionHeading.tsx"
echo "   src/features/marketing/components/GradientBadge.tsx"
echo "   src/features/marketing/components/DashboardPreview.tsx"
echo "   src/features/marketing/components/FeatureCard.tsx"
echo "   src/features/marketing/components/TestimonialCard.tsx"
echo "   src/features/marketing/components/PricingCard.tsx"
echo "   src/features/marketing/components/MarketingNavbar.tsx"
echo "   src/features/marketing/components/MarketingFooter.tsx"
echo ""
echo " Next: Phase 3 — Content Files (Steps 15–23)"
echo "   content/homepage/{hero,features,showcase,"
echo "   testimonials,logos,faqs,cta}.ts"
echo "   content/pricing/{plans,faqs}.ts"
echo "============================================="