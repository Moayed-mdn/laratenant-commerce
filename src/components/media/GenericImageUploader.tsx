'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IconOrImage } from '@/components/media/IconOrImage';
import { uploadImage, deleteImage } from '@/lib/api/media';
import type { MediaContext } from '@/types/media';

interface GenericImageUploaderProps {
  value: string; // image path or URL
  onChange: (path: string) => void;
  context: MediaContext;
  storeSlug: string;
  label?: string;
  disabled?: boolean;
  maxSizeMB?: number;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const DEFAULT_MAX_SIZE_MB = 5;

/**
 * Check if a value is likely a Lucide icon name (not a URL or path)
 */
function isLikelyIconName(value: string): boolean {
  return (
    !value.startsWith('http') &&
    !value.startsWith('/') &&
    !value.startsWith('storage/') &&
    !value.startsWith('media/') &&
    !/\.(svg|png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(value)
  );
}

export function GenericImageUploader({
  value,
  onChange,
  context,
  storeSlug,
  label,
  disabled = false,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
}: GenericImageUploaderProps) {
  const t = useTranslations('media.uploader');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resolvedLabel = label ?? t('defaultLabel');

  // Compute preview URL - handle icon names gracefully
  const previewUrl = value
    ? value.startsWith('http')
      ? value // External URL
      : isLikelyIconName(value)
      ? null // Don't try to load icon names as images
      : `${process.env.NEXT_PUBLIC_API_URL || ''}/storage/${value}` // Local path
    : null;

  // Validate file
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return t('errors.invalidType');
      }

      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return t('errors.tooLarge', { maxSizeMB });
      }

      return null;
    },
    [maxSizeMB, t]
  );

  // Upload file
  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        setUploading(true);
        setUploadProgress(0);

        // Simulate progress (since fetch doesn't provide real progress)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
        }, 100);

        const response = await uploadImage(storeSlug, context, file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        // Update parent with path
        onChange(response.data.path);

        // Reset progress after short delay
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.uploadFailed'));
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [storeSlug, context, onChange, validateFile, t]
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [uploadFile]
  );

  // Handle drag & drop
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = event.dataTransfer.files[0];
      if (file) {
        uploadFile(file);
      }
    },
    [disabled, uploadFile]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Trigger file input click
  const triggerFileInput = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  // Handle remove
  const handleRemove = useCallback(async () => {
    if (!value || disabled) return;

    if (!confirm(t('confirmDelete'))) {
      return;
    }

    try {
      await deleteImage(storeSlug, context, value);
      onChange('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.deleteFailed'));
    }
  }, [value, disabled, storeSlug, context, onChange, t]);

  return (
    <div className="space-y-3">
      {resolvedLabel && (
        <Label className="text-sm font-medium text-foreground">{resolvedLabel}</Label>
      )}

      {/* Upload Area */}
      {!previewUrl && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center
            transition-colors cursor-pointer
            ${isDragging ? 'border-primary bg-primary-light' : 'border-border-strong hover:border-subtle'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled}
          />

          <div className="flex flex-col items-center">
            {uploading ? (
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
            ) : (
              <Upload className="w-12 h-12 text-subtle mb-3" />
            )}

            {!uploading && (
              <>
                <p className="text-sm text-muted mb-1">
                  <span className="font-semibold text-primary">{t('clickToUpload')}</span>
                  {' '}{t('orDragAndDrop')}
                </p>
                <p className="text-xs text-subtle">
                  {t('acceptedFormats', { maxSizeMB })}
                </p>
              </>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4">
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted mt-1">
                {t('uploading', { progress: uploadProgress })}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 text-sm text-danger">{error}</div>
          )}
        </div>
      )}

      {/* Preview Area */}
      {(previewUrl || (value && isLikelyIconName(value))) && (
        <div className="relative">
          <div className="relative border-2 border-border rounded-lg overflow-hidden bg-muted/30">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={t('previewAlt')}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  // Hide broken image
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              /* Icon preview */
              <div className="w-full h-48 flex items-center justify-center bg-primary/5">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconOrImage 
                      value={value} 
                      className="h-8 w-8" 
                      alt=""
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{t('iconLabel')} <span className="font-mono">{value}</span></p>
                </div>
              </div>
            )}
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full shadow-lg"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{t('deleteImage')}</span>
              </Button>
            )}
          </div>
          <p className="text-xs text-subtle mt-2">{t('pathLabel')} {value}</p>
        </div>
      )}
    </div>
  );
}
