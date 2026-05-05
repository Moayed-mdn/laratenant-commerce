/**
 * next-intl navigation helpers.
 * Provides useRouter, usePathname, Link, redirect
 * that are locale-aware and set NEXT_LOCALE cookie automatically.
 */

import { createNavigation } from 'next-intl/navigation';
import { routing } from '@/i18n/routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
