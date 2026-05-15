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

import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { FOOTER_NAV_GROUPS } from '@/features/marketing/constants/nav-links'

const CURRENT_YEAR = new Date().getFullYear()

export default async function MarketingFooter() {
  const t = await getTranslations('marketing')
  const locale = await getLocale()

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
              href="/"
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
              {t('footer.description')}
            </p>
          </div>

          {/* Nav groups */}
          {FOOTER_NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                {t(group.label)}
              </h3>
              <ul className="flex flex-col gap-3" role="list">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'text-sm text-muted-foreground',
                        'transition-colors duration-150 hover:text-foreground',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      )}
                      {...(link.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {t(link.label)}
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
            &copy; {CURRENT_YEAR} LaraTenant Commerce. {t('footer.copyright')}
          </p>

          {/* Locale switcher placeholder */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              locale="en"
              className={cn(
                'text-xs text-muted-foreground transition-colors hover:text-foreground',
                locale === 'en' && 'font-semibold text-foreground',
              )}
              aria-label="Switch to English"
            >
              EN
            </Link>
            <Link
              href="/"
              locale="ar"
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
