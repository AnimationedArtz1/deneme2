import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginUser, type LoginResponse } from '@/lib/api/auth'

export type UserRole = 'admin' | 'worker' | null

export interface User {
    id?: string
    username: string
    role: UserRole
    displayName: string
    isActive?: boolean
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (username: string, password: string) => {
                set({ isLoading: true })

                try {
                    const response = await loginUser({ username, password })

                    if (!response.success || !response.data) {
                        set({ isLoading: false })
                        return {
                            success: false,
                            error: response.error || 'Giriş başarısız'
                        }
                    }

                    const userData = response.data.user

                    // Check if user is active
                    if (userData.isActive === false) {
                        set({ isLoading: false })
                        return {
                            success: false,
                            error: 'Hesabınız devre dışı bırakılmış. Yönetici ile iletişime geçin.'
                        }
                    }

                    set({
                        user: {
                            id: userData.id,
                            username: userData.username,
                            role: userData.role,
                            displayName: userData.displayName,
                            isActive: userData.isActive,
                        },
                        isAuthenticated: true,
                        isLoading: false,
                    })

                    return { success: true }
                } catch (error) {
                    console.error('Login error:', error)
                    set({ isLoading: false })
                    return {
                        success: false,
                        error: 'Bağlantı hatası. Lütfen tekrar deneyin.'
                    }
                }
            },

            logout: () => {
                set({ user: null, isAuthenticated: false, isLoading: false })
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading })
            },
        }),
        {
            name: 'bestholiday-auth',
        }
    )
)
