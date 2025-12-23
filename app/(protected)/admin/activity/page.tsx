"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityTable } from "@/components/admin/activity-table"
import { useTranslation } from "@/lib/store/language-store"
import { getActivityLogs } from "@/lib/api/activity"
import type { ActivityItem } from "@/lib/api/types"
import { Loader2 } from "lucide-react"

export default function AdminActivityPage() {
    const { t } = useTranslation()
    const [items, setItems] = useState<ActivityItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadActivity = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        const response = await getActivityLogs({})

        if (response.ok && response.data) {
            setItems(response.data.items)
        } else {
            setError(response.error || "Failed to load activity")
            // For demo/development, show empty state
            setItems([])
        }

        setIsLoading(false)
    }, [])

    useEffect(() => {
        loadActivity()
    }, [loadActivity])

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t.activityLog.title}</CardTitle>
                    <CardDescription>{t.activityLog.subtitle}</CardDescription>
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
                        <ActivityTable
                            items={items}
                            onRefresh={loadActivity}
                            isLoading={isLoading}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
