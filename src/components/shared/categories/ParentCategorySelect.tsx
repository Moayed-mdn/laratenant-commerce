// src/components/shared/categories/ParentCategorySelect.tsx
'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useCategories } from '@/hooks/categories/useCategories';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import type { CategoryListItemView } from '@/types/category';

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildCategoryTree(
  categories: CategoryListItemView[],
): { id: number; name: string; depth: number }[] {
  const byId = new Map<number, CategoryListItemView>();
  const childrenMap = new Map<number | null, number[]>();

  for (const cat of categories) {
    byId.set(cat.id, cat);
    const parentKey = cat.parentId;
    if (!childrenMap.has(parentKey)) childrenMap.set(parentKey, []);
    childrenMap.get(parentKey)!.push(cat.id);
  }

  const result: { id: number; name: string; depth: number }[] = [];

  function traverse(parentId: number | null, depth: number) {
    const children = childrenMap.get(parentId) ?? [];
    const sorted = children
      .map((id) => byId.get(id)!)
      .filter(Boolean)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);

    for (const cat of sorted) {
      result.push({ id: cat.id, name: cat.name, depth });
      traverse(cat.id, depth + 1);
    }
  }

  traverse(null, 0);
  return result;
}

export function getDescendantIds(
  categories: CategoryListItemView[],
  rootId: number,
): number[] {
  const childrenMap = new Map<number, number[]>();
  for (const cat of categories) {
    const pid = cat.parentId;
    if (pid !== null) {
      if (!childrenMap.has(pid)) childrenMap.set(pid, []);
      childrenMap.get(pid)!.push(cat.id);
    }
  }

  const result: number[] = [];
  const stack = [rootId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    const children = childrenMap.get(current) ?? [];
    for (const child of children) {
      result.push(child);
      stack.push(child);
    }
  }
  return result;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ParentCategorySelectProps {
  storeId: string;
  value: number | null;
  onChange: (value: number | null) => void;
  excludeIds?: number[];
  disabled?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ParentCategorySelect({
  storeId,
  value,
  onChange,
  excludeIds = [],
  disabled = false,
}: ParentCategorySelectProps) {
  const t = useTranslations('categories');
  const [open, setOpen] = React.useState(false);

  const { data, isLoading, isError, error } = useCategories(storeId, {
    is_active: 'true',
    page: 1,
    perPage: 100,
  });

  const allCategories = data?.data ?? [];

  const tree = React.useMemo(() => {
    const filtered = allCategories.filter((c) => !excludeIds.includes(c.id));
    return buildCategoryTree(filtered);
  }, [allCategories, excludeIds]);

  const selectedName = React.useMemo(() => {
    if (value === null) return t('form.fields.noParent');
    return allCategories.find((c) => c.id === value)?.name ?? String(value);
  }, [value, allCategories, t]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/*
        FIX: Base UI PopoverTrigger already renders a <button>.
        The previous code nested a <button> inside it → <button><button> →
        invalid HTML → hydration error.

        Solution: remove the inner <button> entirely. Apply button styles
        directly to PopoverTrigger via className. Base UI Trigger accepts
        all standard button props (disabled, className, type, children).

        Base UI does not have asChild (that is a Radix concept).
        The render prop exists in Base UI but is unnecessary here —
        the trigger IS the button.
      */}
      <PopoverTrigger
        disabled={disabled || isLoading}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'w-full justify-between',
        )}
      >
        <span className="truncate">
          {isLoading ? t('form.fields.loading') : selectedName}
        </span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        {isError ? (
          <p className="p-4 text-sm text-destructive">
            {error?.message ?? t('form.fields.loadError')}
          </p>
        ) : (
          <Command>
            <CommandInput placeholder={t('form.fields.searchParent')} />
            <CommandList>
              <CommandEmpty>{t('form.fields.noCategoriesFound')}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="__no_parent__"
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 size-4',
                      value === null ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {t('form.fields.noParent')}
                </CommandItem>

                {tree.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onChange(item.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <div
                      className="flex items-center"
                      style={{ paddingLeft: item.depth * 16 }}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4 shrink-0',
                          value === item.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}