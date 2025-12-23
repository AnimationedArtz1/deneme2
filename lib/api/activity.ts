import { api } from './client'
import type { ActivityFilter, ActivityResponse, ApiResponse } from './types'

// ============================================
// Activity / Audit API Client
// ============================================

/**
 * Get activity logs with optional filters
 */
export async function getActivityLogs(
    filters: ActivityFilter = {}
): Promise<ApiResponse<ActivityResponse>> {
    const params = new URLSearchParams()

    if (filters.userId) params.set('userId', filters.userId)
    if (filters.action && filters.action !== 'all') params.set('action', filters.action)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))

    const queryString = params.toString()
    const endpoint = `/admin/activity${queryString ? `?${queryString}` : ''}`

    return api.get<ActivityResponse>(endpoint)
}
