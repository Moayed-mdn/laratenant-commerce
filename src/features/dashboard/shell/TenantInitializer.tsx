'use client';

import { useEffect } from 'react';
import { useStoreStore } from '@/stores/storeStore';
import { AppType } from '@/lib/tenant/types';

interface TenantInitializerProps {
  appType: AppType;
  tenantSlug: string | null;
}

/**
 * Client component to sync tenant context from headers (via RSC) to Zustand.
 */
export function TenantInitializer({ appType, tenantSlug }: TenantInitializerProps) {
  useEffect(() => {
    useStoreStore.getState().setTenantContext(tenantSlug, appType);
  }, [appType, tenantSlug]);

  return null;
}
