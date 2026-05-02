# Frontend Forms

This document contains the React Hook Form, Zod, form UX standards, and file uploads rules.

---

# 11. Forms

All forms use React Hook Form + Zod.

```ts
const schema = z.object({
  name:  z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;
```

## Rules

- No uncontrolled inputs
- All validation via Zod schemas
- Form submission via TanStack Query mutations
- Error messages from API mapped to form fields

---

# 37. Form UX Standards

## Rules

- Disable submit button while form is submitting
- Show loading spinner inside submit button while submitting
- Focus first invalid field on validation error
- Reset form on success if it is a `create` form
- Do not reset form on success if it is an `edit` form
- Map API validation errors to form fields automatically
- No double submissions — disable button immediately on click

## Standard Submit Button Pattern

```tsx
<Button
  type="submit"
  disabled={isSubmitting || isPending}
>
  {isPending ? (
    <>
      <Spinner className="mr-2 h-4 w-4" />
      {t('common.saving')}
    </>
  ) : (
    t('common.save')
  )}
</Button>
```

## API Error → Form Field Mapping

```typescript
onError: (error: ApiError) => {
  if (error.errors) {
    Object.entries(error.errors).forEach(([field, messages]) => {
      form.setError(field as keyof FormData, {
        message: messages[0],
      });
    });
  } else {
    toast.error(error.message);
  }
},
```

## Rules

- Validation errors from API MUST appear on the correct field
- Generic errors (non-field) MUST appear as toast
- Never show raw error codes to users

---

# 40. File Upload Strategy

## Rules

- Use `multipart/form-data` for all file uploads
- Validate file size and type on client before upload
- Show upload progress for files over 1MB
- Show image preview before upload for image fields
- Show success and error feedback via toast
- Accepted types and max sizes defined in config

## Upload Config (`src/config/app.ts`)

```typescript
export const UPLOAD_CONFIG = {
  maxImageSize:     5 * 1024 * 1024,   // 5MB
  maxDocumentSize: 10 * 1024 * 1024,   // 10MB
  acceptedImageTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
} as const;
```

## Client Validation

```typescript
function validateFile(file: File): string | null {
  if (file.size > UPLOAD_CONFIG.maxImageSize) {
    return t('upload.too_large');
  }
  if (!UPLOAD_CONFIG.acceptedImageTypes.includes(file.type)) {
    return t('upload.invalid_type');
  }
  return null;
}
```

## Axios Upload with Progress

```typescript
export const uploadMedia = async (
  storeId: number,
  file: File,
  onProgress?: (percent: number) => void,
) => {
  const form = new FormData();
  form.append('file', file);

  const { data } = await api.post(
    `/admin/stores/${storeId}/media`,
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total) {
          onProgress?.(Math.round((e.loaded * 100) / e.total));
        }
      },
    },
  );

  return data;
};
```
