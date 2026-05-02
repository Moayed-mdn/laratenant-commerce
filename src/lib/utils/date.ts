/**
 * Date formatting utilities.
 * Never format dates inline in components.
 */

import {
  format,
  formatDistanceToNow,
  isValid,
  parseISO,
} from 'date-fns';

/**
 * Format a date for display.
 * @param date - Date string or Date object
 * @param formatStr - date-fns format string (default: 'MMM d, yyyy')
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format a date with time.
 * @param date - Date string or Date object
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a');
}

/**
 * Format a relative time (e.g., "3 hours ago").
 * @param date - Date string or Date object
 */
export function formatRelative(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format a currency amount.
 * @param amount - Numeric amount
 * @param currency - Currency code (default: 'USD')
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
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
