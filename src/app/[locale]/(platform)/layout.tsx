/**
 * Platform admin layout.
 * Wraps platform pages with sidebar navigation.
 */

import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { PlatformSidebarNav } from '@/features/platform/shell/PlatformSidebarNav';

interface Props {
  children: ReactNode;
}

export default async function PlatformLayout({ children }: Props) {
  const t = await getTranslations('platformDashboard');
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card">
          <div className="flex h-full flex-col">
            {/* Logo/Header */}
            <div className="flex h-16 items-center border-b px-6">
              <h1 className="text-lg font-semibold">{t('shellTitle')}</h1>
            </div>
            
            {/* Navigation */}
            <PlatformSidebarNav />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 pl-64">
          <div className="container mx-auto py-8 px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
