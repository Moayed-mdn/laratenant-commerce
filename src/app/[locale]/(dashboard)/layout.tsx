/**
 * Dashboard layout for store-specific pages.
 * 
 * Server component that:
 * - Fetches current user using Bearer token from HttpOnly cookie (RSC pattern)
 * - Redirects to /login if unauthenticated (401)
 * - Wraps with AuthProvider for client-side auth state
 * - Renders DashboardShell with AuthInitializer to sync user to client store
 * 
 * Route group: (dashboard)
 * Paths: /en/stores/[storeId]/*, /ar/stores/[storeId]/*
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getMe } from '@/lib/actions/auth.actions';
import type { User } from '@/types/auth';
import { DashboardShell } from '@/features/dashboard/shell/DashboardShell';
import { AuthInitializer } from '@/features/dashboard/shell/AuthInitializer';
import { TenantInitializer } from '@/features/dashboard/shell/TenantInitializer';
import { AuthProvider } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { getTranslations } from 'next-intl/server';
import { AppType } from '@/lib/tenant/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params;
  const headerList = await headers();
  const appType = (headerList.get('x-app-type') as AppType) || 'dashboard';
  const tenantSlug = headerList.get('x-tenant-slug');

  // Get current user using Bearer token from cookie
  const user = await getMe();

  if (!user) {
    logger.warn('Dashboard layout: unauthenticated, redirecting to login');
    const redirectUrl = new URL(`/login`, 'http://localhost:3000');
    // Preserve the current pathname as redirect target
    // The locale is already in the params from the route
    redirectUrl.searchParams.set('redirect', `/${locale}`);
    redirect(`/${locale}/login${redirectUrl.search}`);
  }

  // Map User (auth type) to AdminUser (admin store type)
  // User has stores[] — AdminUser expects store_id and role
  const adminUser: import('@/types/user').AdminUser | null = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        email_verified_at: user.email_verified_at,
        has_password: user.has_password,
        has_google_linked: user.has_google_linked,
        store_id: user.stores?.[0]?.id ?? null,
        role: user.stores?.[0]?.role as import('@/types/user').UserRole | undefined,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }
    : null;

  return (
    <AuthProvider initialUser={user}>
      <AuthInitializer user={adminUser}>
        <TenantInitializer appType={appType} tenantSlug={tenantSlug} />
        <DashboardShell>{children}</DashboardShell>
      </AuthInitializer>
    </AuthProvider>
  );
}
