#!/usr/bin/env bash

# =============================================================================
# PART 3 — Categories UI (Pages + Components)
# =============================================================================

set -e

BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$BASE/src"

echo "🚀 Part 3: Categories UI..."
echo "📁 Base path: $BASE"

# =============================================================================
# HELPER
# =============================================================================

write_file() {
    local path="$1"
    local content="$2"
    mkdir -p "$(dirname "$path")"
    printf '%s' "$content" > "$path"
    echo "  ✅ $path"
}

CATEGORIES_DIR="$SRC/app/[locale]/(admin)/stores/[storeId]/categories"

# =============================================================================
# 1. LIST PAGE
# =============================================================================

echo ""
echo "📦 [1/6] Categories list page..."

write_file "$CATEGORIES_DIR/page.tsx" \
'/**
 * Categories list page.
 * Server component — thin wrapper with Suspense boundary.
 */

import { Suspense } from '"'"'react'"'"';
import { createSearchParamsCache, parseAsInteger, parseAsString } from '"'"'nuqs/server'"'"';
import { CategoryFiltersSchema } from '"'"'@/schemas/categories'"'"';
import type { CategoryFilters } from '"'"'@/schemas/categories'"'"';
import { logger } from '"'"'@/lib/logger'"'"';
import CategoriesContent from '"'"'./_components/CategoriesContent'"'"';
import { CategoriesSkeleton } from '"'"'./_components/CategoriesSkeleton'"'"';

const searchParamsCache = createSearchParamsCache({
  is_active: parseAsString.withDefault('"'"'all'"'"'),
  page:      parseAsInteger.withDefault(1),
  perPage:   parseAsInteger.withDefault(15),
});

export async function generateMetadata() {
  return {
    title:       '"'"'Categories'"'"',
    description: '"'"'Manage your store categories'"'"',
  };
}

export default async function CategoriesPage({
  params,
  searchParams,
}: {
  params:       Promise<{ storeId: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeId } = await params;
  const rawParams   = await searchParams;
  const parsed      = searchParamsCache.parse(rawParams);

  let filters: CategoryFilters;
  try {
    filters = CategoryFiltersSchema.parse(parsed);
  } catch {
    filters = CategoryFiltersSchema.parse({});
    logger.warn('"'"'Invalid category filters, using defaults'"'"', { parsed });
  }

  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesContent storeId={storeId} initialFilters={filters} />
    </Suspense>
  );
}
'

# =============================================================================
# 2. LIST COMPONENTS
# =============================================================================

echo ""
echo "📦 [2/6] Categories list components..."

write_file "$CATEGORIES_DIR/_components/CategoriesSkeleton.tsx" \
'/**
 * Skeleton loader for the categories list page.
 */

import { Skeleton } from '"'"'@/components/ui/skeleton'"'"';

export function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
'

write_file "$CATEGORIES_DIR/_components/CategoryStatusBadge.tsx" \
'/**
 * Badge component for category active/inactive status.
 */

import { Badge } from '"'"'@/components/ui/badge'"'"';
import { useTranslations } from '"'"'next-intl'"'"';

interface Props {
  isActive: boolean;
}

export function CategoryStatusBadge({ isActive }: Props) {
  const t = useTranslations('"'"'categories'"'"');

  return (
    <Badge variant={isActive ? '"'"'default'"'"' : '"'"'secondary'"'"'}>
      {isActive ? t('"'"'status.active'"'"') : t('"'"'status.inactive'"'"')}
    </Badge>
  );
}
'

write_file "$CATEGORIES_DIR/_components/CategoryFilters.tsx" \
''"'"'use client'"'"';

/**
 * Filter controls for the categories list.
 */

import { useTranslations } from '"'"'next-intl'"'"';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '"'"'@/components/ui/select'"'"';

interface Props {
  isActive:          '"'"'all'"'"' | '"'"'true'"'"' | '"'"'false'"'"';
  onIsActiveChange:  (value: '"'"'all'"'"' | '"'"'true'"'"' | '"'"'false'"'"') => void;
}

export default function CategoryFilters({
  isActive,
  onIsActiveChange,
}: Props) {
  const t = useTranslations('"'"'categories'"'"');

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={isActive}
        onValueChange={(v) =>
          onIsActiveChange(v as '"'"'all'"'"' | '"'"'true'"'"' | '"'"'false'"'"')
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('"'"'filters.allStatuses'"'"')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('"'"'filters.allStatuses'"'"')}</SelectItem>
          <SelectItem value="true">{t('"'"'status.active'"'"')}</SelectItem>
          <SelectItem value="false">{t('"'"'status.inactive'"'"')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
'

write_file "$CATEGORIES_DIR/_components/CategoriesTable.tsx" \
''"'"'use client'"'"';

/**
 * Categories table with pagination controls.
 */

import { useTranslations } from '"'"'next-intl'"'"';
import { Link } from '"'"'@/lib/navigation'"'"';
import { ROUTES } from '"'"'@/config/routes'"'"';
import type { CategoryListItemView } from '"'"'@/types/category'"'"';
import type { PaginationMeta } from '"'"'@/types/api'"'"';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '"'"'@/components/ui/table'"'"';
import { Button } from '"'"'@/components/ui/button'"'"';
import { Badge } from '"'"'@/components/ui/badge'"'"';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '"'"'@/components/ui/select'"'"';
import { CategoryStatusBadge } from '"'"'./CategoryStatusBadge'"'"';
import { makeLabelByValue, renderSelectValue, type SelectOption } from '"'"'@/lib/selectOptions'"'"';

interface Props {
  categories:      CategoryListItemView[];
  pagination:      PaginationMeta | undefined;
  page:            number;
  onPageChange:    (page: number) => void;
  perPage:         number;
  onPerPageChange: (perPage: number) => void;
  isLoading:       boolean;
  storeId:         string;
}

export default function CategoriesTable({
  categories,
  pagination,
  page,
  onPageChange,
  perPage,
  onPerPageChange,
  isLoading,
  storeId,
}: Props) {
  const t = useTranslations('"'"'categories'"'"');

  const perPageOptions = [
    { value: '"'"'10'"'"', label: '"'"'10'"'"' },
    { value: '"'"'15'"'"', label: '"'"'15'"'"' },
    { value: '"'"'25'"'"', label: '"'"'25'"'"' },
    { value: '"'"'50'"'"', label: '"'"'50'"'"' },
  ] as const satisfies readonly SelectOption<string>[];

  const perPageLabelByValue = makeLabelByValue(perPageOptions);

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('"'"'loading'"'"')}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('"'"'table.empty'"'"')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('"'"'table.name'"'"')}</TableHead>
              <TableHead>{t('"'"'table.slug'"'"')}</TableHead>
              <TableHead>{t('"'"'table.parent'"'"')}</TableHead>
              <TableHead>{t('"'"'table.products'"'"')}</TableHead>
              <TableHead>{t('"'"'table.status'"'"')}</TableHead>
              <TableHead>{t('"'"'table.sortOrder'"'"')}</TableHead>
              <TableHead>{t('"'"'table.created'"'"')}</TableHead>
              <TableHead className="text-right">{t('"'"'table.actions'"'"')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow
                key={category.id}
                className={category.deletedAt ? '"'"'opacity-60'"'"' : '"'"''"'"'}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {category.name}
                    {category.deletedAt && (
                      <Badge variant="destructive" className="text-xs">
                        {t('"'"'status.deleted'"'"')}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm font-mono">
                  {category.slug}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {category.parentId ? `#${category.parentId}` : '"'"'—'"'"'}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {category.productsCount}
                </TableCell>
                <TableCell>
                  <CategoryStatusBadge isActive={category.isActive} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {category.sortOrder}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {category.createdAt}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={ROUTES.store(storeId).categories.edit(String(category.id))}
                    className="inline-flex shrink-0 items-center justify-center rounded-[min(var(--radius-md),12px)] border border-transparent bg-clip-padding h-7 gap-1 px-2.5 text-[0.8rem] hover:bg-muted hover:text-foreground"
                  >
                    {t('"'"'table.edit'"'"')}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.from ?? 0} – {pagination.to ?? 0} {t('"'"'table.of'"'"')} {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={String(perPage)}
              onValueChange={(v) => onPerPageChange(Number(v))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue>
                  {renderSelectValue(perPageLabelByValue, t('"'"'table.perPage'"'"'))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {perPageOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                {t('"'"'table.previous'"'"')}
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {t('"'"'table.page'"'"', {
                  current: page,
                  total:   pagination.total_pages,
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= pagination.total_pages}
              >
                {t('"'"'table.next'"'"')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'

write_file "$CATEGORIES_DIR/_components/CategoriesContent.tsx" \
''"'"'use client'"'"';
// Reason: needs nuqs state sync and interactive filters

/**
 * Categories list page content (client component).
 * Manages filter and pagination state via URL (nuqs).
 */

import { useQueryState, parseAsInteger, parseAsString } from '"'"'nuqs'"'"';
import { parseAsStringLiteral } from '"'"'nuqs'"'"';
import { useCategories } from '"'"'@/hooks/categories/useCategories'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { Link } from '"'"'@/lib/navigation'"'"';
import { ROUTES } from '"'"'@/config/routes'"'"';
import { logger } from '"'"'@/lib/logger'"'"';
import { Button } from '"'"'@/components/ui/button'"'"';
import CategoriesTable from '"'"'./CategoriesTable'"'"';
import CategoryFilters from '"'"'./CategoryFilters'"'"';
import type { CategoryFilters as CategoryFiltersType } from '"'"'@/schemas/categories'"'"';

interface Props {
  storeId:        string;
  initialFilters: CategoryFiltersType;
}

const STATUS_OPTIONS = ['"'"'all'"'"', '"'"'true'"'"', '"'"'false'"'"'] as const;

export default function CategoriesContent({ storeId, initialFilters }: Props) {
  const t = useTranslations('"'"'categories'"'"');

  const [isActive, setIsActive] = useQueryState(
    '"'"'is_active'"'"',
    parseAsStringLiteral(STATUS_OPTIONS).withDefault(
      initialFilters.is_active as (typeof STATUS_OPTIONS)[number],
    ),
  );

  const [page, setPage] = useQueryState(
    '"'"'page'"'"',
    parseAsInteger.withDefault(initialFilters.page),
  );

  const [perPage, setPerPage] = useQueryState(
    '"'"'perPage'"'"',
    parseAsInteger.withDefault(initialFilters.perPage),
  );

  const filters: CategoryFiltersType = { is_active: isActive, page, perPage };

  const { data, isLoading, error } = useCategories(storeId, filters);

  if (error) {
    logger.error('"'"'Failed to load categories'"'"', { error });
  }

  const handleIsActiveChange = (value: '"'"'all'"'"' | '"'"'true'"'"' | '"'"'false'"'"') => {
    setIsActive(value);
    if (page !== 1) setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('"'"'title'"'"')}</h1>
          <p className="text-muted-foreground">{t('"'"'subtitle'"'"')}</p>
        </div>
        <Button asChild>
          <Link href={ROUTES.store(storeId).categories.new()}>
            {t('"'"'new'"'"')}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <CategoryFilters
        isActive={isActive}
        onIsActiveChange={handleIsActiveChange}
      />

      {/* Table */}
      <CategoriesTable
        categories={data?.data ?? []}
        pagination={data?.meta.pagination}
        page={page}
        onPageChange={setPage}
        perPage={perPage}
        onPerPageChange={setPerPage}
        isLoading={isLoading}
        storeId={storeId}
      />
    </div>
  );
}
'

# =============================================================================
# 3. NEW CATEGORY PAGE
# =============================================================================

echo ""
echo "📦 [3/6] New category page..."

write_file "$CATEGORIES_DIR/new/page.tsx" \
'/**
 * Create new category page.
 * Server component — thin wrapper.
 */

import { Link } from '"'"'@/lib/navigation'"'"';
import { ROUTES } from '"'"'@/config/routes'"'"';
import { Button } from '"'"'@/components/ui/button'"'"';
import CreateCategoryForm from '"'"'./_components/CreateCategoryForm'"'"';

export async function generateMetadata() {
  return {
    title:       '"'"'New Category'"'"',
    description: '"'"'Create a new category'"'"',
  };
}

export default async function NewCategoryPage({
  params,
}: {
  params: Promise<{ storeId: string; locale: string }>;
}) {
  const { storeId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.store(storeId).categories.list()}>
            ← Back to categories
          </Link>
        </Button>
      </div>
      <CreateCategoryForm storeId={storeId} />
    </div>
  );
}
'

write_file "$CATEGORIES_DIR/new/_components/CreateCategoryForm.tsx" \
''"'"'use client'"'"';

/**
 * Form for creating a new category.
 * Handles translations for EN + AR locales.
 */

import { useForm, useFieldArray } from '"'"'react-hook-form'"'"';
import { zodResolver } from '"'"'@hookform/resolvers/zod'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { useCreateCategory } from '"'"'@/hooks/categories/useCreateCategory'"'"';
import { CategoryFormSchema, type CategoryFormValues } from '"'"'@/schemas/categories'"'"';
import { Button } from '"'"'@/components/ui/button'"'"';
import { Input } from '"'"'@/components/ui/input'"'"';
import { Label } from '"'"'@/components/ui/label'"'"';
import { Switch } from '"'"'@/components/ui/switch'"'"';
import { Card, CardContent, CardHeader, CardTitle } from '"'"'@/components/ui/card'"'"';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '"'"'@/components/ui/tabs'"'"';

interface Props {
  storeId: string;
}

const DEFAULT_TRANSLATIONS = [
  { locale: '"'"'en'"'"' as const, name: '"'"''"'"', slug: '"'"''"'"' },
  { locale: '"'"'ar'"'"' as const, name: '"'"''"'"', slug: '"'"''"'"' },
];

export default function CreateCategoryForm({ storeId }: Props) {
  const t      = useTranslations('"'"'categories'"'"');
  const create = useCreateCategory(storeId);

  const form = useForm<CategoryFormValues>({
    resolver:      zodResolver(CategoryFormSchema),
    defaultValues: {
      slug:         '"'"''"'"',
      parent_id:    null,
      sort_order:   0,
      is_active:    true,
      translations: DEFAULT_TRANSLATIONS,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name:    '"'"'translations'"'"',
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const isActive = watch('"'"'is_active'"'"');

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
          <h1 className="text-2xl font-bold">{t('"'"'form.createTitle'"'"')}</h1>
          <p className="text-muted-foreground">{t('"'"'form.createSubtitle'"'"')}</p>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('"'"'form.creating'"'"') : t('"'"'form.create'"'"')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — Translations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('"'"'form.translations'"'"')}</CardTitle>
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
                        {t('"'"'form.fields.name'"'"')}
                      </Label>
                      <Input
                        id={`translations.${index}.name`}
                        {...register(`translations.${index}.name`)}
                        placeholder={t('"'"'form.fields.namePlaceholder'"'"')}
                        dir={field.locale === '"'"'ar'"'"' ? '"'"'rtl'"'"' : '"'"'ltr'"'"'}
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
                        {t('"'"'form.fields.translationSlug'"'"')}
                      </Label>
                      <Input
                        id={`translations.${index}.slug`}
                        {...register(`translations.${index}.slug`)}
                        placeholder={t('"'"'form.fields.slugPlaceholder'"'"')}
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
              <CardTitle>{t('"'"'form.settings'"'"')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Global slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">{t('"'"'form.fields.slug'"'"')}</Label>
                <Input
                  id="slug"
                  {...register('"'"'slug'"'"')}
                  placeholder={t('"'"'form.fields.slugPlaceholder'"'"')}
                  className="font-mono"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>

              {/* Sort order */}
              <div className="space-y-2">
                <Label htmlFor="sort_order">{t('"'"'form.fields.sortOrder'"'"')}</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min={0}
                  {...register('"'"'sort_order'"'"', { valueAsNumber: true })}
                />
                {errors.sort_order && (
                  <p className="text-sm text-destructive">{errors.sort_order.message}</p>
                )}
              </div>

              {/* Is active */}
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">{t('"'"'form.fields.isActive'"'"')}</Label>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(v) => setValue('"'"'is_active'"'"', v)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
'

# =============================================================================
# 4. EDIT CATEGORY PAGE
# =============================================================================

echo ""
echo "📦 [4/6] Edit category page..."

EDIT_DIR="$CATEGORIES_DIR/[categoryId]/edit"

write_file "$EDIT_DIR/page.tsx" \
'/**
 * Edit category page.
 * Server component — thin wrapper with Suspense.
 */

import { Suspense } from '"'"'react'"'"';
import { Link } from '"'"'@/lib/navigation'"'"';
import { ROUTES } from '"'"'@/config/routes'"'"';
import { Button } from '"'"'@/components/ui/button'"'"';
import EditCategoryContent from '"'"'./_components/EditCategoryContent'"'"';
import { EditCategorySkeleton } from '"'"'./_components/EditCategorySkeleton'"'"';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  return {
    title:       `Edit Category ${categoryId}`,
    description: '"'"'Update category details'"'"',
  };
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ storeId: string; categoryId: string; locale: string }>;
}) {
  const { storeId, categoryId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.store(storeId).categories.list()}>
            ← Back to categories
          </Link>
        </Button>
      </div>
      <Suspense fallback={<EditCategorySkeleton />}>
        <EditCategoryContent storeId={storeId} categoryId={categoryId} />
      </Suspense>
    </div>
  );
}
'

write_file "$EDIT_DIR/_components/EditCategorySkeleton.tsx" \
'/**
 * Skeleton loader for the edit category page.
 */

import { Skeleton } from '"'"'@/components/ui/skeleton'"'"';
import { Card, CardContent, CardHeader } from '"'"'@/components/ui/card'"'"';

export function EditCategorySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
'

write_file "$EDIT_DIR/_components/DeleteCategoryButton.tsx" \
''"'"'use client'"'"';

/**
 * Delete (soft) category button with confirmation dialog.
 */

import { useState } from '"'"'react'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { useDeleteCategory } from '"'"'@/hooks/categories/useDeleteCategory'"'"';
import { useRestoreCategory } from '"'"'@/hooks/categories/useRestoreCategory'"'"';
import { Button } from '"'"'@/components/ui/button'"'"';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '"'"'@/components/ui/dialog'"'"';

interface Props {
  storeId:    string;
  categoryId: string;
  isDeleted:  boolean;
}

export function DeleteCategoryButton({ storeId, categoryId, isDeleted }: Props) {
  const t       = useTranslations('"'"'categories'"'"');
  const [open, setOpen] = useState(false);

  const deleteMutation  = useDeleteCategory(storeId, categoryId);
  const restoreMutation = useRestoreCategory(storeId, categoryId);

  if (isDeleted) {
    return (
      <Button
        variant="outline"
        onClick={() => restoreMutation.mutate()}
        disabled={restoreMutation.isPending}
      >
        {restoreMutation.isPending
          ? t('"'"'form.restoring'"'"')
          : t('"'"'form.restore'"'"')}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
      >
        {t('"'"'form.delete'"'"')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('"'"'form.deleteTitle'"'"')}</DialogTitle>
            <DialogDescription>
              {t('"'"'form.deleteConfirm'"'"')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t('"'"'form.cancel'"'"')}
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                deleteMutation.mutate();
                setOpen(false);
              }}
            >
              {deleteMutation.isPending
                ? t('"'"'form.deleting'"'"')
                : t('"'"'form.delete'"'"')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
'

write_file "$EDIT_DIR/_components/EditCategoryForm.tsx" \
''"'"'use client'"'"';

/**
 * Form for editing an existing category.
 */

import { useEffect } from '"'"'react'"'"';
import { useForm, useFieldArray } from '"'"'react-hook-form'"'"';
import { zodResolver } from '"'"'@hookform/resolvers/zod'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { useUpdateCategory } from '"'"'@/hooks/categories/useUpdateCategory'"'"';
import { CategoryFormSchema, type CategoryFormValues } from '"'"'@/schemas/categories'"'"';
import type { CategoryDetailView } from '"'"'@/types/category'"'"';
import { Button } from '"'"'@/components/ui/button'"'"';
import { Input } from '"'"'@/components/ui/input'"'"';
import { Label } from '"'"'@/components/ui/label'"'"';
import { Switch } from '"'"'@/components/ui/switch'"'"';
import { Card, CardContent, CardHeader, CardTitle } from '"'"'@/components/ui/card'"'"';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '"'"'@/components/ui/tabs'"'"';
import { Badge } from '"'"'@/components/ui/badge'"'"';

interface Props {
  storeId:    string;
  categoryId: string;
  category:   CategoryDetailView;
}

export default function EditCategoryForm({ storeId, categoryId, category }: Props) {
  const t      = useTranslations('"'"'categories'"'"');
  const update = useUpdateCategory(storeId, categoryId);

  // Build translations ensuring both locales present
  const buildTranslations = () => {
    const locales: Array<'"'"'en'"'"' | '"'"'ar'"'"'> = ['"'"'en'"'"', '"'"'ar'"'"'];
    return locales.map((locale) => {
      const existing = category.translations.find((tr) => tr.locale === locale);
      return {
        locale,
        name: existing?.name ?? '"'"''"'"',
        slug: existing?.slug ?? '"'"''"'"',
      };
    });
  };

  const form = useForm<CategoryFormValues>({
    resolver:      zodResolver(CategoryFormSchema),
    defaultValues: {
      slug:         category.slug,
      parent_id:    category.parentId,
      sort_order:   category.sortOrder,
      is_active:    category.isActive,
      translations: buildTranslations(),
    },
  });

  const { fields } = useFieldArray({ control: form.control, name: '"'"'translations'"'"' });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const isActive = watch('"'"'is_active'"'"');

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
          <h1 className="text-2xl font-bold">{t('"'"'form.editTitle'"'"')}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm font-mono">
              {category.slug}
            </p>
            {category.deletedAt && (
              <Badge variant="destructive" className="text-xs">
                {t('"'"'status.deleted'"'"')}
              </Badge>
            )}
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? t('"'"'form.saving'"'"') : t('"'"'form.save'"'"')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — Translations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('"'"'form.translations'"'"')}</CardTitle>
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
                        {t('"'"'form.fields.name'"'"')}
                      </Label>
                      <Input
                        id={`translations.${index}.name`}
                        {...register(`translations.${index}.name`)}
                        placeholder={t('"'"'form.fields.namePlaceholder'"'"')}
                        dir={field.locale === '"'"'ar'"'"' ? '"'"'rtl'"'"' : '"'"'ltr'"'"'}
                      />
                      {errors.translations?.[index]?.name && (
                        <p className="text-sm text-destructive">
                          {errors.translations[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`translations.${index}.slug`}>
                        {t('"'"'form.fields.translationSlug'"'"')}
                      </Label>
                      <Input
                        id={`translations.${index}.slug`}
                        {...register(`translations.${index}.slug`)}
                        placeholder={t('"'"'form.fields.slugPlaceholder'"'"')}
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
              <CardTitle>{t('"'"'form.settings'"'"')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">{t('"'"'form.fields.slug'"'"')}</Label>
                <Input
                  id="slug"
                  {...register('"'"'slug'"'"')}
                  placeholder={t('"'"'form.fields.slugPlaceholder'"'"')}
                  className="font-mono"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">{t('"'"'form.fields.sortOrder'"'"')}</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min={0}
                  {...register('"'"'sort_order'"'"', { valueAsNumber: true })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">{t('"'"'form.fields.isActive'"'"')}</Label>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(v) => setValue('"'"'is_active'"'"', v, { shouldDirty: true })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Parent info (read-only) */}
          {category.parent && (
            <Card>
              <CardHeader>
                <CardTitle>{t('"'"'form.parentCategory'"'"')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category.parent.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {category.parent.slug}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </form>
  );
}
'

write_file "$EDIT_DIR/_components/EditCategoryContent.tsx" \
''"'"'use client'"'"';

/**
 * Edit category content.
 * Fetches category data then renders the form + delete button.
 */

import { useTranslations } from '"'"'next-intl'"'"';
import { useCategoryDetail } from '"'"'@/hooks/categories/useCategoryDetail'"'"';
import { EditCategorySkeleton } from '"'"'./EditCategorySkeleton'"'"';
import EditCategoryForm from '"'"'./EditCategoryForm'"'"';
import { DeleteCategoryButton } from '"'"'./DeleteCategoryButton'"'"';

interface Props {
  storeId:    string;
  categoryId: string;
}

export default function EditCategoryContent({ storeId, categoryId }: Props) {
  const t = useTranslations('"'"'categories'"'"');
  const { data: category, isLoading, error } = useCategoryDetail(storeId, categoryId);

  if (isLoading) return <EditCategorySkeleton />;

  if (error || !category) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('"'"'detail.error'"'"')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EditCategoryForm
        storeId={storeId}
        categoryId={categoryId}
        category={category}
      />

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
        <h3 className="font-semibold text-destructive mb-1">
          {t('"'"'form.dangerZone'"'"')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {category.deletedAt
            ? t('"'"'form.restoreDescription'"'"')
            : t('"'"'form.deleteDescription'"'"')}
        </p>
        <DeleteCategoryButton
          storeId={storeId}
          categoryId={categoryId}
          isDeleted={Boolean(category.deletedAt)}
        />
      </div>
    </div>
  );
}
'

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ PART 3 COMPLETE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  List page:"
echo "  ✅ categories/page.tsx"
echo "  ✅ categories/_components/CategoriesSkeleton.tsx"
echo "  ✅ categories/_components/CategoryStatusBadge.tsx"
echo "  ✅ categories/_components/CategoryFilters.tsx"
echo "  ✅ categories/_components/CategoriesTable.tsx"
echo "  ✅ categories/_components/CategoriesContent.tsx"
echo ""
echo "  New category:"
echo "  ✅ categories/new/page.tsx"
echo "  ✅ categories/new/_components/CreateCategoryForm.tsx"
echo ""
echo "  Edit category:"
echo "  ✅ categories/[categoryId]/edit/page.tsx"
echo "  ✅ categories/[categoryId]/edit/_components/EditCategorySkeleton.tsx"
echo "  ✅ categories/[categoryId]/edit/_components/DeleteCategoryButton.tsx"
echo "  ✅ categories/[categoryId]/edit/_components/EditCategoryForm.tsx"
echo "  ✅ categories/[categoryId]/edit/_components/EditCategoryContent.tsx"
echo ""
echo "▶  Run Part 4 next: Brands UI (pages + components)"
echo "════════════════════════════════════════════════════════════"