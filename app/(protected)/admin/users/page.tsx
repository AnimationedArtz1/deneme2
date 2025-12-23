"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersTable } from "@/components/admin/users-table"
import { useTranslation } from "@/lib/store/language-store"
import { getUsers } from "@/lib/api/users"
import type { User } from "@/lib/api/types"
import { Loader2 } from "lucide-react"

export default function AdminUsersPage() {
    const { t } = useTranslation()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadUsers = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        const response = await getUsers({})

        if (response.ok && response.data) {
            setUsers(response.data.users)
        } else {
            setError(response.error || "Failed to load users")
            // For demo/development, show empty state
            setUsers([])
        }

        setIsLoading(false)
    }, [])

    useEffect(() => {
        loadUsers()
    }, [loadUsers])

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t.users.title}</CardTitle>
                    <CardDescription>{t.users.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-2">{error}</p>
                            <p className="text-sm text-muted-foreground">
                                Backend not yet implemented. This page will work when API endpoints are ready.
                            </p>
                        </div>
                    ) : (
                        <UsersTable
                            users={users}
                            onRefresh={loadUsers}
                            isLoading={isLoading}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
