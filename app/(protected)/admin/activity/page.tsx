"use client"

import { useState, useEffect, useCallback } from "react"
import { Activity, RefreshCw, Loader2, Calendar, User, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useTranslation } from "@/lib/store/language-store"
import { getActivityLogs, getActionLabel, formatActivityDate, type ActivityItem } from "@/lib/api/activity"
import { toast } from "sonner"

export default function ActivityPage() {
    const { t, language } = useTranslation()

    const [logs, setLogs] = useState<ActivityItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Load activity logs
    const loadLogs = useCallback(async (showToast = false) => {
        try {
            if (showToast) setIsRefreshing(true)
            const response = await getActivityLogs()

            if (response.success && response.data) {
                // Sort by timestamp descending
                const sortedLogs = (response.data.items || []).sort((a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                )
                setLogs(sortedLogs)

                if (showToast) {
                    toast.success(t.toast.dataUpdated)
                }
            } else {
                toast.error(t.toast.error, { description: response.error })
            }
        } catch (error) {
            console.error('Load activity error:', error)
            toast.error(t.toast.connectionError)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [t])

    useEffect(() => {
        loadLogs()
    }, [loadLogs])

    // Get badge variant based on action type
    const getActionBadgeVariant = (action: string): "default" | "secondary" | "destructive" | "outline" | "success" => {
        const actionUpper = action.toUpperCase()
        if (actionUpper.includes('DELETE')) return 'destructive'
        if (actionUpper.includes('CREATE') || actionUpper.includes('LOGIN')) return 'success'
        if (actionUpper.includes('UPDATE') || actionUpper.includes('TOGGLE')) return 'default'
        return 'secondary'
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">{t.common.loading}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                {t.activity.title}
                            </CardTitle>
                            <CardDescription>{t.activity.subtitle}</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadLogs(true)}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {t.common.refresh}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {logs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {t.activity.noLogs}
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="grid gap-4 md:hidden">
                                {logs.map((log) => (
                                    <Card key={log.id} className="border-l-4 border-l-primary">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <Badge variant={getActionBadgeVariant(log.action)}>
                                                    {getActionLabel(log.action, language)}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatActivityDate(log.timestamp, language)}
                                                </span>
                                            </div>

                                            <div className="space-y-1 text-sm">
                                                {log.username && (
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3 text-muted-foreground" />
                                                        <span>{log.username}</span>
                                                    </div>
                                                )}
                                                {log.details && (
                                                    <div className="flex items-start gap-2">
                                                        <FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
                                                        <span className="text-muted-foreground">{log.details}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[180px]">{t.activity.date}</TableHead>
                                            <TableHead>{t.activity.user}</TableHead>
                                            <TableHead>{t.activity.action}</TableHead>
                                            <TableHead>{t.activity.details}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {formatActivityDate(log.timestamp, language)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {log.username ? (
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            {log.username}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getActionBadgeVariant(log.action)}>
                                                        {getActionLabel(log.action, language)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[300px] truncate">
                                                    {log.details || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
