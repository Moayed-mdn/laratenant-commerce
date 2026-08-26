'use client';

/**
 * Color Scheme Editor Dialog
 * Edit or create a color scheme
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from './ColorPicker';
import { toast } from 'sonner';
import type { ColorScheme } from '@/types/theme';

interface ColorSchemeEditorDialogProps {
  open: boolean;
  schemeKey: string;
  scheme: ColorScheme;
  isNew: boolean;
  existingKeys: string[];
  onSave: (key: string, scheme: ColorScheme) => void;
  onClose: () => void;
}

export function ColorSchemeEditorDialog({
  open,
  schemeKey,
  scheme,
  isNew,
  existingKeys,
  onSave,
  onClose,
}: ColorSchemeEditorDialogProps) {
  const t = useTranslations('theme-settings.colorSchemeEditor');
  const [key, setKey] = useState(schemeKey);
  const [name, setName] = useState(scheme.name);
  const [background, setBackground] = useState(scheme.background);
  const [text, setText] = useState(scheme.text);
  const [buttonBackground, setButtonBackground] = useState(scheme.button_background);
  const [buttonText, setButtonText] = useState(scheme.button_text);
  const [secondaryBackground, setSecondaryBackground] = useState(scheme.secondary_background);
  const [border, setBorder] = useState(scheme.border);

  const handleSave = () => {
    // Validation
    if (!name.trim()) {
      toast.error(t('errors.nameRequired'));
      return;
    }

    if (!key.trim()) {
      toast.error(t('errors.keyRequired'));
      return;
    }

    // Check for duplicate keys (only for new schemes or if key changed)
    if (isNew || key !== schemeKey) {
      if (existingKeys.includes(key)) {
        toast.error(t('errors.keyExists', { key }));
        return;
      }
    }

    // Validate key format (alphanumeric, underscores, hyphens only)
    if (!/^[a-z0-9_-]+$/i.test(key)) {
      toast.error(t('errors.keyFormat'));
      return;
    }

    onSave(key, {
      name: name.trim(),
      background,
      text,
      button_background: buttonBackground,
      button_text: buttonText,
      secondary_background: secondaryBackground,
      border,
    });

    toast.success(isNew ? t('createSuccess') : t('updateSuccess'));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? t('createTitle') : t('editTitle')}</DialogTitle>
          <DialogDescription>
            {t('dialogDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name and Key */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheme-name">{t('schemeName')}</Label>
              <Input
                id="scheme-name"
                placeholder={t('schemeNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t('schemeNameHelp')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheme-key">{t('schemeKey')}</Label>
              <Input
                id="scheme-key"
                placeholder={t('schemeKeyPlaceholder')}
                value={key}
                onChange={(e) => setKey(e.target.value.toLowerCase())}
                disabled={!isNew && schemeKey === 'default'}
              />
              <p className="text-xs text-muted-foreground">{t('schemeKeyHelp')}</p>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>{t('preview')}</Label>
            <div
              className="rounded-lg p-6 border-2"
              style={{
                backgroundColor: background,
                color: text,
                borderColor: border,
              }}
            >
              <h3 className="text-lg font-semibold mb-2">{t('previewHeading')}</h3>
              <p className="text-sm mb-4 opacity-90">
                {t('previewBody')}
              </p>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 rounded-lg font-medium text-sm"
                  style={{
                    backgroundColor: buttonBackground,
                    color: buttonText,
                  }}
                >
                  {t('previewPrimaryButton')}
                </button>
                <div
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: secondaryBackground,
                    color: text,
                  }}
                >
                  {t('previewSecondaryBackground')}
                </div>
              </div>
            </div>
          </div>

          {/* Color Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('fields.background.label')}</Label>
              <ColorPicker value={background} onChange={setBackground} />
              <p className="text-xs text-muted-foreground">{t('fields.background.help')}</p>
            </div>

            <div className="space-y-2">
              <Label>{t('fields.text.label')}</Label>
              <ColorPicker value={text} onChange={setText} />
              <p className="text-xs text-muted-foreground">{t('fields.text.help')}</p>
            </div>

            <div className="space-y-2">
              <Label>{t('fields.buttonBackground.label')}</Label>
              <ColorPicker value={buttonBackground} onChange={setButtonBackground} />
              <p className="text-xs text-muted-foreground">{t('fields.buttonBackground.help')}</p>
            </div>

            <div className="space-y-2">
              <Label>{t('fields.buttonText.label')}</Label>
              <ColorPicker value={buttonText} onChange={setButtonText} />
              <p className="text-xs text-muted-foreground">{t('fields.buttonText.help')}</p>
            </div>

            <div className="space-y-2">
              <Label>{t('fields.secondaryBackground.label')}</Label>
              <ColorPicker value={secondaryBackground} onChange={setSecondaryBackground} />
              <p className="text-xs text-muted-foreground">{t('fields.secondaryBackground.help')}</p>
            </div>

            <div className="space-y-2">
              <Label>{t('fields.border.label')}</Label>
              <ColorPicker value={border} onChange={setBorder} />
              <p className="text-xs text-muted-foreground">{t('fields.border.help')}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave}>
            {isNew ? t('createScheme') : t('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
