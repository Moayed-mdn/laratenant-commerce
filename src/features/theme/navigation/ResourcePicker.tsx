'use client';

/**
 * Resource Picker Component
 * 
 * Smart picker for selecting pages, categories, or products to link in navigation.
 * Shows a proper dropdown/combobox selector interface.
 */

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search, ExternalLink, CheckCircle2, ChevronsUpDown, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
import {
  useNavigationPages,
  useNavigationCategories,
  useNavigationProducts,
} from '@/hooks/navigation/useNavigationResources';
import type { NavigationMenuItem } from '@/types/navigation';
import { cn } from '@/lib/utils';

interface Props {
  storeSlug: string;
  type: 'page' | 'category' | 'product';
  selectedId: number | null;
  onSelect: (resource: {
    id: number;
    label: { en: string; ar: string };
    url: string;
    resourceType: string;
  }) => void;
}

export default function ResourcePicker({ storeSlug, type, selectedId, onSelect }: Props) {
  const locale = useLocale();
  const t = useTranslations('theme.navigation.resourcePicker');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number | null>(selectedId);

  // Sync internal value with prop
  useEffect(() => {
    setValue(selectedId);
  }, [selectedId]);

  // Fetch resources based on type (no search param - fetch all)
  const { data: pages, isLoading: loadingPages } = useNavigationPages(storeSlug);
  const { data: categories, isLoading: loadingCategories } = useNavigationCategories(storeSlug);
  const { data: products, isLoading: loadingProducts } = useNavigationProducts(storeSlug);

  // Get data and loading state based on type
  const resourceData = type === 'page' 
    ? pages 
    : type === 'category' 
    ? categories 
    : products;
  
  const isLoading = type === 'page' 
    ? loadingPages 
    : type === 'category' 
    ? loadingCategories 
    : loadingProducts;

  // Get resource type class name
  const getResourceTypeClass = () => {
    return `App\\Models\\${type === 'page' ? 'Cms\\Marketing\\Store\\StoreMarketingPage' : type === 'category' ? 'Category' : 'Product'}`;
  };

  // Handle resource selection
  const handleSelect = (resource: any) => {
    const label = type === 'page'
      ? resource.title
      : type === 'category'
      ? resource.name
      : resource.name;

    setValue(resource.id);
    onSelect({
      id: resource.id,
      label: label,
      url: resource.url,
      resourceType: getResourceTypeClass(),
    });
    setOpen(false);
  };

  // Get display label for a resource
  const getDisplayLabel = (resource: any) => {
    if (!resource) return '';
    
    const label = locale === 'ar'
      ? (type === 'page' ? resource.title?.ar : resource.name?.ar) || 
        (type === 'page' ? resource.title?.en : resource.name?.en)
      : (type === 'page' ? resource.title?.en : resource.name?.en);
    
    return label || '';
  };

  // Find selected resource
  const selectedResource = resourceData?.find((r: any) => {
    // Convert both to numbers for comparison to handle type mismatches
    return Number(r.id) === Number(value);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!resourceData || resourceData.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t('noResources', { type: t(`type.${type}`) })}
        </p>
        <Button variant="link" size="sm" className="mt-2">
          <ExternalLink className="mr-2 h-4 w-4" />
          {t('createNew', { type: t(`type.${type}`) })}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Combobox Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          className="inline-flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selectedResource ? (
            <span className="truncate">{getDisplayLabel(selectedResource)}</span>
          ) : (
            <span className="text-muted-foreground">
              {t('selectPlaceholder', { type: t(`type.${type}`) })}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder={t('searchPlaceholder', { type: t(`type.${type}`) })} 
            />
            <CommandList>
              <CommandEmpty>{t('noResults')}</CommandEmpty>
              <CommandGroup>
                {resourceData.map((resource: any) => {
                  const displayLabel = getDisplayLabel(resource);
                  const isSelected = resource.id === value;
                  
                  return (
                    <CommandItem
                      key={resource.id}
                      value={`${resource.id}-${displayLabel}`}
                      onSelect={() => handleSelect(resource)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {displayLabel}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {resource.url}
                        </p>
                      </div>
                      {type === 'page' && resource.status && (
                        <Badge
                          variant={resource.status === 'published' ? 'default' : 'secondary'}
                          className="ml-2 text-xs"
                        >
                          {resource.status}
                        </Badge>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Resource Info */}
      {selectedResource && (
        <div className="flex items-start gap-2 rounded-lg border bg-muted/50 p-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 text-success flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">
              {getDisplayLabel(selectedResource)}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {selectedResource.url}
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        {t('helpText', { type: t(`type.${type}`) })}
      </p>
    </div>
  );
}

