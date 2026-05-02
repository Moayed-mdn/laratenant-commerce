# Frontend Security

This document contains the frontend security rules, sanitization, and CSP.

---

# 41. Frontend Security Rules

## Rules

- Never trust user-generated content — always sanitize before render
- Never use `dangerouslySetInnerHTML` without sanitization
- CSRF is handled automatically by Sanctum httpOnly cookies
- Never expose auth tokens in:
  - URL parameters
  - localStorage
  - sessionStorage
  - Component state
  - Log output
- Never expose internal store IDs in client-visible errors
- Content Security Policy (CSP) headers set by Next.js config

## Safe HTML Rendering (if needed)

```typescript
import DOMPurify from 'dompurify';

// Only when rendering user-generated HTML content
const clean = DOMPurify.sanitize(userContent);
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

## Rules

- `dangerouslySetInnerHTML` requires DOMPurify — no exceptions
- Sensitive data never logged (see Section 33)
- API errors never expose stack traces to UI
