'use client';

/**
 * Repeater field for array items in section content.
 * Supports add, remove, and reorder (up/down) with collapsible cards.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface RepeaterFieldProps {
  items: unknown[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  renderItem: (index: number) => React.ReactNode;
  getItemLabel: (item: unknown, index: number) => string;
  addLabel?: string;
  emptyLabel?: string;
}

export function RepeaterField({
  items,
  onAdd,
  onRemove,
  onMoveUp,
  onMoveDown,
  renderItem,
  getItemLabel,
  addLabel,
  emptyLabel,
}: RepeaterFieldProps) {
  const t = useTranslations('cmsPages.sections');
  const resolvedAddLabel = addLabel ?? t('repeater.addItem');
  const resolvedEmptyLabel = emptyLabel ?? t('repeater.noItems');
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const toggleCollapse = (index: number) => {
    setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-3">
      {/* Add button */}
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-1" />
        {resolvedAddLabel}
      </Button>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">{resolvedEmptyLabel}</p>
        </div>
      )}

      {/* Item cards */}
      {items.map((item, index) => {
        const isCollapsed = collapsed[index] ?? false;

        return (
          <Card key={index} className="bg-muted/30">
            {/* Item header */}
            <CardHeader className="py-2 px-3">
              <div className="flex items-center gap-2">
                {/* Item label */}
                <span className="text-xs text-muted-foreground flex-1 truncate">
                  {getItemLabel(item, index)}
                </span>

                {/* Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Move up */}
                  <button
                    type="button"
                    onClick={() => onMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30"
                    title={t('moveUp')}
                  >
                    <ChevronUp className="h-3 w-3 text-muted-foreground" />
                  </button>

                  {/* Move down */}
                  <button
                    type="button"
                    onClick={() => onMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30"
                    title={t('moveDown')}
                  >
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>

                  {/* Collapse toggle */}
                  <button
                    type="button"
                    onClick={() => toggleCollapse(index)}
                    className="p-1 rounded hover:bg-muted"
                    title={isCollapsed ? t('expand') : t('collapse')}
                  >
                    {isCollapsed ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ChevronUp className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-1 rounded hover:bg-destructive/10 text-destructive"
                    title={t('removeItem')}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </CardHeader>

            {/* Item fields (collapsible) */}
            {!isCollapsed && (
              <CardContent className="pt-0 pb-3 px-3 space-y-3">
                {renderItem(index)}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
