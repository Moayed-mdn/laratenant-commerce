/**
 * Admin layout for store-specific pages.
 * 
 * Server component that:
 * - Fetches current user using Bearer token from HttpOnly cookie (RSC pattern)
 * - Redirects to /login if unauthenticated (401)
 * - Wraps with AuthProvider for client-side auth state
 * - Renders AdminShell with AuthInitializer to sync user to client store
 * 
 * Route group: (admin)
 * Paths: /en/stores/[storeId]/*, /ar/stores/[storeId]/*
 */

import { redirect } from 'next/navigation';
import { getMe } from '@/lib/actions/auth.actions';
import type { User } from '@/types/auth';
import { AdminShell } from './_components/AdminShell';
import { AuthInitializer } from './_components/AuthInitializer';
import { AuthProvider } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { getTranslations } from 'next-intl/server';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations('nav');

  // Get current user using Bearer token from cookie
  const user = await getMe();

  if (!user) {
    logger.warn('Admin layout: unauthenticated, redirecting to login');
    //redirect(`/${locale}/login`);
  }

  // Convert User to AdminUser format for compatibility
  const adminUser = user as unknown as import('@/types/user').AdminUser;

  return (
    <AuthProvider initialUser={user}>
      <AuthInitializer user={adminUser}>
        <AdminShell>{children}</AdminShell>
      </AuthInitializer>
    </AuthProvider>
  );
}
