// =============================================================================
// next-intl Request Configuration
//
// Loads all JSON files from src/locales/{locale}/ and merges them into
// a single messages object. Each filename becomes the namespace key.
//
// Examples:
//   src/locales/en/common.json     → namespace 'common'
//   src/locales/en/marketing.json  → namespace 'marketing'
//   src/locales/ar/common.json     → namespace 'common'
//   src/locales/ar/marketing.json  → namespace 'marketing'
//
// Adding a new namespace:
//   1. Create src/locales/en/my-namespace.json
//   2. Create src/locales/ar/my-namespace.json
//   3. Use: getTranslations({ locale, namespace: 'my-namespace' })
//   No config changes required.
//
// common.json convention (2026-08 split):
//   common.json is reserved for the small set of generic, reused-everywhere
//   action/status strings (save, cancel, loading, error, ...) that are read
//   both as the root namespace (useTranslations() with no argument) and as
//   the 'common' namespace (useTranslations('common')). Every feature-sized
//   bundle of copy (nav, login, theme, billing, settings, cmsPages, etc.)
//   lives in its own <namespace>.json file instead — do not add new nested
//   feature objects to common.json, since that's exactly the sprawl this
//   split was meant to undo. If a namespace like `settings` or `cmsPages`
//   already exists as its own file, add new keys there directly rather than
//   re-introducing a same-named key in common.json (the loader merges same-
//   named files shallowly, so a re-introduced common.json.settings key would
//   silently shadow or fight with settings.json depending on file order).
//
// Rules:
//   - locale directory must exist for all supported locales
//   - all locale directories must have key parity
//   - do not add locale logic inside components — use this loader
// =============================================================================

import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'

const SUPPORTED_LOCALES = ['en', 'ar'] as const
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale)
}

/**
 * Loads and merges all JSON files from src/locales/{locale}/.
 * Each file's basename (without .json) becomes the top-level namespace key.
 *
 * src/locales/en/common.json    → { common: { ... } }
 * src/locales/en/marketing.json → { marketing: { ... } }
 * Merged result:                  { common: { ... }, marketing: { ... } }
 */
function loadMessages(locale: string): Record<string, unknown> {
  const localesDir = path.join(process.cwd(), 'src', 'locales', locale)

  if (!fs.existsSync(localesDir)) {
    console.error(`[i18n] Locale directory not found: ${localesDir}`)
    return {}
  }

  const files = fs
    .readdirSync(localesDir)
    .filter((f) => f.endsWith('.json'))

  if (files.length === 0) {
    console.warn(`[i18n] No JSON files found in ${localesDir}`)
    return {}
  }

  const merged: Record<string, unknown> = {}

  for (const file of files) {
    const namespace = file.replace(/\.json$/, '')
    const filePath = path.join(localesDir, file)

    try {
      const raw = fs.readFileSync(filePath, 'utf8')
      const content = JSON.parse(raw)

      if (namespace === 'common') {
        // Flatten common.json into the root messages object.
        // This allows namespaces like 'nav', 'products', 'dashboard', etc. 
        // that are defined as top-level keys in common.json to be 
        // resolved as canonical namespaces.
        Object.assign(merged, content)
      }

      // Merge namespace into existing key (e.g. settings.json merges into
      // settings already flattened from common.json rather than replacing it).
      if (typeof merged[namespace] === 'object' && merged[namespace] !== null && !Array.isArray(merged[namespace])) {
        merged[namespace] = { ...merged[namespace], ...content }
      } else {
        merged[namespace] = content
      }
    } catch (e) {
      console.error(`[i18n] Failed to load ${filePath}:`, e)
    }
  }

  return merged
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale

  if (!locale || !isSupportedLocale(locale)) {
    notFound()
  }

  return {
    locale,
    messages: loadMessages(locale),
  }
})
