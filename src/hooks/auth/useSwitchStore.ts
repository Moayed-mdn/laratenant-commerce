'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { queryKeys } from '@/lib/queryKeys';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { useRouter, usePathname } from '@/lib/navigation';
import { toast } from 'sonner';
import type { ApiError } from '@/types/api';
import { ROUTES } from '@/config/routes';
import { normalizeBackendRedirectPath, resolveBootstrapAccessState } from '@/lib/auth/bootstrap-routing';
import { postAuthChannelMessage } from '@/lib/auth/channel';
import { stripLocale } from '@/lib/auth/redirects';

export function useSwitchStore() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const switchStore = useBootstrapStore((state) => state.switchStore);
  const t = useTranslations('stores');

  return useMutation({
    mutationKey: ['store-switch'],
    mutationFn: (storeSlug: string) => switchStore(storeSlug),
    onMutate: async () => {
      await queryClient.cancelQueries({
        predicate: (query) =>
          query.queryKey[0] !== 'bootstrap' && query.queryKey[0] !== 'store-switch',
      });
    },
    onSuccess: async (bootstrap) => {
      if (!bootstrap) {
        router.push(ROUTES.dashboard.home());
        return;
      }

      queryClient.setQueryData(queryKeys.merchant.me(), bootstrap);
      queryClient.removeQueries({
        queryKey: ['provisioning-status'],
      });
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] !== 'merchant' &&
          query.queryKey[0] !== 'provisioning-status' &&
          query.queryKey[0] !== 'store-switch',
      });

      postAuthChannelMessage('active-store-changed', {
        activeStoreId: bootstrap.active_store_id,
      });
      toast.success(t('switchSuccess'));

      const accessState = resolveBootstrapAccessState(bootstrap);

      // If the new store is ready and the user is already on a merchant route,
      // stay on the current page — the page will re-render with the new store context.
      // Only redirect when the access state requires it (setup, blocked, etc.)
      // or when the user is not already on a merchant route.
      const strippedPath = stripLocale(pathname || '/');
      const isOnMerchantRoute = strippedPath.startsWith('/merchant');

      if (accessState.kind === 'ready' && isOnMerchantRoute) {
        return; // stay on current page
      }

      router.push(accessState.redirectPath);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || t('switchError'));
      if (error.code === 'STORE_ACCESS_DENIED') {
        void queryClient.invalidateQueries({ queryKey: queryKeys.merchant.me() });
        router.push(normalizeBackendRedirectPath(error.redirect) ?? ROUTES.dashboard.home());
      }
    },
  });
}
