'use client';

import { useCallback, useState } from 'react';
import { useBootstrapStore } from '@/stores/bootstrapStore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/config/routes';
import {
  Package,
  FolderTree,
  Palette,
  Settings,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CHECKLIST_KEY_PREFIX = 'merchant.post-onboarding-checklist';
const ITEMS_COUNT = 4;

interface ChecklistItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

function getItems(t: ReturnType<typeof useTranslations<'dashboard.postOnboarding.items'>>): ChecklistItem[] {
  return [
    {
      id: 'add-product',
      label: t('addProduct'),
      icon: Package,
      href: ROUTES.merchant.products.new(),
    },
    {
      id: 'create-category',
      label: t('createCategory'),
      icon: FolderTree,
      href: ROUTES.merchant.categories.new(),
    },
    {
      id: 'customize-theme',
      label: t('customizeTheme'),
      icon: Palette,
      href: ROUTES.merchant.theme.overview(),
    },
    {
      id: 'review-settings',
      label: t('reviewSettings'),
      icon: Settings,
      href: ROUTES.merchant.settings(),
    },
  ];
}

interface ChecklistState {
  dismissed: boolean;
  completedItems: string[];
}

function loadState(storeSlug: string): ChecklistState {
  if (typeof window === 'undefined') return { dismissed: false, completedItems: [] };
  try {
    const raw = localStorage.getItem(`${CHECKLIST_KEY_PREFIX}-${storeSlug}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        const state = {
          dismissed: Boolean(parsed.dismissed),
          completedItems: Array.isArray(parsed.completedItems) ? parsed.completedItems : [],
        };
        if (state.completedItems.length >= ITEMS_COUNT) {
          state.dismissed = true;
        }
        return state;
      }
    }
  } catch { /* ignore */ }
  return { dismissed: false, completedItems: [] };
}

function saveState(storeSlug: string, { dismissed, completedItems }: ChecklistState) {
  try {
    localStorage.setItem(
      `${CHECKLIST_KEY_PREFIX}-${storeSlug}`,
      JSON.stringify({ dismissed, completedItems }),
    );
  } catch { /* ignore */ }
}

export function PostOnboardingChecklist() {
  const activeStore = useBootstrapStore((state) => state.activeStore);
  const onboarding = useBootstrapStore((state) => state.onboarding);
  const t = useTranslations('dashboard.postOnboarding');
  const tItems = useTranslations('dashboard.postOnboarding.items');
  const tAria = useTranslations('dashboard.postOnboarding.aria');
  const ITEMS = getItems(tItems);
  const storeSlug = activeStore?.slug ?? '';

  const [state, setState] = useState<ChecklistState>(() => loadState(storeSlug));

  const persist = useCallback(
    (next: ChecklistState) => {
      setState(next);
      saveState(storeSlug, next);
    },
    [storeSlug],
  );

  const dismiss = useCallback(() => {
    persist({ dismissed: true, completedItems: state.completedItems });
  }, [persist, state.completedItems]);

  const toggleItem = useCallback(
    (id: string) => {
      const completed = state.completedItems.includes(id)
        ? state.completedItems.filter((i) => i !== id)
        : [...state.completedItems, id];
      const dismissed = completed.length >= ITEMS_COUNT;
      persist({ dismissed, completedItems: completed });
    },
    [persist, state.completedItems],
  );

  const completedCount = state.completedItems.length;
  const totalCount = ITEMS.length;

  if (state.dismissed) return null;
  if (!storeSlug || !onboarding?.is_completed) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <h3 className="text-sm font-semibold">{t('title')}</h3>
          <p className="text-xs text-muted-foreground">
            {t('progress', { count: completedCount, total: totalCount })}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('hide')}
        </button>
      </CardHeader>
      <CardContent className="pb-4">
        <ul className="space-y-2">
          {ITEMS.map((item) => {
            const done = state.completedItems.includes(item.id);
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/50',
                    done && 'text-muted-foreground',
                  )}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleItem(item.id);
                    }}
                    className="shrink-0 focus:outline-none"
                    aria-label={done ? tAria('markIncomplete', { label: item.label }) : tAria('markComplete', { label: item.label })}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className={cn(done && 'line-through')}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
