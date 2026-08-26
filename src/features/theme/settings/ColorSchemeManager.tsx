'use client';

/**
 * Color Scheme Manager Component
 * Manages color schemes for themes (Shopify-style approach)
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorSchemeCard } from './ColorSchemeCard';
import { ColorSchemeEditorDialog } from './ColorSchemeEditorDialog';
import type { ColorScheme } from '@/types/theme';

interface ColorSchemeManagerProps {
  colorSchemes: Record<string, ColorScheme>;
  onChange: (schemes: Record<string, ColorScheme>) => void;
}

export function ColorSchemeManager({ colorSchemes, onChange }: ColorSchemeManagerProps) {
  const t = useTranslations('theme-settings.colorSchemeManager');
  const [editingScheme, setEditingScheme] = useState<{ key: string; scheme: ColorScheme } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const schemes = Object.entries(colorSchemes);

  const handleEdit = (key: string) => {
    setEditingScheme({ key, scheme: colorSchemes[key] });
  };

  const handleDelete = (key: string) => {
    // Don't allow deleting 'default' scheme
    if (key === 'default') {
      return;
    }

    const updated = { ...colorSchemes };
    delete updated[key];
    onChange(updated);
  };

  const handleSave = (key: string, scheme: ColorScheme) => {
    onChange({
      ...colorSchemes,
      [key]: scheme,
    });
    setEditingScheme(null);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingScheme({
      key: '',
      scheme: {
        name: t('newSchemeDefaultName'),
        background: '#FFFFFF',
        text: '#1F2937',
        button_background: '#3B82F6',
        button_text: '#FFFFFF',
        secondary_background: '#F3F4F6',
        border: '#E5E7EB',
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>
              {t('description')}
            </CardDescription>
          </div>
          <Button onClick={handleCreateNew} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('addScheme')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemes.map(([key, scheme]) => (
            <ColorSchemeCard
              key={key}
              schemeKey={key}
              scheme={scheme}
              onEdit={() => handleEdit(key)}
              onDelete={() => handleDelete(key)}
              canDelete={key !== 'default'}
            />
          ))}

          {schemes.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              {t('empty')}
            </div>
          )}
        </div>

        {/* Editor Dialog */}
        {editingScheme && (
          <ColorSchemeEditorDialog
            open={true}
            schemeKey={editingScheme.key}
            scheme={editingScheme.scheme}
            isNew={isCreating}
            existingKeys={Object.keys(colorSchemes)}
            onSave={handleSave}
            onClose={() => {
              setEditingScheme(null);
              setIsCreating(false);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
