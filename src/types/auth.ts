import type { UserStore } from '@/types/store'

/** Authenticated user returned after login or register */
export interface AuthUser {
  id: number
  name: string
  email: string
  phone: string | null
  avatar: string | null
  email_verified_at: string | null
  has_password: boolean
  has_google_linked: boolean
  created_at: string
  updated_at: string
  stores: UserStore[]
}

/** Raw API response from POST /api/v1/users/auth/login */
export interface LoginResponse {
  token: string
  user: AuthUser
}

/** Raw API response from POST /api/v1/users/auth/register */
export type RegisterResponse = LoginResponse

/** Raw API response from GET /api/v1/users/auth/me */
export type MeResponse = AuthUser

/** Login request payload */
export interface LoginPayload {
  email: string
  password: string
}

/** Register request payload */
export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

/** Forgot password request payload */
export interface ForgotPasswordPayload {
  email: string
}
