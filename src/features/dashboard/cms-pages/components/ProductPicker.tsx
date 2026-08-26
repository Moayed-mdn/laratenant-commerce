'use client';

/**
 * Product picker for section content editors.
 * Multi-select product IDs with search/filter.
 */

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/products/useProducts';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface ProductPickerProps {
  storeSlug: string;
  selectedIds: (string | number)[];
  onChange: (ids: (string | number)[]) => void;
}

export function ProductPicker({ storeSlug, selectedIds, onChange }: ProductPickerProps) {
  const t = useTranslations('cmsPages.productPicker');
  const [search, setSearch] = useState('');
  // Every other search box in this app (Products, Orders, Users...) debounces
  // at 300ms before it hits the query key — this one didn't, so it fired a
  // fresh /products request on every single keystroke.
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useProducts(storeSlug, {
    page: 1,
    perPage: 50,
    search: debouncedSearch,
    status: 'all',
  });

  const products = data?.data ?? [];

  const toggleProduct = (id: string | number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((pid) => pid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeProduct = (id: string | number) => {
    onChange(selectedIds.filter((pid) => pid !== id));
  };

  return (
    <div className="space-y-3">
      {/* Selected products */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => {
            const product = products.find((p) => p.id === id);
            return (
              <Badge key={id} variant="secondary" className="gap-1">
                {product?.name ?? `Product #${id}`}
                <button
                  type="button"
                  onClick={() => removeProduct(id)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="space-y-2">
        <Label>{t('searchLabel')}</Label>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
        />
      </div>

      {/* Product list */}
      <div className="max-h-60 overflow-y-auto rounded border bg-background">
        {isLoading && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t('loading')}
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t('noProducts')}
          </div>
        )}

        {!isLoading &&
          products.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted border-b last:border-0 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {product.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('idLabel')} {product.id}
                  </div>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}
