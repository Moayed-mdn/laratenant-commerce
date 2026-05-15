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
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { PRIMARY_NAV_LINKS } from '@/features/marketing/constants/nav-links'
import { CTA_LOGIN, CTA_GET_STARTED } from '@/features/marketing/constants/cta-links'

export default function MarketingNavbar() {
  const t = useTranslations('marketing')
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
          href="/"
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
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground',
                  'transition-colors duration-150 hover:bg-muted hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                {t(link.label)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={CTA_LOGIN.href}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium text-muted-foreground',
              'transition-colors duration-150 hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            {t(CTA_LOGIN.label)}
          </Link>
          <Link
            href={CTA_GET_STARTED.href}
            className={cn(
              'rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground',
              'transition-colors duration-150 hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            {t(CTA_GET_STARTED.label)}
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
                  href={link.href}
                  className={cn(
                    'block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground',
                    'transition-colors duration-150 hover:bg-muted hover:text-foreground',
                  )}
                  onClick={closeMenu}
                >
                  {t(link.label)}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile CTAs */}
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
            <Link
              href={CTA_LOGIN.href}
              className={cn(
                'block rounded-lg border border-border px-4 py-2.5 text-center',
                'text-sm font-medium text-foreground',
                'transition-colors duration-150 hover:bg-muted',
              )}
              onClick={closeMenu}
            >
              {t(CTA_LOGIN.label)}
            </Link>
            <Link
              href={CTA_GET_STARTED.href}
              className={cn(
                'block rounded-lg bg-primary px-4 py-2.5 text-center',
                'text-sm font-semibold text-primary-foreground',
                'transition-colors duration-150 hover:bg-primary/90',
              )}
              onClick={closeMenu}
            >
              {t(CTA_GET_STARTED.label)}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
