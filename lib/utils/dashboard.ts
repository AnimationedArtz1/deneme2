import type { Transaction } from '../actions/n8n'

/**
 * Calculate weekly stats from transactions (client-side utility)
 */
export function calculateWeeklyStats(transactions: Transaction[]): { name: string; gelir: number; gider: number }[] {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
    const weekData: Record<number, { gelir: number; gider: number }> = {}

    // Initialize all days
    for (let i = 0; i < 7; i++) {
        weekData[i] = { gelir: 0, gider: 0 }
    }

    // Aggregate transactions
    for (const t of transactions) {
        const date = new Date(t.date || t.created_at)
        if (date >= weekAgo) {
            const dayOfWeek = date.getDay()
            if (t.type === 'INCOME') {
                weekData[dayOfWeek].gelir += t.amount
            } else {
                weekData[dayOfWeek].gider += t.amount
            }
        }
    }

    return dayNames.map((name, i) => ({
        name,
        gelir: weekData[i].gelir,
        gider: weekData[i].gider,
    }))
}

/**
 * Calculate expense distribution by category (client-side utility)
 */
export function calculateExpenseDistribution(transactions: Transaction[]): { name: string; value: number; color: string }[] {
    const categoryTotals: Record<string, number> = {}
    const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899']

    for (const t of transactions) {
        if (t.type === 'EXPENSE') {
            const cat = t.category || 'Diğer'
            categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount
        }
    }

    return Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value], i) => ({
            name,
            value,
            color: colors[i % colors.length],
        }))
}
