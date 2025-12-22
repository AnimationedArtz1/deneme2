'use server'

import { revalidatePath } from 'next/cache'

// HARDCODED Webhook URLs
const N8N_TRANSACTION_WEBHOOK = 'https://n8n.globaltripmarket.com/webhook/islem-ekle'
const N8N_CHATBOT_WEBHOOK = 'https://n8n.globaltripmarket.com/webhook/chatbot'
const N8N_DASHBOARD_DATA_WEBHOOK = 'https://n8n.globaltripmarket.com/webhook/dashboard-data'

export interface N8NResponse {
    success: boolean
    data?: unknown
    error?: string
}

export type Currency = 'TRY' | 'USD' | 'EUR'

export interface Transaction {
    id: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    category: string
    sub_category?: string
    description: string
    currency: Currency
    exchange_rate?: number
    transaction_date: string
    created_at: string
    file_url?: string
}

export interface CurrencyStats {
    income: number
    expense: number
    balance: number
}

export interface DashboardStats {
    TRY: CurrencyStats
    USD: CurrencyStats
    EUR: CurrencyStats
}

export interface DashboardData {
    transactions: Transaction[]
    stats: DashboardStats
    subCategories: string[]
}

/**
 * Fetch all dashboard data from n8n webhook
 * This replaces direct PostgreSQL access with webhook-based data fetching
 */
export async function fetchDashboardData(): Promise<DashboardData> {
    const emptyStats: DashboardStats = {
        TRY: { income: 0, expense: 0, balance: 0 },
        USD: { income: 0, expense: 0, balance: 0 },
        EUR: { income: 0, expense: 0, balance: 0 },
    }

    try {
        // Use POST method as n8n webhooks typically require POST
        const response = await fetch(N8N_DASHBOARD_DATA_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'fetch' }),
            cache: 'no-store', // Always fetch fresh data
        })

        if (!response.ok) {
            console.error('Dashboard data fetch failed:', response.status)
            return { transactions: [], stats: emptyStats, subCategories: [] }
        }

        const rawData = await response.json()
        console.log('Webhook raw response:', JSON.stringify(rawData).slice(0, 500))

        // Parse the n8n response format - handle multiple possible structures
        let rawTransactions: Array<{
            id: number
            amount: string
            type: string
            category: string
            sub_category?: string
            description: string
            currency?: string
            exchange_rate?: string
            transaction_date?: string
            created_at: string
            file_url?: string
        }> = []

        // Format 1: [{ data: [{ transactions: [...] }] }]
        if (Array.isArray(rawData) && rawData[0]?.data?.[0]?.transactions) {
            rawTransactions = rawData[0].data[0].transactions
        }
        // Format 2: { data: [{ transactions: [...] }] }
        else if (rawData?.data?.[0]?.transactions) {
            rawTransactions = rawData.data[0].transactions
        }
        // Format 3: { transactions: [...] }
        else if (rawData?.transactions) {
            rawTransactions = rawData.transactions
        }
        // Format 4: Direct array of transactions
        else if (Array.isArray(rawData) && rawData[0]?.id !== undefined) {
            rawTransactions = rawData
        }
        // Format 5: [{ transactions: [...] }]
        else if (Array.isArray(rawData) && rawData[0]?.transactions) {
            rawTransactions = rawData[0].transactions
        }

        // Collect unique sub-categories
        const subCategoriesSet = new Set<string>()

        // Transform and filter transactions
        const transactions: Transaction[] = rawTransactions
            .filter((t) =>
                t.description &&
                !t.description.includes('[object Object]') &&
                parseFloat(t.amount || '0') > 0
            )
            .map((t) => {
                // Add sub_category to set
                if (t.sub_category) {
                    subCategoriesSet.add(t.sub_category)
                }

                // Determine currency (default to TRY)
                let currency: Currency = 'TRY'
                if (t.currency === 'USD' || t.currency === 'EUR') {
                    currency = t.currency
                }

                return {
                    id: String(t.id),
                    amount: parseFloat(t.amount) || 0,
                    type: t.type as 'INCOME' | 'EXPENSE',
                    category: t.category || 'Diğer',
                    sub_category: t.sub_category,
                    description: t.description || '',
                    currency,
                    exchange_rate: t.exchange_rate ? parseFloat(t.exchange_rate) : undefined,
                    transaction_date: t.transaction_date || t.created_at?.split('T')[0] || '',
                    created_at: t.created_at || '',
                    file_url: t.file_url,
                }
            })
            // Sort by transaction_date (newest first)
            .sort((a, b) => {
                const dateA = new Date(a.transaction_date || a.created_at || 0).getTime()
                const dateB = new Date(b.transaction_date || b.created_at || 0).getTime()
                return dateB - dateA
            })

        // Calculate stats per currency
        const stats: DashboardStats = {
            TRY: { income: 0, expense: 0, balance: 0 },
            USD: { income: 0, expense: 0, balance: 0 },
            EUR: { income: 0, expense: 0, balance: 0 },
        }

        for (const t of transactions) {
            const curr = t.currency || 'TRY'
            if (t.type === 'INCOME') {
                stats[curr].income += t.amount
            } else {
                stats[curr].expense += t.amount
            }
        }

        // Calculate balances
        stats.TRY.balance = stats.TRY.income - stats.TRY.expense
        stats.USD.balance = stats.USD.income - stats.USD.expense
        stats.EUR.balance = stats.EUR.income - stats.EUR.expense

        console.log(`Processed ${transactions.length} transactions`)
        console.log(`Stats: TRY=${stats.TRY.balance}, USD=${stats.USD.balance}, EUR=${stats.EUR.balance}`)

        return {
            transactions,
            stats,
            subCategories: Array.from(subCategoriesSet).sort(),
        }
    } catch (error) {
        console.error('Dashboard data fetch error:', error)
        return { transactions: [], stats: emptyStats, subCategories: [] }
    }
}

/**
 * Send natural language transaction to n8n AI agent for parsing and saving
 * Example: "Ahmet'e 500 TL mazot parası verdim"
 */
export async function addTransaction(text: string, fileBase64?: string, fileName?: string): Promise<N8NResponse> {
    try {
        const body: Record<string, unknown> = {
            text,
            timestamp: new Date().toISOString()
        }

        // Add file data if provided
        if (fileBase64 && fileName) {
            body.file = {
                data: fileBase64,
                name: fileName,
            }
        }

        const response = await fetch(N8N_TRANSACTION_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` }
        }

        // Try to parse response, but treat any 200 OK as success
        try {
            const data = await response.json()
            // Check if response explicitly indicates failure
            if (data.success === false || data.error) {
                return { success: false, error: data.error || 'İşlem başarısız' }
            }
        } catch {
            // If JSON parsing fails but we got 200 OK, still consider it successful
        }

        // Revalidate all pages to refresh data
        revalidatePath('/')
        revalidatePath('/admin/dashboard')
        revalidatePath('/worker/dashboard')
        revalidatePath('/transactions')

        return { success: true }
    } catch (error) {
        console.error('N8N Transaction Error:', error)
        return {
            success: false,
            error: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.'
        }
    }
}

/**
 * AI Query for the Analyst Chat interface (General Assistant)
 * Sends user message to n8n chatbot for AI-powered analysis
 */
export async function aiQuery(userMessage: string, fileBase64?: string, fileName?: string): Promise<N8NResponse> {
    try {
        const body: Record<string, unknown> = {
            chatInput: userMessage
        }

        // Add file data if provided
        if (fileBase64 && fileName) {
            body.file = {
                data: fileBase64,
                name: fileName,
            }
        }

        const response = await fetch(N8N_CHATBOT_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` }
        }

        const data = await response.json()

        // Handle response format: { text: "...", success: true } or { output: "..." }
        if (data.text !== undefined) {
            return {
                success: data.success ?? true,
                data: { output: data.text }
            }
        }

        if (data.output !== undefined) {
            return { success: true, data: { output: data.output } }
        }

        // Fallback for legacy format
        return { success: true, data }
    } catch (error) {
        console.error('N8N Query Error:', error)
        return {
            success: false,
            error: 'AI bağlantısı kurulamadı. Lütfen tekrar deneyin.'
        }
    }
}
