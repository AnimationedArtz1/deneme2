import { api } from './client'
import type {
    User,
    UsersFilter,
    UsersResponse,
    CreateUserRequest,
    ResetPasswordRequest,
    ToggleActiveRequest,
    ApiResponse,
} from './types'

// ============================================
// User Management API Client
// ============================================

/**
 * Get list of users with optional filters
 */
export async function getUsers(
    filters: UsersFilter = {}
): Promise<ApiResponse<UsersResponse>> {
    const params = new URLSearchParams()

    if (filters.search) params.set('search', filters.search)
    if (filters.role && filters.role !== 'all') params.set('role', filters.role)
    if (filters.isActive !== undefined && filters.isActive !== 'all') {
        params.set('isActive', String(filters.isActive))
    }
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))

    const queryString = params.toString()
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`

    return api.get<UsersResponse>(endpoint)
}

/**
 * Create a new user
 */
export async function createUser(
    data: CreateUserRequest
): Promise<ApiResponse<User>> {
    return api.post<User>('/admin/users', data)
}

/**
 * Reset user password
 */
export async function resetPassword(
    userId: string,
    newPassword: string
): Promise<ApiResponse<void>> {
    return api.post<void>(`/admin/users/${userId}/reset-password`, {
        newPassword,
    } satisfies ResetPasswordRequest)
}

/**
 * Toggle user active status
 */
export async function toggleUserActive(
    userId: string,
    isActive: boolean
): Promise<ApiResponse<void>> {
    return api.post<void>(`/admin/users/${userId}/toggle-active`, {
        isActive,
    } satisfies ToggleActiveRequest)
}
