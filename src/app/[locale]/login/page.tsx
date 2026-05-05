import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginCard } from './_components/LoginCard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('login');
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default async function LoginPage() {
  // Wrap with AuthProvider so LoginForm can access auth context
  // The middleware handles redirect for authenticated users trying to access /login
  return (
    <AuthProvider>
      <LoginCard />
    </AuthProvider>
  );
}
