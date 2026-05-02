'use client';

/**
 * AdminShell component.
 * Composes sidebar, topbar, and main content area.
 * 
 * Reason for 'use client': needs Zustand sidebar state.
 */

import { useUiStore, selectSidebarCollapsed, selectIsRTL } from '@/stores/uiStore';
import { Sidebar } from './sidebar/Sidebar';
import { Topbar } from './topbar/Topbar';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/utils';

interface AdminShellProps {
  children: React.ReactNode;
}

/**
 * Main layout shell for admin pages.
 * Includes sidebar, topbar, and content area.
 */
export function AdminShell({ children }: AdminShellProps) {
  const isCollapsed = useUiStore(selectSidebarCollapsed);
  const isRTL = useUiStore(selectIsRTL);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main area */}
      <div
        className={cn(
          'flex flex-col flex-1 overflow-hidden transition-all duration-200',
          isRTL ? 'mr-0' : 'ml-0'
        )}
      >
        <Topbar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Mobile nav overlay */}
      <MobileNav />
    </div>
  );
}
