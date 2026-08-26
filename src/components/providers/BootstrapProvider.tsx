'use client';

import { useBootstrap } from '@/hooks/auth/useBootstrap';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/lib/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { getAuthChannelSource, getAuthChannelStorageKey, parseAuthChannelMessage } from '@/lib/auth/channel';
import { getLoginUrl, isSafeRedirectPath, stripLocale } from '@/lib/auth/redirects';
import { resolveBootstrapAccessState } from '@/lib/auth/bootstrap-routing';
import { ROUTES } from '@/config/routes';
import { queryKeys } from '@/lib/queryKeys';
import { Button } from '@/components/ui/button';
import { clearDashboardClientStorage } from '@/lib/auth/storage';
import { logUXEvent } from '@/lib/ux-events';
import { useTranslations } from 'next-intl';

interface BootstrapProviderProps {
  children: ReactNode;
}

export function BootstrapProvider({ children }: BootstrapProviderProps) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');
  const tBootstrap = useTranslations('bootstrap');
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine
  );
  const strippedPath = useMemo(() => stripLocale(pathname || '/'), [pathname]);
  const isProtectedRoute =
    strippedPath === ROUTES.dashboard.home() ||
    strippedPath.startsWith('/merchant') ||
    strippedPath.startsWith('/account');
  const isSetupRoute = strippedPath === ROUTES.setup();
  const isGuestRoute =
    strippedPath === ROUTES.auth.login() ||
    strippedPath === ROUTES.auth.signup() ||
    strippedPath.startsWith('/forgot-password') ||
    strippedPath.startsWith('/reset-password');
  
  const shouldBootstrap = isProtectedRoute || isSetupRoute || isGuestRoute;
  
  const bootstrapQuery = useBootstrap(shouldBootstrap);

  const bootstrap = useBootstrapStore((state) => state.bootstrap);
  const provisioning = useBootstrapStore((state) => state.provisioning);
  const isAuthenticated = useBootstrapStore((state) => state.isAuthenticated);
  const isBootstrapping = useBootstrapStore((state) => state.isBootstrapping);
  const bootstrapResolved = useBootstrapStore((state) => state.bootstrapResolved);
  const bootstrapError = useBootstrapStore((state) => state.bootstrapError);
  const clearSession = useBootstrapStore((state) => state.clearSession);
  const localeMatch = pathname?.match(/^\/(en|ar)(?:\/|$)/);
  const locale = localeMatch?.[1] ?? 'en';
  const accessState = useMemo(
    () => resolveBootstrapAccessState(bootstrap, provisioning),
    [bootstrap, provisioning]
  );
  const lastBootstrapRefreshAtRef = useRef(0);
  const lastChannelEventAtRef = useRef(0);
  const expiredSessionRedirectRef = useRef(false);
  const isOnboardingRoute = isSetupRoute;
  const isMerchantRoute = strippedPath.startsWith('/merchant');

  const requestBootstrapRefresh = useCallback(() => {
    if (!shouldBootstrap) return;
    const now = Date.now();
    if (now - lastBootstrapRefreshAtRef.current < 1000) {
      return;
    }

    lastBootstrapRefreshAtRef.current = now;
    void bootstrapQuery.refetch();
  }, [bootstrapQuery, shouldBootstrap]);

  /**
   * Auth boundary: unauthenticated user on a route that requires authentication.
   * These are hard boundaries where the shell cannot be meaningfully rendered.
   * All other redirects (authenticated user moving between pages) are "soft" and
   * should preserve the shell for an in-transition feel rather than full-screen takeover.
   */
  const isAuthBoundary = !isAuthenticated && (isProtectedRoute || isOnboardingRoute);

  const redirectTarget = useMemo(() => {
    if (!bootstrapResolved) {
      return null;
    }

    if (!isAuthenticated) {
      if (!(isProtectedRoute || isOnboardingRoute)) {
        return null;
      }

      const loginUrl = new URL(ROUTES.auth.login(), 'http://localhost');
      if (isSafeRedirectPath(strippedPath)) {
        loginUrl.searchParams.set('redirect', strippedPath);
      }
      if (expiredSessionRedirectRef.current) {
        loginUrl.searchParams.set('expired', '1');
      }

      return `${loginUrl.pathname}${loginUrl.search}`;
    }

    if (isGuestRoute) {
      // Users in mid-onboarding states should be allowed to visit /login freely
      // (e.g. clicking "Back to login" from the verify-email screen).
      // Without this exception the loop is: /login → isGuestRoute + pending_verification
      // → redirect to /setup → user clicks back → /login again, forever.
      if (
        accessState.kind === 'pending_verification' ||
        accessState.kind === 'create_store' ||
        accessState.kind === 'provisioning'
      ) {
        return null;
      }
      return accessState.redirectPath;
    }

    if (isMerchantRoute) {
      if (strippedPath === '/merchant' || strippedPath === '/merchant/') {
        return accessState.kind === 'ready' ? ROUTES.merchant.dashboard() : accessState.redirectPath;
      }

      if (accessState.kind === 'ready') {
        return null; // permit access
      }

      if (
        accessState.kind === 'create_store' ||
        accessState.kind === 'pending_verification' ||
        accessState.kind === 'provisioning'
      ) {
        return ROUTES.setup();
      }

      if (accessState.kind === 'blocked') {
        return ROUTES.dashboard.home();
      }
    }

    if (isOnboardingRoute) {
      if (accessState.kind === 'pending_verification') {
        return null; // stay on /setup, VerifyEmailStep will render
      }

      if (accessState.kind === 'create_store') {
        return null; // stay on /setup, CreateStoreStep will render
      }

      if (accessState.kind === 'provisioning') {
        return null; // stay on /setup, ProvisioningStep will render
      }

      if (accessState.kind === 'ready') {
        return null; // stay on /setup, SetupCompleteStep will render - let user choose their next action
      }

      return accessState.redirectPath;
    }

    if (strippedPath === ROUTES.dashboard.home()) {
      return accessState.kind === 'blocked' || accessState.kind === 'no_store'
        ? null
        : accessState.redirectPath;
    }

    return null;
  }, [
    accessState,
    bootstrapResolved,
    isAuthenticated,
    isGuestRoute,
    isOnboardingRoute,
    isProtectedRoute,
    locale,
    pathname,
    strippedPath,
  ]);

  // Handle multi-tab sync
  useEffect(() => {
    const bootstrapStorageKey = getAuthChannelStorageKey();

    const handleMessage = (data: unknown) => {
      const message = parseAuthChannelMessage(data);
      if (!message) {
        return;
      }

      if (message.source && message.source === getAuthChannelSource()) {
        return;
      }

      if (message.occurredAt > 0 && message.occurredAt <= lastChannelEventAtRef.current) {
        return;
      }

      if (message.occurredAt > 0) {
        lastChannelEventAtRef.current = message.occurredAt;
      }

      if (message.type === 'logout') {
        clearDashboardClientStorage();
        clearSession();
        queryClient.clear();
        queryClient.setQueryData(queryKeys.merchant.me(), null);
        return;
      }

      requestBootstrapRefresh();
    };

    if (typeof BroadcastChannel === 'undefined') {
      const onStorage = (event: StorageEvent) => {
        if (event.key !== bootstrapStorageKey || !event.newValue) {
          return;
        }

        try {
          handleMessage(JSON.parse(event.newValue) as unknown);
        } catch {
          // Ignore malformed cross-tab payloads.
        }
      };

      window.addEventListener('storage', onStorage);
      return () => {
        window.removeEventListener('storage', onStorage);
      };
    }

    const channel = new BroadcastChannel('auth_session');

    channel.onmessage = (event) => {
      handleMessage(event.data);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== bootstrapStorageKey || !event.newValue) {
        return;
      }

      try {
        handleMessage(JSON.parse(event.newValue) as unknown);
      } catch {
        // Ignore malformed cross-tab payloads.
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      channel.close();
    };
  }, [clearSession, queryClient, requestBootstrapRefresh]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const refreshBootstrap = () => {
      const shouldRefresh = isAuthenticated || isProtectedRoute || isOnboardingRoute || isMerchantRoute;
      if (!shouldRefresh) {
        return;
      }

      requestBootstrapRefresh();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshBootstrap();
      }
    };

    const onOnline = () => {
      setIsOnline(true);
      refreshBootstrap();
    };

    const onOffline = () => {
      setIsOnline(false);
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [isAuthenticated, isOnboardingRoute, isProtectedRoute, requestBootstrapRefresh]);

  useEffect(() => {
    if (isAuthenticated) {
      expiredSessionRedirectRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const onUnauthorized = () => {
      expiredSessionRedirectRef.current = true;
      clearDashboardClientStorage();
      clearSession();
      queryClient.clear();
      queryClient.setQueryData(queryKeys.merchant.me(), null);

      if (isProtectedRoute || isOnboardingRoute) {
        const loginPath = ROUTES.auth.login();
        const redirectParam = encodeURIComponent(strippedPath);
        router.push(`${loginPath}?redirect=${redirectParam}&expired=1`);
      }
    };

    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', onUnauthorized);
    };
  }, [clearSession, isOnboardingRoute, isProtectedRoute, router, strippedPath]);

  useEffect(() => {
    if (!redirectTarget) {
      return;
    }

    if (stripLocale(redirectTarget) === strippedPath) {
      return;
    }

    logUXEvent('redirect:bootstrap', { target: redirectTarget });
    router.push(redirectTarget);
  }, [redirectTarget, router, strippedPath]);

  const isInitialBootstrapping = !bootstrapResolved && isBootstrapping && shouldBootstrap;
  const isRefreshingWithoutData = !bootstrap && isBootstrapping && shouldBootstrap;

  // Full-screen loader ONLY for cases where the shell cannot be meaningfully rendered:
  // 1. Initial bootstrap (no data at all yet)
  // 2. Refresh without cached bootstrap data
  // 3. Auth boundary redirects (unauthenticated on protected route → login)
  // All other redirects are "soft" — the shell stays visible for an in-transition feel.
  const shouldShowFullScreenLoader =
    isInitialBootstrapping ||
    (isRefreshingWithoutData && isAuthBoundary) ||
    (isAuthBoundary && Boolean(redirectTarget));

  // Soft redirect: user is authenticated, but needs to move to a different page.
  // The shell stays visible; an in-shell transition indicator is shown.
  const isSoftRedirect = Boolean(redirectTarget) && !isAuthBoundary;

  if (shouldShowFullScreenLoader) {
    if (isInitialBootstrapping) logUXEvent('loader:fullscreen', { reason: 'initial-bootstrap' });
    else if (isRefreshingWithoutData) logUXEvent('loader:fullscreen', { reason: 'refresh-no-data' });
    else if (isAuthBoundary) logUXEvent('loader:fullscreen', { reason: 'auth-boundary' });
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            {isAuthBoundary ? t('preparingSession') : t('loadingDashboardSession')}
          </p>
        </div>
      </div>
    );
  }

  // ── Soft redirect: shell stays visible, show subtle in-shell transition bar ──
  if (isSoftRedirect) {
    logUXEvent('loader:soft', { redirectTarget });
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-primary/10">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary transition-all" />
        </div>
        {children}
      </>
    );
  }

  if (bootstrapError) {
    // Special handling for domain mismatch errors — must be checked FIRST
    // before route-specific error handling, since it applies regardless of route type.
    const isDomainMismatch = 
      bootstrapError.code === 'IDENTITY_DOMAIN_MISMATCH' || 
      bootstrapError.action === 'logout_required';

    console.log('[BootstrapProvider] Error detected:', {
      code: bootstrapError.code,
      action: bootstrapError.action,
      logoutUrl: bootstrapError.logoutUrl,
      isDomainMismatch,
    });

    if (isDomainMismatch && bootstrapError.logoutUrl) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center p-4 text-center">
          <h1 className="mb-2 text-2xl font-bold text-destructive">{tBootstrap('wrongAccountType.title')}</h1>
          <p className="mb-6 max-w-md text-muted-foreground">
            {bootstrapError.message || tBootstrap('wrongAccountType.description')}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => void bootstrapQuery.refetch()}
            >
              {tBootstrap('retry')}
            </Button>
            <Button
              onClick={async () => {
                try {
                  // Call the logout URL provided by the API
                  await fetch(bootstrapError.logoutUrl!, { 
                    method: 'POST',
                    credentials: 'include'
                  });
                  // Clear local session
                  clearSession();
                  clearDashboardClientStorage();
                  // Redirect to login
                  window.location.href = getLoginUrl(locale, pathname);
                } catch (error) {
                  console.error('Logout failed:', error);
                  // Still try to clear and redirect
                  clearSession();
                  clearDashboardClientStorage();
                  window.location.href = getLoginUrl(locale, pathname);
                }
              }}
            >
              {tBootstrap('logOutAndSwitch')}
            </Button>
          </div>
        </div>
      );
    }

    if (isProtectedRoute || isOnboardingRoute) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center p-4 text-center">
          <h1 className="mb-2 text-2xl font-bold text-destructive">{tBootstrap('failed.title')}</h1>
          <p className="mb-4 text-muted-foreground">
            {!isOnline
              ? tBootstrap('offline.protected')
              : bootstrapError.message || tBootstrap('failed.description')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => void bootstrapQuery.refetch()}>
              {tBootstrap('retry')}
            </Button>
            <Button variant="outline" onClick={() => router.push(ROUTES.auth.login())}>
              {tBootstrap('goToLogin')}
            </Button>
          </div>
        </div>
      );
    }

    if (isGuestRoute) {
      return (
        <>
          <div className="fixed inset-x-4 top-4 z-50 flex justify-center">
            <div className="w-full max-w-xl rounded-lg border border-destructive/30 bg-background px-4 py-3 text-sm shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-foreground">
                  {!isOnline
                    ? tBootstrap('offline.guest')
                    : bootstrapError.message || tBootstrap('guestFallback')}
                </p>
                <Button variant="outline" size="sm" onClick={() => void bootstrapQuery.refetch()}>
                  {tBootstrap('retry')}
                </Button>
              </div>
            </div>
          </div>
          {children}
        </>
      );
    }

    // Fallback error handling
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-2 text-2xl font-bold text-destructive">{tBootstrap('failed.title')}</h1>
        <p className="mb-4 text-muted-foreground">
          {bootstrapError.message || tBootstrap('failed.description')}
        </p>
        <Button onClick={() => void bootstrapQuery.refetch()}>
          {tBootstrap('retry')}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
