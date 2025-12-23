// API Configuration
// Falls back to hardcoded URL if environment variable is not set

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://n8n.globaltripmarket.com/webhook'

export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

/**
 * Generic API fetch wrapper with error handling
 */
export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const url = `${API_BASE_URL}${endpoint}`

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        })

        if (!response.ok) {
            return {
                success: false,
                error: `HTTP ${response.status}: ${response.statusText}`,
            }
        }

        const data = await response.json()

        // Handle n8n response formats
        if (data.error) {
            return { success: false, error: data.error }
        }

        if (data.success === false) {
            return { success: false, error: data.message || 'İşlem başarısız' }
        }

        return { success: true, data }
    } catch (error) {
        console.error('API Error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Bağlantı hatası',
        }
    }
}
