/**
 * Date formatting utilities.
 * Never format dates inline in components.
 *
 * All formatters take an optional `locale` ('en' | 'ar', defaults to 'en')
 * so callers with access to the current UI locale (e.g. via next-intl's
 * useLocale()) can render properly localized dates and numbers. Existing
 * callers that don't pass one keep the previous English-only behavior.
 */

import {
  format,
  formatDistanceToNow,
  isValid,
  parseISO,
} from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';

type AppLocale = 'en' | 'ar';

const DATE_FNS_LOCALES = {
  en: enUS,
  ar: arSA,
} as const;

function resolveDateFnsLocale(locale: AppLocale = 'en') {
  return DATE_FNS_LOCALES[locale] ?? enUS;
}

function resolveIntlLocale(locale: AppLocale = 'en') {
  return locale === 'ar' ? 'ar' : 'en-US';
}

/**
 * Format a date for display.
 * @param date - Date string or Date object
 * @param formatStr - date-fns format string (default: 'MMM d, yyyy')
 * @param locale - UI locale to format in (default: 'en')
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy', locale: AppLocale = 'en'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: resolveDateFnsLocale(locale) });
}

/**
 * Format a date with time.
 * @param date - Date string or Date object
 * @param locale - UI locale to format in (default: 'en')
 */
export function formatDateTime(date: string | Date, locale: AppLocale = 'en'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a', { locale: resolveDateFnsLocale(locale) });
}

/**
 * Format a relative time (e.g., "3 hours ago").
 * @param date - Date string or Date object
 * @param locale - UI locale to format in (default: 'en')
 */
export function formatRelative(date: string | Date, locale: AppLocale = 'en'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: resolveDateFnsLocale(locale) });
}

/**
 * Format a currency amount.
 * @param amount - Numeric amount
 * @param currency - Currency code (default: 'USD')
 * @param locale - UI locale to format in (default: 'en')
 */
export function formatCurrency(amount: number, currency: string = 'USD', locale: AppLocale = 'en'): string {
  return new Intl.NumberFormat(resolveIntlLocale(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Check if a value is a valid date.
 * @param date - Unknown value to check
 */
export function isValidDate(date: unknown): boolean {
  if (typeof date === 'string') {
    const parsed = parseISO(date);
    return isValid(parsed);
  }
  if (date instanceof Date) {
    return isValid(date);
  }
  return false;
}

/**
 * Parse an ISO date string from the API into a Date object.
 * @param date - ISO date string
 */
export function parseApiDate(date: string): Date {
  return parseISO(date);
}
