import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { LoginCard } from './_components/LoginCard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('login');
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default async function LoginPage() {
  // Check for existing session cookie
  const cookieStore = await cookies();
  const hasSessionCookie = cookieStore.has('laravel_session');

  // If already authenticated, redirect to root
  // (middleware or root page will handle store routing)
  if (hasSessionCookie) {
    redirect('/');
  }

  return <LoginCard />;
}
