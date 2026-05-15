#!/usr/bin/env bash
set -euo pipefail

# ── Config ────────────────────────────────────────────────────
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

# ── Create directory for shared component ─────────────────────
mkdir -p src/components/shared/categories

# ── 1. Create ParentCategorySelect ─────────────────────────────
cat > src/components/shared/categories/ParentCategorySelect.tsx <<'COMPONENT'
'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useCategories } from '@/hooks/categories/useCategories';
import { Button } from '@/components/ui/button';
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
import type { CategoryListItemView } from '@/types/category';

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Build a sorted, indented list from a flat category array.
 * Returns { id, name, depth } ordered so that parents appear before children.
 */
function buildCategoryTree(
  categories: CategoryListItemView[],
): { id: number; name: string; depth: number }[] {
  const byId = new Map<number, CategoryListItemView>();
  const childrenMap = new Map<number | null, number[]>();

  for (const cat of categories) {
    byId.set(cat.id, cat);
    const parentKey = cat.parentId;
    if (!childrenMap.has(parentKey)) {
      childrenMap.set(parentKey, []);
    }
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

/**
 * Recursively collect all descendant IDs for a given category.
 */
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

// ── Props ────────────────────────────────────────────────────────────────

interface ParentCategorySelectProps {
  storeId: string;
  value: number | null;
  onChange: (value: number | null) => void;
  excludeIds?: number[];
  disabled?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────

export function ParentCategorySelect({
  storeId,
  value,
  onChange,
  excludeIds = [],
  disabled = false,
}: ParentCategorySelectProps) {
  const t = useTranslations('categories');
  const [open, setOpen] = React.useState(false);

  // Fetch active categories with high perPage to get all
  const { data, isLoading } = useCategories(storeId, {
    is_active: 'true',
    page: 1,
    perPage: 1000,
  });

  const allCategories = data?.data ?? [];

  // Build tree, exclude forbidden IDs
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
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between"
        >
          <span className="truncate">
            {isLoading ? t('form.fields.loading') : selectedName}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={t('form.fields.searchParent')} />
          <CommandList>
            <CommandEmpty>{t('form.fields.noCategoriesFound')}</CommandEmpty>
            <CommandGroup>
              {/* No parent option */}
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
      </PopoverContent>
    </Popover>
  );
}
COMPONENT

echo "✔ Created src/components/shared/categories/ParentCategorySelect.tsx"

# ── 2. Update CreateCategoryForm ───────────────────────────────
cat > src/app/\[locale\]/\(admin\)/stores/\[storeId\]/categories/new/_components/CreateCategoryForm.tsx <<'CREATE'
'use client';

/**
 * Form for creating a new category.
 * Handles translations for EN + AR locales.
 */

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCreateCategory } from '@/hooks/categories/useCreateCategory';
import { CategoryFormInput, CategoryFormSchema, type CategoryFormValues } from '@/schemas/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParentCategorySelect } from '@/components/shared/categories/ParentCategorySelect';

interface Props {
  storeId: string;
}

const DEFAULT_TRANSLATIONS = [
  { locale: 'en' as const, name: '', slug: '' },
  { locale: 'ar' as const, name: '', slug: '' },
];

export default function CreateCategoryForm({ storeId }: Props) {
  const t      = useTranslations('categories');
  const create = useCreateCategory(storeId);

  const form = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver:      zodResolver(CategoryFormSchema),
    defaultValues: {
      slug:         '',
      parent_id:    null,
      sort_order:   0,
      is_active:    true,
      translations: DEFAULT_TRANSLATIONS,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name:    'translations',
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const isActive = watch('is_active');

  const onSubmit = async (values: CategoryFormValues) => {
    await create.mutateAsync({
      slug:         values.slug,
      parent_id:    values.parent_id,
      sort_order:   values.sort_order,
      is_active:    values.is_active,
      translations: values.translations,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('form.createTitle')}</h1>
          <p className="text-muted-foreground">{t('form.createSubtitle')}</p>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('form.creating') : t('form.create')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — Translations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('form.translations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="en">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                </TabsList>

                {fields.map((field, index) => (
                  <TabsContent key={field.id} value={field.locale} className="space-y-4 pt-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor={`translations.${index}.name`}>
                        {t('form.fields.name')}
                      </Label>
                      <Input
                        id={`translations.${index}.name`}
                        {...register(`translations.${index}.name`)}
                        placeholder={t('form.fields.namePlaceholder')}
                        dir={field.locale === 'ar' ? 'rtl' : 'ltr'}
                      />
                      {errors.translations?.[index]?.name && (
                        <p className="text-sm text-destructive">
                          {errors.translations[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                      <Label htmlFor={`translations.${index}.slug`}>
                        {t('form.fields.translationSlug')}
                      </Label>
                      <Input
                        id={`translations.${index}.slug`}
                        {...register(`translations.${index}.slug`)}
                        placeholder={t('form.fields.slugPlaceholder')}
                        className="font-mono"
                      />
                      {errors.translations?.[index]?.slug && (
                        <p className="text-sm text-destructive">
                          {errors.translations[index]?.slug?.message}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right — Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('form.settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Global slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">{t('form.fields.slug')}</Label>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder={t('form.fields.slugPlaceholder')}
                  className="font-mono"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>

              {/* Sort order */}
              <div className="space-y-2">
                <Label htmlFor="sort_order">{t('form.fields.sortOrder')}</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min={0}
                  {...register('sort_order', { valueAsNumber: true })}
                />
                {errors.sort_order && (
                  <p className="text-sm text-destructive">{errors.sort_order.message}</p>
                )}
              </div>

              {/* Is active */}
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">{t('form.fields.isActive')}</Label>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(v) => setValue('is_active', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Parent category selector */}
          <Card>
            <CardHeader>
              <CardTitle>{t('form.parentCategory')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ParentCategorySelect
                storeId={storeId}
                value={watch('parent_id')}
                onChange={(val) => setValue('parent_id', val, { shouldDirty: true })}
              />
              {errors.parent_id && (
                <p className="text-sm text-destructive mt-2">{errors.parent_id.message}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
CREATE

echo "✔ Updated CreateCategoryForm.tsx"

# ── 3. Update EditCategoryForm ─────────────────────────────────
cat > src/app/\[locale\]/\(admin\)/stores/\[storeId\]/categories/\[categoryId\]/edit/_components/EditCategoryForm.tsx <<'EDIT'
'use client';

/**
 * Form for editing an existing category.
 */

import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useUpdateCategory } from '@/hooks/categories/useUpdateCategory';
import { useCategories } from '@/hooks/categories/useCategories';
import { CategoryFormInput, CategoryFormSchema, type CategoryFormValues } from '@/schemas/categories';
import type { CategoryDetailView } from '@/types/category';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ParentCategorySelect, getDescendantIds } from '@/components/shared/categories/ParentCategorySelect';


interface Props {
  storeId:    string;
  categoryId: string;
  category:   CategoryDetailView;
}

export default function EditCategoryForm({ storeId, categoryId, category }: Props) {
  const t      = useTranslations('categories');
  const update = useUpdateCategory(storeId, categoryId);

  // Fetch all categories to compute descendant exclusion
  const { data: allCategoriesData, isLoading: isAllLoading } = useCategories(storeId, {
    is_active: 'all',
    page: 1,
    perPage: 1000,
  });
  const allCategories = allCategoriesData?.data ?? [];

  const excludeIds = useMemo(() => {
    const descendants = getDescendantIds(allCategories, category.id);
    return [category.id, ...descendants];
  }, [allCategories, category.id]);

  // Build translations ensuring both locales present
  const buildTranslations = () => {
    const locales: Array<'en' | 'ar'> = ['en', 'ar'];
    return locales.map((locale) => {
      const existing = category.translations.find((tr) => tr.locale === locale);
      return {
        locale,
        name: existing?.name ?? '',
        slug: existing?.slug ?? '',
      };
    });
  };

  const form = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver:      zodResolver(CategoryFormSchema),
    defaultValues: {
      slug:         category.slug,
      parent_id:    category.parentId,
      sort_order:   category.sortOrder,
      is_active:    category.isActive,
      translations: buildTranslations(),
    },
  });

  const { fields } = useFieldArray({ control: form.control, name: 'translations' });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const isActive = watch('is_active');

  // Sync form if category data changes
  useEffect(() => {
    reset({
      slug:         category.slug,
      parent_id:    category.parentId,
      sort_order:   category.sortOrder,
      is_active:    category.isActive,
      translations: buildTranslations(),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id]);

  const onSubmit = async (values: CategoryFormValues) => {
    await update.mutateAsync({
      slug:         values.slug,
      parent_id:    values.parent_id,
      sort_order:   values.sort_order,
      is_active:    values.is_active,
      translations: values.translations,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('form.editTitle')}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm font-mono">
              {category.slug}
            </p>
            {category.deletedAt && (
              <Badge variant="destructive" className="text-xs">
                {t('status.deleted')}
              </Badge>
            )}
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? t('form.saving') : t('form.save')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — Translations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('form.translations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="en">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                </TabsList>

                {fields.map((field, index) => (
                  <TabsContent
                    key={field.id}
                    value={field.locale}
                    className="space-y-4 pt-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`translations.${index}.name`}>
                        {t('form.fields.name')}
                      </Label>
                      <Input
                        id={`translations.${index}.name`}
                        {...register(`translations.${index}.name`)}
                        placeholder={t('form.fields.namePlaceholder')}
                        dir={field.locale === 'ar' ? 'rtl' : 'ltr'}
                      />
                      {errors.translations?.[index]?.name && (
                        <p className="text-sm text-destructive">
                          {errors.translations[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`translations.${index}.slug`}>
                        {t('form.fields.translationSlug')}
                      </Label>
                      <Input
                        id={`translations.${index}.slug`}
                        {...register(`translations.${index}.slug`)}
                        placeholder={t('form.fields.slugPlaceholder')}
                        className="font-mono"
                      />
                      {errors.translations?.[index]?.slug && (
                        <p className="text-sm text-destructive">
                          {errors.translations[index]?.slug?.message}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right — Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('form.settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">{t('form.fields.slug')}</Label>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder={t('form.fields.slugPlaceholder')}
                  className="font-mono"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">{t('form.fields.sortOrder')}</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min={0}
                  {...register('sort_order', { valueAsNumber: true })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">{t('form.fields.isActive')}</Label>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(v) => setValue('is_active', v, { shouldDirty: true })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Parent category selector */}
          <Card>
            <CardHeader>
              <CardTitle>{t('form.parentCategory')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isAllLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <ParentCategorySelect
                  storeId={storeId}
                  value={watch('parent_id')}
                  onChange={(val) => setValue('parent_id', val, { shouldDirty: true })}
                  excludeIds={excludeIds}
                />
              )}
              {errors.parent_id && (
                <p className="text-sm text-destructive mt-2">{errors.parent_id.message}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
EDIT

echo "✔ Updated EditCategoryForm.tsx"

echo ""
echo "✅ All changes applied successfully."
echo "Next steps:"
echo "  - Add the required translation keys to your locales (see implementation plan)."
echo "  - Run 'npm run build' or 'pnpm build' to verify."
echo "  - Test the parent selector in both Create and Edit forms."