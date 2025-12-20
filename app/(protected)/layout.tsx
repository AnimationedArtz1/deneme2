import { getDashboardStats, getRecentTransactions } from "@/lib/actions/db"
import { ProtectedLayoutClient } from "./protected-layout-client"

export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Fetch real data from PostgreSQL on the server
    const [dashboardStats, recentTransactions] = await Promise.all([
        getDashboardStats(),
        getRecentTransactions(5),
    ])

    return (
        <ProtectedLayoutClient
            dashboardStats={dashboardStats}
            recentTransactions={recentTransactions}
        >
            {children}
        </ProtectedLayoutClient>
    )
}
