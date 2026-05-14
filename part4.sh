#!/usr/bin/env bash

# =============================================================================
# PART 4 — Brands UI (Pages + Components)
# =============================================================================

set -e

BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$BASE/src"

echo "🚀 Part 4: Brands UI..."
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

BRANDS_DIR="$SRC/app/[locale]/(admin)/stores/[storeId]/brands"

# =============================================================================
# 1. LIST PAGE
# =============================================================================

echo ""
echo "📦 [1/6] Brands list page..."

write_file "$BRANDS_DIR/page.tsx" \
'/**
 * Brands list page.
 * Server component — thin wrapper with Suspense boundary.
 */

import { Suspense } from '"'"'react'"'"';
import { createSearchParamsCache, parseAsInteger, parseAsString } from '"'"'nuqs/server'"'"';
import { BrandFiltersSchema } from '"'"'@/schemas/brands'"'"';
import type { BrandFilters } from '"'"'@/schemas/brands'"'"';
import { logger } from '"'"'@/lib/logger'"'"';
import BrandsContent from '"'"'./_components/BrandsContent'"'"';
import { BrandsSkeleton } from '"'"'./_components/BrandsSkeleton'"'"';

const searchParamsCache = createSearchParamsCache({
  is_active: parseAsString.withDefault('"'"'all'"'"'),
  page:      parseAsInteger.withDefault(1),
  perPage:   parseAsInteger.withDefault(15),
});

export async function generateMetadata() {
  return {
    title:       '"'"'Brands'"'"',
    description: '"'"'Manage your store brands'"'"',
  };
}

export default async function BrandsPage({
  params,
  searchParams,
}: {
  params:       Promise<{ storeId: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeId } = await params;
  const rawParams   = await searchParams;
  const parsed      = searchParamsCache.parse(rawParams);

  let filters: BrandFilters;
  try {
    filters = BrandFiltersSchema.parse(parsed);
  } catch {
    filters = BrandFiltersSchema.parse({});
    logger.warn('"'"'Invalid brand filters, using defaults'"'"', { parsed });
  }

  return (
    <Suspense fallback={<BrandsSkeleton />}>
      <BrandsContent storeId={storeId} initialFilters={filters} />
    </Suspense>
  );
}
'

# =============================================================================
# 2. LIST COMPONENTS
# =============================================================================

echo ""
echo "📦 [2/6] Brands list components..."

write_file "$BRANDS_DIR/_components/BrandsSkeleton.tsx" \
'/**
 * Skeleton loader for the brands list page.
 */

import { Skeleton } from '"'"'@/components/ui/skeleton'"'"';

export function BrandsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Skeleton className="h-9 w-48" />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-md" />
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

write_file "$BRANDS_DIR/_components/BrandStatusBadge.tsx" \
'/**
 * Badge component for brand active/inactive status.
 */

import { Badge } from '"'"'@/components/ui/badge'"'"';
import { useTranslations } from '"'"'next-intl'"'"';

interface Props {
  isActive: boolean;
}

export function BrandStatusBadge({ isActive }: Props) {
  const t = useTranslations('"'"'brands'"'"');

  return (
    <Badge variant={isActive ? '"'"'default'"'"' : '"'"'secondary'"'"'}>
      {isActive ? t('"'"'status.active'"'"') : t('"'"'status.inactive'"'"')}
    </Badge>
  );
}
'

write_file "$BRANDS_DIR/_components/BrandFilters.tsx" \
''"'"'use client'"'"';

/**
 * Filter controls for the brands list.
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
  isActive:         '"'"'all'"'"' | '"'"'true'"'"' | '"'"'false'"'"';
  onIsActiveChange: (value: '"'"'all'"'"' | '"'"'true'"'"' | '"'"'false'"'"') => void;
}

export default function BrandFilters({ isActive, onIsActiveChange }: Props) {
  const t = useTranslations('"'"'brands'"'"');

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

write_file "$BRANDS_DIR/_components/BrandsTable.tsx" \
''"'"'use client'"'"';

/**
 * Brands table with pagination controls.
 */

import { useTranslations } from '"'"'next-intl'"'"';
import { Link } from '"'"'@/lib/navigation'"'"';
import { ROUTES } from '"'"'@/config/routes'"'"';
import type { BrandListItemView } from '"'"'@/types/brand'"'"';
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
import { BrandStatusBadge } from '"'"'./BrandStatusBadge'"'"';
import {
  makeLabelByValue,
  renderSelectValue,
  type SelectOption,
} from '"'"'@/lib/selectOptions'"'"';

interface Props {
  brands:          BrandListItemView[];
  pagination:      PaginationMeta | undefined;
  page:            number;
  onPageChange:    (page: number) => void;
  perPage:         number;
  onPerPageChange: (perPage: number) => void;
  isLoading:       boolean;
  storeId:         string;
}

export default function BrandsTable({
  brands,
  pagination,
  page,
  onPageChange,
  perPage,
  onPerPageChange,
  isLoading,
  storeId,
}: Props) {
  const t = useTranslations('"'"'brands'"'"');

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

  if (brands.length === 0) {
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
              <TableHead>{t('"'"'table.logo'"'"')}</TableHead>
              <TableHead>{t('"'"'table.name'"'"')}</TableHead>
              <TableHead>{t('"'"'table.slug'"'"')}</TableHead>
              <TableHead>{t('"'"'table.products'"'"')}</TableHead>
              <TableHead>{t('"'"'table.status'"'"')}</TableHead>
              <TableHead>{t('"'"'table.sortOrder'"'"')}</TableHead>
              <TableHead>{t('"'"'table.created'"'"')}</TableHead>
              <TableHead className="text-right">{t('"'"'table.actions'"'"')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow
                key={brand.id}
                className={brand.deletedAt ? '"'"'opacity-60'"'"' : '"'"''"'"'}
              >
                {/* Logo */}
                <TableCell>
                  {brand.logoUrl ? (
                    <div className="h-10 w-10 rounded-md border bg-muted overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </TableCell>

                {/* Name */}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {brand.name}
                    {brand.deletedAt && (
                      <Badge variant="destructive" className="text-xs">
                        {t('"'"'status.deleted'"'"')}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Slug */}
                <TableCell className="text-muted-foreground text-sm font-mono">
                  {brand.slug}
                </TableCell>

                {/* Products count */}
                <TableCell className="text-muted-foreground text-sm">
                  {brand.productsCount}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <BrandStatusBadge isActive={brand.isActive} />
                </TableCell>

                {/* Sort order */}
                <TableCell className="text-muted-foreground text-sm">
                  {brand.sortOrder}
                </TableCell>

                {/* Created at */}
                <TableCell className="text-muted-foreground text-sm">
                  {brand.createdAt}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <Link
                    href={ROUTES.store(storeId).brands.edit(String(brand.id))}
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

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.from ?? 0} – {pagination.to ?? 0}{' '}
            {t('"'"'table.of'"'"')} {pagination.total}
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

write_file "$BRANDS_DIR/_components/BrandsContent.tsx" \
''"'"'use client'"'"';
// Reason: needs nuqs state sync and interactive filters

/**
 * Brands list page content (client component).
 * Manages filter and pagination state via URL (nuqs).
 */

import { useQueryState, parseAsInteger, parseAsString } from '"'"'nuqs'"'"';
import { parseAsStringLiteral } from '"'"'nuqs'"'"';
import { useBrands } from '"'"'@/hooks/brands/useBrands'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { Link } from '"'"'@/lib/navigation'"'"';
import { ROUTES } from '"'"'@/config/routes'"'"';
import { logger } from '"'"'@/lib/logger'"'"';
import { Button } from '"'"'@/components/ui/button'"'"';
import BrandsTable from '"'"'./BrandsTable'"'"';
import BrandFilters from '"'"'./BrandFilters'"'"';
import type { BrandFilters as BrandFiltersType } from '"'"'@/schemas/brands'"'"';

interface Props {
  storeId:        string;
  initialFilters: BrandFiltersType;
}

const STATUS_OPTIONS = ['"'"'all'"'"', '"'"'true'"'"', '"'"'false'"'"'] as const;

export default function BrandsContent({ storeId, initialFilters }: Props) {
  const t = useTranslations('"'"'brands'"'"');

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

  const filters: BrandFiltersType = { is_active: isActive, page, perPage };

  const { data, isLoading, error } = useBrands(storeId, filters);

  if (error) {
    logger.error('"'"'Failed to load brands'"'"', { error });
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
          <Link href={ROUTES.store(storeId).brands.new()}>
            {t('"'"'new'"'"')}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <BrandFilters
        isActive={isActive}
        onIsActiveChange={handleIsActiveChange}
      />

      {/* Table */}
      <BrandsTable
        brands={data?.data ?? []}
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
# 3. NEW BRAND PAGE
# =============================================================================

echo ""
echo "📦 [3/6] New brand page..."

write_file "$BRANDS_DIR/new/page.tsx" \
'/**
 * Create new brand page.
 * Server component — thin wrapper.
 */

import { Link } from '"'"'@/lib/navigation'"'"';
import { ROUTES } from '"'"'@/config/routes'"'"';
import { Button } from '"'"'@/components/ui/button'"'"';
import CreateBrandForm from '"'"'./_components/CreateBrandForm'"'"';

export async function generateMetadata() {
  return {
    title:       '"'"'New Brand'"'"',
    description: '"'"'Create a new brand'"'"',
  };
}

export default async function NewBrandPage({
  params,
}: {
  params: Promise<{ storeId: string; locale: string }>;
}) {
  const { storeId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.store(storeId).brands.list()}>
            ← Back to brands
          </Link>
        </Button>
      </div>
      <CreateBrandForm storeId={storeId} />
    </div>
  );
}
'

write_file "$BRANDS_DIR/new/_components/CreateBrandForm.tsx" \
''"'"'use client'"'"';

/**
 * Form for creating a new brand.
 */

import { useForm } from '"'"'react-hook-form'"'"';
import { zodResolver } from '"'"'@hookform/resolvers/zod'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { useCreateBrand } from '"'"'@/hooks/brands/useCreateBrand'"'"';
import { BrandFormSchema, type BrandFormValues } from '"'"'@/schemas/brands'"'"';
import { Button } from '"'"'@/components/ui/button'"'"';
import { Input } from '"'"'@/components/ui/input'"'"';
import { Label } from '"'"'@/components/ui/label'"'"';
import { Switch } from '"'"'@/components/ui/switch'"'"';
import { Textarea } from '"'"'@/components/ui/textarea'"'"';
import { Card, CardContent, CardHeader, CardTitle } from '"'"'@/components/ui/card'"'"';

interface Props {
  storeId: string;
}

export default function CreateBrandForm({ storeId }: Props) {
  const t      = useTranslations('"'"'brands'"'"');
  const create = useCreateBrand(storeId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormValues>({
    resolver:      zodResolver(BrandFormSchema),
    defaultValues: {
      name:        '"'"''"'"',
      slug:        '"'"''"'"',
      description: null,
      logo_url:    null,
      sort_order:  0,
      is_active:   true,
    },
  });

  const isActive = watch('"'"'is_active'"'"');

  const onSubmit = async (values: BrandFormValues) => {
    await create.mutateAsync({
      name:        values.name,
      slug:        values.slug,
      description: values.description,
      logo_url:    values.logo_url,
      sort_order:  values.sort_order,
      is_active:   values.is_active,
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
        {/* Left — Main fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('"'"'form.details'"'"')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('"'"'form.fields.name'"'"')}</Label>
                <Input
                  id="name"
                  {...register('"'"'name'"'"')}
                  placeholder={t('"'"'form.fields.namePlaceholder'"'"')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('"'"'form.fields.description'"'"')}</Label>
                <Textarea
                  id="description"
                  {...register('"'"'description'"'"')}
                  placeholder={t('"'"'form.fields.descriptionPlaceholder'"'"')}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logo_url">{t('"'"'form.fields.logoUrl'"'"')}</Label>
                <Input
                  id="logo_url"
                  type="url"
                  {...register('"'"'logo_url'"'"')}
                  placeholder={t('"'"'form.fields.logoUrlPlaceholder'"'"')}
                />
                {errors.logo_url && (
                  <p className="text-sm text-destructive">{errors.logo_url.message}</p>
                )}
              </div>
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
              {/* Slug */}
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
# 4. EDIT BRAND PAGE
# =============================================================================

echo ""
echo "📦 [4/6] Edit brand page..."

EDIT_DIR="$BRANDS_DIR/[brandId]/edit"

write_file "$EDIT_DIR/page.tsx" \
'/**
 * Edit brand page.
 * Server component — thin wrapper with Suspense.
 */

import { Suspense } from '"'"'react'"'"';
import { Link } from '"'"'@/lib/navigation'"'"';
import { ROUTES } from '"'"'@/config/routes'"'"';
import { Button } from '"'"'@/components/ui/button'"'"';
import EditBrandContent from '"'"'./_components/EditBrandContent'"'"';
import { EditBrandSkeleton } from '"'"'./_components/EditBrandSkeleton'"'"';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;
  return {
    title:       `Edit Brand ${brandId}`,
    description: '"'"'Update brand details'"'"',
  };
}

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ storeId: string; brandId: string; locale: string }>;
}) {
  const { storeId, brandId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.store(storeId).brands.list()}>
            ← Back to brands
          </Link>
        </Button>
      </div>
      <Suspense fallback={<EditBrandSkeleton />}>
        <EditBrandContent storeId={storeId} brandId={brandId} />
      </Suspense>
    </div>
  );
}
'

write_file "$EDIT_DIR/_components/EditBrandSkeleton.tsx" \
'/**
 * Skeleton loader for the edit brand page.
 */

import { Skeleton } from '"'"'@/components/ui/skeleton'"'"';
import { Card, CardContent, CardHeader } from '"'"'@/components/ui/card'"'"';

export function EditBrandSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
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

write_file "$EDIT_DIR/_components/DeleteBrandButton.tsx" \
''"'"'use client'"'"';

/**
 * Delete (soft) brand button with confirmation dialog.
 */

import { useState } from '"'"'react'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { useDeleteBrand } from '"'"'@/hooks/brands/useDeleteBrand'"'"';
import { useRestoreBrand } from '"'"'@/hooks/brands/useRestoreBrand'"'"';
import { Button } from '"'"'@/components/ui/button'"'"';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '"'"'@/components/ui/dialog'"'"';

interface Props {
  storeId:   string;
  brandId:   string;
  isDeleted: boolean;
}

export function DeleteBrandButton({ storeId, brandId, isDeleted }: Props) {
  const t       = useTranslations('"'"'brands'"'"');
  const [open, setOpen] = useState(false);

  const deleteMutation  = useDeleteBrand(storeId, brandId);
  const restoreMutation = useRestoreBrand(storeId, brandId);

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
      <Button variant="destructive" onClick={() => setOpen(true)}>
        {t('"'"'form.delete'"'"')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('"'"'form.deleteTitle'"'"')}</DialogTitle>
            <DialogDescription>{t('"'"'form.deleteConfirm'"'"')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
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

write_file "$EDIT_DIR/_components/EditBrandForm.tsx" \
''"'"'use client'"'"';

/**
 * Form for editing an existing brand.
 */

import { useEffect } from '"'"'react'"'"';
import { useForm } from '"'"'react-hook-form'"'"';
import { zodResolver } from '"'"'@hookform/resolvers/zod'"'"';
import { useTranslations } from '"'"'next-intl'"'"';
import { useUpdateBrand } from '"'"'@/hooks/brands/useUpdateBrand'"'"';
import { BrandFormSchema, type BrandFormValues } from '"'"'@/schemas/brands'"'"';
import type { BrandDetailView } from '"'"'@/types/brand'"'"';
import { Button } from '"'"'@/components/ui/button'"'"';
import { Input } from '"'"'@/components/ui/input'"'"';
import { Label } from '"'"'@/components/ui/label'"'"';
import { Switch } from '"'"'@/components/ui/switch'"'"';
import { Textarea } from '"'"'@/components/ui/textarea'"'"';
import { Badge } from '"'"'@/components/ui/badge'"'"';
import { Card, CardContent, CardHeader, CardTitle } from '"'"'@/components/ui/card'"'"';

interface Props {
  storeId: string;
  brandId: string;
  brand:   BrandDetailView;
}

export default function EditBrandForm({ storeId, brandId, brand }: Props) {
  const t      = useTranslations('"'"'brands'"'"');
  const update = useUpdateBrand(storeId, brandId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BrandFormValues>({
    resolver:      zodResolver(BrandFormSchema),
    defaultValues: {
      name:        brand.name,
      slug:        brand.slug,
      description: brand.description,
      logo_url:    brand.logoUrl,
      sort_order:  brand.sortOrder,
      is_active:   brand.isActive,
    },
  });

  const isActive = watch('"'"'is_active'"'"');
  const logoUrl  = watch('"'"'logo_url'"'"');

  // Sync form when brand data changes
  useEffect(() => {
    reset({
      name:        brand.name,
      slug:        brand.slug,
      description: brand.description,
      logo_url:    brand.logoUrl,
      sort_order:  brand.sortOrder,
      is_active:   brand.isActive,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand.id]);

  const onSubmit = async (values: BrandFormValues) => {
    await update.mutateAsync({
      name:        values.name,
      slug:        values.slug,
      description: values.description,
      logo_url:    values.logo_url,
      sort_order:  values.sort_order,
      is_active:   values.is_active,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('"'"'form.editTitle'"'"')}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm font-mono">
              {brand.slug}
            </p>
            {brand.deletedAt && (
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
        {/* Left — Main fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('"'"'form.details'"'"')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('"'"'form.fields.name'"'"')}</Label>
                <Input
                  id="name"
                  {...register('"'"'name'"'"')}
                  placeholder={t('"'"'form.fields.namePlaceholder'"'"')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t('"'"'form.fields.description'"'"')}
                </Label>
                <Textarea
                  id="description"
                  {...register('"'"'description'"'"')}
                  placeholder={t('"'"'form.fields.descriptionPlaceholder'"'"')}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logo_url">{t('"'"'form.fields.logoUrl'"'"')}</Label>
                <Input
                  id="logo_url"
                  type="url"
                  {...register('"'"'logo_url'"'"')}
                  placeholder={t('"'"'form.fields.logoUrlPlaceholder'"'"')}
                />
                {errors.logo_url && (
                  <p className="text-sm text-destructive">
                    {errors.logo_url.message}
                  </p>
                )}
                {/* Logo preview */}
                {logoUrl && (
                  <div className="mt-2 h-16 w-16 rounded-md border bg-muted overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoUrl}
                      alt={brand.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>
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
              {/* Slug */}
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
                <Label htmlFor="sort_order">
                  {t('"'"'form.fields.sortOrder'"'"')}
                </Label>
                <Input
                  id="sort_order"
                  type="number"
                  min={0}
                  {...register('"'"'sort_order'"'"', { valueAsNumber: true })}
                />
                {errors.sort_order && (
                  <p className="text-sm text-destructive">
                    {errors.sort_order.message}
                  </p>
                )}
              </div>

              {/* Is active */}
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">{t('"'"'form.fields.isActive'"'"')}</Label>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(v) =>
                    setValue('"'"'is_active'"'"', v, { shouldDirty: true })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('"'"'form.stats'"'"')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('"'"'form.fields.productsCount'"'"')}
                </span>
                <span className="font-medium">{brand.productsCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('"'"'table.created'"'"')}
                </span>
                <span className="font-medium">{brand.createdAt}</span>
              </div>
              {brand.updatedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('"'"'form.fields.updatedAt'"'"')}
                  </span>
                  <span className="font-medium">{brand.updatedAt}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
'

write_file "$EDIT_DIR/_components/EditBrandContent.tsx" \
''"'"'use client'"'"';

/**
 * Edit brand content.
 * Fetches brand data then renders form + delete button.
 */

import { useTranslations } from '"'"'next-intl'"'"';
import { useBrandDetail } from '"'"'@/hooks/brands/useBrandDetail'"'"';
import { EditBrandSkeleton } from '"'"'./EditBrandSkeleton'"'"';
import EditBrandForm from '"'"'./EditBrandForm'"'"';
import { DeleteBrandButton } from '"'"'./DeleteBrandButton'"'"';

interface Props {
  storeId: string;
  brandId: string;
}

export default function EditBrandContent({ storeId, brandId }: Props) {
  const t = useTranslations('"'"'brands'"'"');
  const { data: brand, isLoading, error } = useBrandDetail(storeId, brandId);

  if (isLoading) return <EditBrandSkeleton />;

  if (error || !brand) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{t('"'"'detail.error'"'"')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EditBrandForm
        storeId={storeId}
        brandId={brandId}
        brand={brand}
      />

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
        <h3 className="font-semibold text-destructive mb-1">
          {t('"'"'form.dangerZone'"'"')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {brand.deletedAt
            ? t('"'"'form.restoreDescription'"'"')
            : t('"'"'form.deleteDescription'"'"')}
        </p>
        <DeleteBrandButton
          storeId={storeId}
          brandId={brandId}
          isDeleted={Boolean(brand.deletedAt)}
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
echo "✅ PART 4 COMPLETE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  List page:"
echo "  ✅ brands/page.tsx"
echo "  ✅ brands/_components/BrandsSkeleton.tsx"
echo "  ✅ brands/_components/BrandStatusBadge.tsx"
echo "  ✅ brands/_components/BrandFilters.tsx"
echo "  ✅ brands/_components/BrandsTable.tsx"
echo "  ✅ brands/_components/BrandsContent.tsx"
echo ""
echo "  New brand:"
echo "  ✅ brands/new/page.tsx"
echo "  ✅ brands/new/_components/CreateBrandForm.tsx"
echo ""
echo "  Edit brand:"
echo "  ✅ brands/[brandId]/edit/page.tsx"
echo "  ✅ brands/[brandId]/edit/_components/EditBrandSkeleton.tsx"
echo "  ✅ brands/[brandId]/edit/_components/DeleteBrandButton.tsx"
echo "  ✅ brands/[brandId]/edit/_components/EditBrandForm.tsx"
echo "  ✅ brands/[brandId]/edit/_components/EditBrandContent.tsx"
echo ""
echo "▶  Run Part 5 next: i18n (en + ar locale files)"
echo "════════════════════════════════════════════════════════════"