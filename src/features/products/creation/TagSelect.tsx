'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useTags } from '@/hooks/tags/useTags';
import { cn } from '@/lib/utils';

interface Props {
  storeId:  string;
  value:    number[];
  onChange: (next: number[]) => void;
}

export function TagSelect({ storeId, value, onChange }: Props) {
  const t = useTranslations('products');
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useTags(storeId);
  const tags = data?.data ?? [];

  const toggle = (id: number) => {
    onChange(value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id],
    );
  };

  const remove = (id: number) => onChange(value.filter((v) => v !== id));

  const selectedTags = tags.filter((tag) => value.includes(tag.id));

  return (
    <div className="space-y-2">
      <Label>{t('form.fields.tags')}</Label>

      <Popover open={open} onOpenChange={setOpen}>
        {/*
         * ✅ No asChild — PopoverTrigger is rendered as a <button> by default.
         *    Styling it directly avoids the Base UI Button incompatibility.
         */}
        <PopoverTrigger
          disabled={isLoading}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input',
            'bg-background px-3 py-2 text-sm font-normal ring-offset-background',
            'hover:bg-accent hover:text-accent-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <span className="text-muted-foreground">
            {isLoading
              ? t('form.fields.loading')
              : value.length === 0
                ? t('form.fields.tagsPlaceholder')
                : t('form.fields.tagsSelected', { count: value.length })}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder={t('form.fields.tagsSearch')} />
            <CommandList>
              <CommandEmpty>{t('form.fields.tagsEmpty')}</CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => toggle(tag.id)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value.includes(tag.id) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
              {tag.name}
              <button
                type="button"
                onClick={() => remove(tag.id)}
                className="rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag.name}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}