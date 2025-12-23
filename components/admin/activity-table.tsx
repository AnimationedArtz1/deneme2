"use client"

import { useState } from "react"
import { Search, RefreshCw, Eye, AlertTriangle } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useTranslation } from "@/lib/store/language-store"
import type { ActivityItem, ActivityAction } from "@/lib/api/types"

interface ActivityTableProps {
    items: ActivityItem[]
    onRefresh: () => void
    isLoading?: boolean
}

const actionColors: Record<ActivityAction, string> = {
    LOGIN: "bg-green-500/10 text-green-600",
    LOGOUT: "bg-gray-500/10 text-gray-600",
    TRANSACTION_ADD: "bg-blue-500/10 text-blue-600",
    CHAT_QUERY: "bg-purple-500/10 text-purple-600",
    USER_CREATE: "bg-orange-500/10 text-orange-600",
    USER_PASSWORD_RESET: "bg-yellow-500/10 text-yellow-600",
    USER_TOGGLE_ACTIVE: "bg-cyan-500/10 text-cyan-600",
}

export function ActivityTable({ items, onRefresh, isLoading }: ActivityTableProps) {
    const { t } = useTranslation()
    const [search, setSearch] = useState("")
    const [actionFilter, setActionFilter] = useState<ActivityAction | "all">("all")
    const [selectedItem, setSelectedItem] = useState<ActivityItem | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)

    // Filter items
    const filteredItems = items.filter((item) => {
        const matchesSearch =
            item.actor.username.toLowerCase().includes(search.toLowerCase()) ||
            item.actor.displayName.toLowerCase().includes(search.toLowerCase()) ||
            (item.entityId && item.entityId.toLowerCase().includes(search.toLowerCase()))
        const matchesAction = actionFilter === "all" || item.action === actionFilter
        return matchesSearch && matchesAction
    })

    const openDetails = (item: ActivityItem) => {
        setSelectedItem(item)
        setDetailsOpen(true)
    }

    const getActionLabel = (action: ActivityAction) => {
        const labels = t.activityLog.actions as Record<string, string>
        return labels[action] || action
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={t.common.search}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={actionFilter} onValueChange={(v) => setActionFilter(v as ActivityAction | "all")}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t.activityLog.action} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t.common.all}</SelectItem>
                        <SelectItem value="LOGIN">{getActionLabel("LOGIN")}</SelectItem>
                        <SelectItem value="LOGOUT">{getActionLabel("LOGOUT")}</SelectItem>
                        <SelectItem value="TRANSACTION_ADD">{getActionLabel("TRANSACTION_ADD")}</SelectItem>
                        <SelectItem value="CHAT_QUERY">{getActionLabel("CHAT_QUERY")}</SelectItem>
                        <SelectItem value="USER_CREATE">{getActionLabel("USER_CREATE")}</SelectItem>
                        <SelectItem value="USER_PASSWORD_RESET">{getActionLabel("USER_PASSWORD_RESET")}</SelectItem>
                        <SelectItem value="USER_TOGGLE_ACTIVE">{getActionLabel("USER_TOGGLE_ACTIVE")}</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t.activityLog.time}</TableHead>
                            <TableHead>{t.activityLog.actor}</TableHead>
                            <TableHead>{t.activityLog.action}</TableHead>
                            <TableHead>{t.activityLog.entityType}</TableHead>
                            <TableHead>{t.activityLog.ip}</TableHead>
                            <TableHead className="text-right">{t.users.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {t.activityLog.noActivity}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="text-sm">
                                        {formatDate(item.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{item.actor.displayName}</p>
                                            <p className="text-xs text-muted-foreground">{item.actor.username}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={actionColors[item.action]} variant="outline">
                                            {getActionLabel(item.action)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {item.entityType && (
                                            <span className="text-sm">
                                                {item.entityType}
                                                {item.entityId && (
                                                    <span className="text-muted-foreground ml-1">
                                                        #{item.entityId.slice(0, 8)}
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {item.ip || "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.payload && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDetails(item)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Payload Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t.activityLog.viewDetails}</DialogTitle>
                        <DialogDescription>
                            {selectedItem && getActionLabel(selectedItem.action)} - {selectedItem?.actor.displayName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 rounded-md bg-yellow-500/10 text-yellow-600 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            {t.activityLog.payloadWarning}
                        </div>
                        <div className="rounded-md bg-muted p-4 overflow-auto max-h-80">
                            <pre className="text-xs font-mono whitespace-pre-wrap">
                                {selectedItem?.payload
                                    ? JSON.stringify(selectedItem.payload, null, 2)
                                    : "No payload data"}
                            </pre>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
