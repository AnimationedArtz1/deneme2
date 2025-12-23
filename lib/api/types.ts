// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
    ok: boolean
    data?: T
    message?: string
    error?: string
}

// ============================================
// Auth Types
// ============================================

export type UserRole = 'admin' | 'worker'

export interface AuthUser {
    id: string
    username: string
    displayName: string
    role: UserRole
}

export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse {
    ok: boolean
    message?: string
}

export interface LogoutResponse {
    ok: boolean
}

export interface MeResponse {
    authenticated: boolean
    user?: AuthUser
}

// ============================================
// User Management Types
// ============================================

export interface User {
    id: string
    username: string
    displayName: string
    role: UserRole
    isActive: boolean
    createdAt: string
    createdBy?: string
}

export interface CreateUserRequest {
    username: string
    displayName: string
    role: UserRole
    password: string
}

export interface ResetPasswordRequest {
    newPassword: string
}

export interface ToggleActiveRequest {
    isActive: boolean
}

export interface UsersFilter {
    search?: string
    role?: UserRole | 'all'
    isActive?: boolean | 'all'
    page?: number
    limit?: number
}

export interface UsersResponse {
    users: User[]
    total: number
    page: number
    totalPages: number
}

// ============================================
// Activity / Audit Types
// ============================================

export type ActivityAction =
    | 'LOGIN'
    | 'LOGOUT'
    | 'TRANSACTION_ADD'
    | 'CHAT_QUERY'
    | 'USER_CREATE'
    | 'USER_PASSWORD_RESET'
    | 'USER_TOGGLE_ACTIVE'

export interface ActivityActor {
    id: string
    username: string
    displayName: string
}

export interface ActivityItem {
    id: string
    createdAt: string
    actor: ActivityActor
    action: ActivityAction
    entityType?: string
    entityId?: string
    ip?: string
    payload?: Record<string, unknown>
}

export interface ActivityFilter {
    userId?: string
    action?: ActivityAction | 'all'
    from?: string
    to?: string
    page?: number
    limit?: number
}

export interface ActivityResponse {
    items: ActivityItem[]
    total: number
    page: number
    totalPages: number
}

// ============================================
// Password Validation
// ============================================

export interface PasswordValidation {
    isValid: boolean
    errors: string[]
}

export function validatePassword(password: string): PasswordValidation {
    const errors: string[] = []

    if (password.length < 10) {
        errors.push('Şifre en az 10 karakter olmalı')
    }
    if (!/[a-z]/.test(password)) {
        errors.push('En az bir küçük harf içermeli')
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('En az bir büyük harf içermeli')
    }
    if (!/[0-9]/.test(password)) {
        errors.push('En az bir rakam içermeli')
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
    const pattern = /^[a-z0-9._-]+$/
    if (!pattern.test(username)) {
        return {
            isValid: false,
            error: 'Kullanıcı adı sadece küçük harf, rakam, nokta, tire ve alt çizgi içerebilir',
        }
    }
    if (username.length < 3) {
        return { isValid: false, error: 'Kullanıcı adı en az 3 karakter olmalı' }
    }
    return { isValid: true }
}

export function generateStrongPassword(): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const special = '!@#$%^&*'
    const all = lowercase + uppercase + numbers + special

    let password = ''
    // Ensure at least one of each required type
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]

    // Fill remaining with random characters
    for (let i = 0; i < 8; i++) {
        password += all[Math.floor(Math.random() * all.length)]
    }

    // Shuffle the password
    return password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('')
}
