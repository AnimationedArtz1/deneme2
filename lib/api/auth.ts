import { api } from './client'
import type {
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    MeResponse,
} from './types'

// ============================================
// Auth API Client
// ============================================

/**
 * Login with username and password
 * Backend sets session/cookie on success
 */
export async function login(
    username: string,
    password: string
): Promise<{ ok: boolean; error?: string }> {
    const response = await api.post<LoginResponse>('/auth/login', {
        username: username.trim().toLowerCase(),
        password,
    } satisfies LoginRequest)

    if (!response.ok) {
        return {
            ok: false,
            error: response.error || 'Kullanıcı adı veya şifre hatalı.',
        }
    }

    return { ok: true }
}

/**
 * Logout current user
 * Backend clears session/cookie
 */
export async function logout(): Promise<{ ok: boolean; error?: string }> {
    const response = await api.post<LogoutResponse>('/auth/logout')

    if (!response.ok) {
        return {
            ok: false,
            error: response.error || 'Çıkış yapılırken hata oluştu.',
        }
    }

    return { ok: true }
}

/**
 * Get current authenticated user
 * Returns user info if authenticated, null otherwise
 */
export async function getCurrentUser(): Promise<MeResponse> {
    const response = await api.get<MeResponse>('/auth/me')

    if (!response.ok || !response.data) {
        return { authenticated: false }
    }

    return response.data
}
