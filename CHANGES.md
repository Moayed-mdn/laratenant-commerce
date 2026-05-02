# Changes Summary

## Files Created:
- `src/types/auth.ts` — Auth response and request types

## Files Modified:
- None

## Details

### src/types/auth.ts (NEW)
Created new authentication types file with the following exports:

- **AuthUser**: Authenticated user interface returned after login or register
  - Includes all user fields: id, name, email, phone, avatar, email_verified_at, has_password, has_google_linked, created_at, updated_at
  - Includes `stores: UserStore[]` array imported from `@/types/store`

- **LoginResponse**: Raw API response from POST /api/v1/users/auth/login
  - Contains `token: string` and `user: AuthUser`

- **RegisterResponse**: Type alias for LoginResponse (same structure)

- **MeResponse**: Type alias for AuthUser (returned directly from GET /api/v1/users/auth/me)

- **LoginPayload**: Login request payload with email and password

- **RegisterPayload**: Register request payload with name, email, password, and password_confirmation

- **ForgotPasswordPayload**: Forgot password request payload with email

## Notes:
- ✅ AuthUser includes stores[] with UserStore type (imported from @/types/store)
- ✅ LoginResponse includes token and user
- ✅ MeResponse is AuthUser directly
- ✅ LoginPayload and RegisterPayload defined
- ✅ No existing type files were modified
- ✅ No components or API calls were modified
