'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export interface UseUnsavedChangesGuardOptions {
  isDirty: boolean;
  message?: string;
}

function getCurrentUrl() {
  if (typeof window === 'undefined') return '';
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function isModifiedClickEvent(e: MouseEvent) {
  return e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.button !== 0;
}

export function useUnsavedChangesGuard({ isDirty, message }: UseUnsavedChangesGuardOptions) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const confirmMessage = useMemo(
    () => message ?? 'You have unsaved changes. Are you sure you want to leave this page?',
    [message]
  );

  const bypassOnceRef = useRef(false);
  const currentUrlRef = useRef(getCurrentUrl());

  useEffect(() => {
    currentUrlRef.current = getCurrentUrl();
  }, [pathname, searchParams]);

  const bypassNextNavigation = useCallback(() => {
    bypassOnceRef.current = true;
    window.setTimeout(() => {
      bypassOnceRef.current = false;
    }, 0);
  }, []);

  const shouldBlockRef = useRef(isDirty);
  useEffect(() => {
    shouldBlockRef.current = isDirty;
  }, [isDirty]);

  const confirmIfDirty = useCallback(() => {
    if (!shouldBlockRef.current) return true;
    if (bypassOnceRef.current) return true;
    return window.confirm(confirmMessage);
  }, [confirmMessage]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldBlockRef.current) return;
      if (bypassOnceRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    const onDocumentClickCapture = (e: MouseEvent) => {
      if (!shouldBlockRef.current) return;
      if (bypassOnceRef.current) return;
      if (isModifiedClickEvent(e)) return;

      const target = e.target as Element | null;
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore same-page hash changes
      if (href.startsWith('#')) return;

      // Ignore new tab/window behaviors
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;
      if (anchor.getAttribute('rel')?.includes('external')) return;

      let nextUrl: URL;
      try {
        nextUrl = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      // Only guard same-origin navigations
      if (nextUrl.origin !== window.location.origin) return;

      const next = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      const current = getCurrentUrl();
      if (next === current) return;

      const ok = window.confirm(confirmMessage);
      if (ok) {
        bypassNextNavigation();
        // User confirmed leaving; allow navigation
        return;
      }

      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener('click', onDocumentClickCapture, true);
    return () => document.removeEventListener('click', onDocumentClickCapture, true);
  }, [bypassNextNavigation, confirmMessage]);

  useEffect(() => {
    const onPopState = () => {
      if (!shouldBlockRef.current) {
        currentUrlRef.current = getCurrentUrl();
        return;
      }

      if (bypassOnceRef.current) {
        currentUrlRef.current = getCurrentUrl();
        return;
      }

      const ok = window.confirm(confirmMessage);
      if (ok) {
        bypassNextNavigation();
        currentUrlRef.current = getCurrentUrl();
        return;
      }

      const restoreTo = currentUrlRef.current || '/';
      history.pushState(null, '', restoreTo);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [bypassNextNavigation, confirmMessage]);

  return {
    bypassNextNavigation,
    confirmIfDirty,
  };
}
