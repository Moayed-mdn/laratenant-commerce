/**
 * Admin layout for store-specific pages.
 * 
 * Server component that:
 * - Fetches current user from API using serverFetch (RSC pattern)
 * - Redirects to /login if unauthenticated (401)
 * - Renders AdminShell with AuthInitializer to sync user to client store
 * 
 * Route group: (admin)
 * Paths: /en/stores/[storeId]/*, /ar/stores/[storeId]/*
 */

import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api/server/client';
import { API_ROUTES } from '@/config/routes';
import type { AdminUser } from '@/types/user';
import type { ApiResponse } from '@/types/api';
import { AdminShell } from './_components/AdminShell';
import { AuthInitializer } from './_components/AuthInitializer';
import { logger } from '@/lib/logger';
import { getTranslations } from 'next-intl/server';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const t = await getTranslations('nav');

  let user: AdminUser | null = null;

  try {
    const response = await serverFetch<ApiResponse<AdminUser>>(
      API_ROUTES.auth.me()
    );
    user = response.data;
  } catch (error) {
    logger.warn('Admin layout: unauthenticated, redirecting to login', { error });
    redirect('/login');
  }

  if (!user) {
    logger.warn('Admin layout: no user data, redirecting to login');
    redirect('/login');
  }

  return (
    <AuthInitializer user={user}>
      <AdminShell>{children}</AdminShell>
    </AuthInitializer>
  );
}
