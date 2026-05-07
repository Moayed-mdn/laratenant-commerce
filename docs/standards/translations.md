# Translation Standards

- use `next-intl` for all user-facing text.
- server components use server translation APIs; client uses `useTranslations`.
- keep locale key parity between `en` and `ar`.
- keep module namespaces stable (`dashboard`, `products`, `orders`, etc.).
- support RTL by respecting locale direction and layout behavior.
