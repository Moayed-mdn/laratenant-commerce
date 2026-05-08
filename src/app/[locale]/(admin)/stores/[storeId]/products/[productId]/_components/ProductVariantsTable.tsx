'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ProductVariantInput } from '@/types/product';
import { VariantCard } from './VariantCard';
import { VariantFormModal } from './VariantFormModal';

interface Props {
  variants: ProductVariantInput[];
  onChange: (variants: ProductVariantInput[]) => void;
}

export function ProductVariantsTable({ variants, onChange }: Props) {
  const t = useTranslations('products');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ProductVariantInput | null>(null);

  const filtered = useMemo(
    () =>
      variants.filter((variant) =>
        `${variant.label} ${variant.sku ?? ''}`.toLowerCase().includes(search.toLowerCase())
      ),
    [search, variants]
  );

  const duplicateVariant = (variant: ProductVariantInput) =>
    onChange([
      ...variants,
      {
        ...variant,
        id: undefined,
        key: `${variant.key}-copy-${Date.now()}`,
        label: `${variant.label} (${t('variantEditor.shared.copy')})`,
      },
    ]);

  return (
    <div className="space-y-4">
      <Input
        placeholder={t('variantEditor.variants.searchVariants')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('variantEditor.variants.label')}</TableHead>
              <TableHead>{t('variantEditor.variants.sku')}</TableHead>
              <TableHead>{t('variantEditor.variants.price')}</TableHead>
              <TableHead>{t('variantEditor.variants.quantity')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((variant) => (
              <TableRow key={variant.key}>
                <TableCell>{variant.label}</TableCell>
                <TableCell>{variant.sku ?? '—'}</TableCell>
                <TableCell>{variant.price}</TableCell>
                <TableCell>{variant.quantity}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(variant)}>{t('edit')}</Button>
                  <Button size="sm" variant="outline" onClick={() => duplicateVariant(variant)}>{t('variantEditor.shared.duplicate')}</Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onChange(variants.filter((x) => x.key !== variant.key))}
                  >
                    {t('delete')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 md:hidden">
        {filtered.map((variant) => (
          <VariantCard
            key={variant.key}
            variant={variant}
            onEdit={() => setEditing(variant)}
            onDuplicate={() => duplicateVariant(variant)}
            onDelete={() => onChange(variants.filter((x) => x.key !== variant.key))}
          />
        ))}
      </div>
      <Button
        variant="outline"
        onClick={() =>
          onChange([
            ...variants,
            {
              key: `manual-${Date.now()}`,
              label: `${t('variantEditor.variants.variant')} ${variants.length + 1}`,
              sku: null,
              barcode: null,
              price: 0,
              compare_at_price: null,
              cost_price: null,
              quantity: 0,
              low_stock_threshold: null,
              track_inventory: true,
              is_active: true,
              weight: null,
              weight_unit: null,
              attributes: [],
            },
          ])
        }
      >
        {t('variantEditor.variants.addVariant')}
      </Button>
      <VariantFormModal
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        value={editing}
        onSave={(next) => {
          onChange(variants.map((variant) => (variant.key === next.key ? next : variant)));
          setEditing(null);
        }}
      />
    </div>
  );
}
