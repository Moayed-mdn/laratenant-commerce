# Auth Feature

- login UI lives under `/{locale}/login`.
- login flow obtains CSRF cookie then posts credentials to Laravel auth endpoint.
- authenticated admin experience is mounted through `(dashboard)` layout hydration.
- logout and unauthorized flows clear client auth state and redirect to login.
