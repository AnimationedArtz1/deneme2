import { apiFetch, type ApiResponse } from './config'

export interface ActivityItem {
    id: string
    action: string
    userId?: string
    username?: string
    details?: string
    metadata?: Record<string, unknown>
    timestamp: string
    ipAddress?: string
}

export interface ActivityListResponse {
    items: ActivityItem[]
}

// Human-readable action labels
const ACTION_LABELS: Record<string, { tr: string; en: string }> = {
    // Auth actions
    'LOGIN': { tr: 'Sisteme Giriş Yapıldı', en: 'User Logged In' },
    'LOGOUT': { tr: 'Sistemden Çıkış Yapıldı', en: 'User Logged Out' },
    'LOGIN_FAILED': { tr: 'Başarısız Giriş Denemesi', en: 'Failed Login Attempt' },

    // User management
    'USER_CREATE': { tr: 'Yeni Kullanıcı Oluşturuldu', en: 'New User Created' },
    'USER_UPDATE': { tr: 'Kullanıcı Güncellendi', en: 'User Updated' },
    'USER_DELETE': { tr: 'Kullanıcı Silindi', en: 'User Deleted' },
    'USER_TOGGLE': { tr: 'Kullanıcı Durumu Değiştirildi', en: 'User Status Changed' },
    'USER_DEACTIVATE': { tr: 'Kullanıcı Devre Dışı Bırakıldı', en: 'User Deactivated' },
    'USER_ACTIVATE': { tr: 'Kullanıcı Aktifleştirildi', en: 'User Activated' },

    // Transaction actions
    'TRANSACTION_CREATE': { tr: 'İşlem Eklendi', en: 'Transaction Added' },
    'TRANSACTION_UPDATE': { tr: 'İşlem Güncellendi', en: 'Transaction Updated' },
    'TRANSACTION_DELETE': { tr: 'İşlem Silindi', en: 'Transaction Deleted' },

    // System actions
    'SYSTEM_BACKUP': { tr: 'Sistem Yedeklendi', en: 'System Backup' },
    'SYSTEM_RESTORE': { tr: 'Sistem Geri Yüklendi', en: 'System Restored' },
    'SETTINGS_UPDATE': { tr: 'Ayarlar Güncellendi', en: 'Settings Updated' },

    // AI actions
    'AI_QUERY': { tr: 'AI Sorgusu Yapıldı', en: 'AI Query Made' },
    'AI_TRANSACTION': { tr: 'AI ile İşlem Eklendi', en: 'AI Transaction Added' },

    // File actions
    'FILE_UPLOAD': { tr: 'Dosya Yüklendi', en: 'File Uploaded' },
    'FILE_DELETE': { tr: 'Dosya Silindi', en: 'File Deleted' },

    // Default
    'UNKNOWN': { tr: 'Bilinmeyen İşlem', en: 'Unknown Action' },
}

/**
 * Get human-readable action label
 */
export function getActionLabel(action: string, language: 'tr' | 'en' = 'tr'): string {
    const label = ACTION_LABELS[action.toUpperCase()] || ACTION_LABELS['UNKNOWN']
    return label[language]
}

/**
 * Format activity timestamp
 */
export function formatActivityDate(timestamp: string, language: 'tr' | 'en' = 'tr'): string {
    const date = new Date(timestamp)
    return date.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Get all activity logs
 * GET /activity
 */
export async function getActivityLogs(): Promise<ApiResponse<ActivityListResponse>> {
    const response = await apiFetch<ActivityListResponse>('/activity', {
        method: 'GET',
    })

    // Handle various n8n response formats
    if (response.success && response.data) {
        // If data is array directly
        if (Array.isArray(response.data)) {
            return { success: true, data: { items: response.data as unknown as ActivityItem[] } }
        }
        // If data has items property
        if ((response.data as ActivityListResponse).items) {
            return response
        }
        // If data is wrapped in logs property
        const data = response.data as unknown as Record<string, unknown>
        if (data.logs && Array.isArray(data.logs)) {
            return { success: true, data: { items: data.logs as ActivityItem[] } }
        }
        if (data.activities && Array.isArray(data.activities)) {
            return { success: true, data: { items: data.activities as ActivityItem[] } }
        }
    }

    return response
}
