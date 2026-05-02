# Frontend Hard Rules

This file contains the complete list of hard rules for the frontend architecture.

Every prompt MUST reference this file.
Every rule here is enforced without exception.

See the relevant file in docs/rules/ for context on each rule.

---

# Final Hard Rules (Definitive & Complete)

This section replaces all previous "Final Hard Rules" sections.

```text
NO HARDCODED COLORS          — token classes only.
NO HARDCODED TEXT            — t() translations only.
NO HARDCODED TOAST TEXT      — t() translations only.
NO HARDCODED URLS            — ROUTES config only.
NO MAGIC STRINGS             — config constants only.
NO ANY TYPE                  — TypeScript strict always.
NO LOCALSTORAGE FOR AUTH     — httpOnly cookies only.
NO MANUAL COOKIE READING     — withCredentials handles client.
NO CREDENTIALS INCLUDE RSC   — forward cookies() manually.
NO AXIOS IN RSC              — server API layer only.
NO FETCH IN CLIENT           — Axios client layer only.
NO RAW AXIOS ERRORS          — normalizeError() always.
NO INLINE QUERY KEYS         — queryKeys factory always.
NO FAT PAGES                 — pages compose only.
NO FAT COMPONENTS            — max 250 lines, split if over.
NO USEEFFECT FOR DATA       — RSC or TanStack Query only.
NO API CALLS IN COMPONENTS   — hooks only.
NO REVERSE LAYER IMPORTS     — follow import direction.
NO ALERT()                   — toast only.
NO CONSOLE.LOG               — logger utility only.
NO DIV BUTTONS               — semantic HTML only.
NO HIDDEN FILTER STATE       — sync with URL always.
NO UNTYPED QUERY PARAMS      — Zod filter schemas always.
NO UNVALIDATED UPLOADS       — client validate before send.
NO UNSANITIZED HTML          — DOMPurify before render.
NO CLIENT COMPONENT          — without a documented reason.
NO DOUBLE SUBMISSIONS        — disable on first click.
NO INLINE DATE FORMATTING    — date utility only.
NO DEEP BARREL CHAINS        — index.ts for public API only.
NO RAW API TYPES IN UI       — mappers always.
NO FRONTEND FLAG FOR SECURITY — backend flags for gates.
NO NAVIGATION IN HOOKS       — component layer only.
NO TOAST IN HOOKS            — component layer only.
NO DERIVED STATE IN STATE    — derive or useMemo only.
NO ZUSTAND FOR STOREID API   — URL params are source of truth.
NO REQUEST WITHOUT TIMEOUT   — 10s timeout always.
NO MUTATION AUTO-RETRY       — mutations never retry.
NO UNMATCHED TRANSLATION KEYS — en and ar must be identical.
NO UNDEBOUNCED SEARCH        — 300ms debounce always.
NO CROSS-DOMAIN HOOK CALLS   — same domain or shared only.
NO INSTANT RETRIES           — exponential backoff always.
NO NON-DEBOUNCED VALUES IN QUERY KEYS — debounced values only.
NO CROSS-NAMESPACE KEYS      — domain keys in domain files.
```
