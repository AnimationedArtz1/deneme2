"use client"

import { useState } from "react"
import { Search, MoreHorizontal, Check, Copy, RefreshCw, X, UserPlus, Key, Power } from "lucide-react"
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/lib/store/language-store"
import type { User, UserRole } from "@/lib/api/types"
import {
    validatePassword,
    validateUsername,
    generateStrongPassword,
} from "@/lib/api/types"
import { createUser, resetPassword, toggleUserActive } from "@/lib/api/users"
import { toast } from "sonner"

interface UsersTableProps {
    users: User[]
    onRefresh: () => void
    isLoading?: boolean
}

export function UsersTable({ users, onRefresh, isLoading }: UsersTableProps) {
    const { t } = useTranslation()
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all")
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [resetDialogOpen, setResetDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    // Filter users
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.displayName.toLowerCase().includes(search.toLowerCase())
        const matchesRole = roleFilter === "all" || user.role === roleFilter
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && user.isActive) ||
            (statusFilter === "inactive" && !user.isActive)
        return matchesSearch && matchesRole && matchesStatus
    })

    const handleToggleActive = async (user: User) => {
        const response = await toggleUserActive(user.id, !user.isActive)
        if (response.ok) {
            toast.success(t.users.statusChanged)
            onRefresh()
        } else {
            toast.error(response.error || "Error")
        }
    }

    const openResetDialog = (user: User) => {
        setSelectedUser(user)
        setResetDialogOpen(true)
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
                <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "all")}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder={t.users.role} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t.common.all}</SelectItem>
                        <SelectItem value="admin">{t.users.admin}</SelectItem>
                        <SelectItem value="worker">{t.users.worker}</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder={t.users.status} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t.common.all}</SelectItem>
                        <SelectItem value="active">{t.users.active}</SelectItem>
                        <SelectItem value="inactive">{t.users.inactive}</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t.users.addUser}
                </Button>
                <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t.users.username}</TableHead>
                            <TableHead>{t.users.displayName}</TableHead>
                            <TableHead>{t.users.role}</TableHead>
                            <TableHead>{t.users.status}</TableHead>
                            <TableHead>{t.users.createdAt}</TableHead>
                            <TableHead className="text-right">{t.users.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {t.users.noUsers}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>{user.displayName}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                            {user.role === "admin" ? t.users.admin : t.users.worker}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.isActive ? "default" : "destructive"}>
                                            {user.isActive ? t.users.active : t.users.inactive}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openResetDialog(user)}>
                                                    <Key className="h-4 w-4 mr-2" />
                                                    {t.users.resetPassword}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                                                    <Power className="h-4 w-4 mr-2" />
                                                    {t.users.toggleActive}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create User Dialog */}
            <CreateUserDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={() => {
                    setCreateDialogOpen(false)
                    onRefresh()
                }}
            />

            {/* Reset Password Dialog */}
            <ResetPasswordDialog
                open={resetDialogOpen}
                onOpenChange={setResetDialogOpen}
                user={selectedUser}
                onSuccess={() => {
                    setResetDialogOpen(false)
                    onRefresh()
                }}
            />
        </div>
    )
}

interface CreateUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
    const { t } = useTranslation()
    const [username, setUsername] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [role, setRole] = useState<UserRole>("worker")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<string[]>([])
    const [copied, setCopied] = useState(false)

    const handleGeneratePassword = () => {
        const pwd = generateStrongPassword()
        setPassword(pwd)
        setErrors([])
    }

    const handleCopyPassword = async () => {
        await navigator.clipboard.writeText(password)
        setCopied(true)
        toast.success(t.users.passwordCopied)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSubmit = async () => {
        const allErrors: string[] = []

        const usernameValidation = validateUsername(username)
        if (!usernameValidation.isValid) {
            allErrors.push(usernameValidation.error!)
        }

        if (!displayName.trim()) {
            allErrors.push("Display name is required")
        }

        const passwordValidation = validatePassword(password)
        if (!passwordValidation.isValid) {
            allErrors.push(...passwordValidation.errors)
        }

        if (allErrors.length > 0) {
            setErrors(allErrors)
            return
        }

        setIsLoading(true)
        const response = await createUser({
            username: username.trim().toLowerCase(),
            displayName: displayName.trim(),
            role,
            password,
        })

        setIsLoading(false)

        if (response.ok) {
            toast.success(t.users.userCreated)
            resetForm()
            onSuccess()
        } else {
            setErrors([response.error || "Error creating user"])
        }
    }

    const resetForm = () => {
        setUsername("")
        setDisplayName("")
        setRole("worker")
        setPassword("")
        setErrors([])
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm() }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t.users.addUser}</DialogTitle>
                    <DialogDescription>{t.users.subtitle}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t.users.username}</Label>
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="johndoe"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t.users.displayName}</Label>
                        <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t.users.role}</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="worker">{t.users.worker}</SelectItem>
                                <SelectItem value="admin">{t.users.admin}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t.users.newPassword}</Label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 font-mono"
                            />
                            <Button type="button" variant="outline" size="icon" onClick={handleCopyPassword}>
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <Button type="button" variant="secondary" size="sm" onClick={handleGeneratePassword}>
                            {t.users.generatePassword}
                        </Button>
                    </div>
                    {errors.length > 0 && (
                        <div className="text-sm text-destructive space-y-1">
                            {errors.map((err, i) => (
                                <p key={i}>• {err}</p>
                            ))}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t.common.cancel}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {t.users.createUser}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface ResetPasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
    onSuccess: () => void
}

function ResetPasswordDialog({ open, onOpenChange, user, onSuccess }: ResetPasswordDialogProps) {
    const { t } = useTranslation()
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<string[]>([])
    const [copied, setCopied] = useState(false)

    const handleGeneratePassword = () => {
        const pwd = generateStrongPassword()
        setPassword(pwd)
        setErrors([])
    }

    const handleCopyPassword = async () => {
        await navigator.clipboard.writeText(password)
        setCopied(true)
        toast.success(t.users.passwordCopied)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSubmit = async () => {
        if (!user) return

        const validation = validatePassword(password)
        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        setIsLoading(true)
        const response = await resetPassword(user.id, password)
        setIsLoading(false)

        if (response.ok) {
            toast.success(t.users.passwordReset)
            setPassword("")
            setErrors([])
            onSuccess()
        } else {
            setErrors([response.error || "Error resetting password"])
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setPassword(""); setErrors([]) } }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t.users.resetPassword}</DialogTitle>
                    <DialogDescription>
                        {user?.displayName} ({user?.username})
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t.users.newPassword}</Label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex-1 font-mono"
                            />
                            <Button type="button" variant="outline" size="icon" onClick={handleCopyPassword}>
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <Button type="button" variant="secondary" size="sm" onClick={handleGeneratePassword}>
                            {t.users.generatePassword}
                        </Button>
                    </div>
                    {errors.length > 0 && (
                        <div className="text-sm text-destructive space-y-1">
                            {errors.map((err, i) => (
                                <p key={i}>• {err}</p>
                            ))}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t.common.cancel}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {t.users.resetPassword}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
