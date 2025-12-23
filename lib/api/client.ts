import type { ApiResponse } from './types'

// ============================================
// API Client Configuration
// ============================================

const API_BASE_URL = '/api'

export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

// ============================================
// Fetch Wrapper with Error Handling
// ============================================

interface FetchOptions extends RequestInit {
    timeout?: number
}

export async function apiClient<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<ApiResponse<T>> {
    const { timeout = 10000, ...fetchOptions } = options

    const url = `${API_BASE_URL}${endpoint}`

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...fetchOptions.headers,
            },
        })

        clearTimeout(timeoutId)

        // Try to parse JSON response
        let data: T | undefined
        try {
            data = await response.json()
        } catch {
            // Response might not be JSON
        }

        if (!response.ok) {
            // Handle specific HTTP errors
            if (response.status === 401) {
                return {
                    ok: false,
                    error: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.',
                }
            }
            if (response.status === 403) {
                return {
                    ok: false,
                    error: 'Bu işlem için yetkiniz yok.',
                }
            }
            if (response.status === 404) {
                return {
                    ok: false,
                    error: 'Backend endpoint bulunamadı. Lütfen daha sonra tekrar deneyin.',
                }
            }
            if (response.status >= 500) {
                return {
                    ok: false,
                    error: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
                }
            }

            return {
                ok: false,
                error: (data as { message?: string })?.message || 'Bir hata oluştu.',
            }
        }

        return {
            ok: true,
            data,
        }
    } catch (error) {
        clearTimeout(timeoutId)

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return {
                    ok: false,
                    error: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
                }
            }

            // Network error - backend might not be implemented yet
            if (error.message === 'Failed to fetch') {
                return {
                    ok: false,
                    error: 'Sunucuya bağlanılamadı. Backend henüz aktif değil.',
                }
            }
        }

        return {
            ok: false,
            error: 'Beklenmeyen bir hata oluştu.',
        }
    }
}

// ============================================
// Convenience Methods
// ============================================

export const api = {
    get: <T>(endpoint: string, options?: FetchOptions) =>
        apiClient<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
        apiClient<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        }),

    put: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
        apiClient<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        }),

    delete: <T>(endpoint: string, options?: FetchOptions) =>
        apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
}
