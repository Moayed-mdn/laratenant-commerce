'use client';

/**
 * MobileNav component.
 * Mobile navigation overlay using Sheet component.
 * 
 * Reason for 'use client': reads sidebar state from Zustand.
 */

import { useUiStore, selectSidebarOpen } from '@/stores/uiStore';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { SidebarNav } from './sidebar/SidebarNav';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

/**
 * Mobile navigation sheet that overlays on small screens.
 */
export function MobileNav() {
  const params = useParams();
  const storeId = params.storeId as string | undefined;

  const sidebarOpen = useUiStore(selectSidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const t = useTranslations('nav');

  if (!storeId) {
    return null;
  }

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="w-60 p-0 bg-sidebar">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <span className="text-sm font-semibold text-sidebar-foreground">
            {t('appName')}
          </span>
        </div>
        <SidebarNav storeId={storeId} />
      </SheetContent>
    </Sheet>
  );
}
