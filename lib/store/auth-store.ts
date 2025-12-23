import { create } from 'zustand'
import type { AuthUser, UserRole } from '@/lib/api/types'

// Re-export for backward compatibility
export type { UserRole }

export interface User {
    id?: string
    username: string
    role: UserRole
    displayName: string
}

interface AuthState {
    // UI state only - NOT source of truth for auth
    user: User | null
    isAuthenticated: boolean
    isHydrated: boolean

    // Actions
    setUser: (user: AuthUser | null) => void
    clearUser: () => void
    setHydrated: (hydrated: boolean) => void
}

/**
 * Auth store for UI state hydration only.
 * 
 * IMPORTANT: This store is NOT the source of truth for authentication.
 * The actual auth state comes from the backend via /api/auth/me.
 * 
 * This store is used only for:
 * 1. Displaying user info in UI (name, role badge, etc.)
 * 2. Optimistic UI updates during login/logout
 * 
 * Page access control MUST be done via server-side checks or
 * API calls to /api/auth/me.
 */
export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    isAuthenticated: false,
    isHydrated: false,

    setUser: (authUser: AuthUser | null) => {
        if (authUser) {
            set({
                user: {
                    id: authUser.id,
                    username: authUser.username,
                    role: authUser.role,
                    displayName: authUser.displayName,
                },
                isAuthenticated: true,
            })
        } else {
            set({
                user: null,
                isAuthenticated: false,
            })
        }
    },

    clearUser: () => {
        set({
            user: null,
            isAuthenticated: false,
        })
    },

    setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated })
    },
}))

