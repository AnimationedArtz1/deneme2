"use client"

import { useState } from "react"
import { Pencil, Trash2, PlusCircle, Search, Filter, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useAuthStore } from "@/lib/store/auth-store"
import type { Transaction } from "@/lib/actions/db"

interface TransactionsClientProps {
    initialTransactions: Transaction[]
}

const categories = [
    "Tur Satışı",
    "Otel Komisyonu",
    "Transfer",
    "Yakıt",
    "Personel",
    "Ofis Gideri",
    "Reklam",
    "Diğer",
]

// CSV Export function with UTF-8 BOM for Excel compatibility
function exportToCSV(transactions: Transaction[]) {
    // UTF-8 BOM for Excel to recognize Turkish characters
    const BOM = '\uFEFF'

    // CSV Header
    const headers = ['Tarih', 'Kategori', 'Açıklama', 'Tutar', 'Tip']

    // CSV Rows
    const rows = transactions.map(t => [
        t.date ? new Date(t.date).toLocaleDateString('tr-TR') : '-',
        t.category,
        // Escape quotes in description
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `${t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString('tr-TR')} TL`,
        t.type === 'INCOME' ? 'Gelir' : 'Gider'
    ])

    // Combine headers and rows
    const csvContent = BOM + [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    // Filename with date
    const today = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `islemler-${today}.csv`

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

// Transaction Form Component - Defined OUTSIDE main component to prevent re-renders
function TransactionFormFields({
    formData,
    setFormData,
    onClose,
}: {
    formData: {
        date: string
        amount: string
        type: "INCOME" | "EXPENSE"
        category: string
        description: string
    }
    setFormData: React.Dispatch<React.SetStateAction<typeof formData>>
    onClose: () => void
}) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="form-date">Tarih</Label>
                    <Input
                        id="form-date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="form-amount">Tutar (₺)</Label>
                    <Input
                        id="form-amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tür</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value: "INCOME" | "EXPENSE") => setFormData(prev => ({ ...prev, type: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Gelir</SelectItem>
                            <SelectItem value="EXPENSE">Gider</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seçin..." />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="form-description">Açıklama</Label>
                <Input
                    id="form-description"
                    placeholder="İşlem açıklaması..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
            </div>
            <DialogFooter>
                <Button onClick={onClose}>Kapat</Button>
            </DialogFooter>
        </div>
    )
}

export function TransactionsClient({ initialTransactions }: TransactionsClientProps) {
    const user = useAuthStore((state) => state.user)
    const isAdmin = user?.role === "admin"

    const [transactions] = useState(initialTransactions)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<"all" | "INCOME" | "EXPENSE">("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        type: "EXPENSE" as "INCOME" | "EXPENSE",
        category: "",
        description: "",
    })

    const filteredTransactions = transactions.filter((t) => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === "all" || t.type === filterType
        return matchesSearch && matchesType
    })

    const handleExport = () => {
        exportToCSV(filteredTransactions)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Tüm İşlemler</CardTitle>
                            <CardDescription>
                                {isAdmin ? "Veritabanından alınan tüm finansal hareketler" : "İşlemlerinizi görüntüleyin"}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Excel Export Button */}
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Excel&apos;e Aktar
                            </Button>
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Yeni İşlem
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Yeni İşlem Ekle</DialogTitle>
                                        <DialogDescription>
                                            AI ile işlem eklemek için Personel Paneline gidin.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <TransactionFormFields
                                        formData={formData}
                                        setFormData={setFormData}
                                        onClose={() => setIsAddDialogOpen(false)}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={filterType} onValueChange={(value: "all" | "INCOME" | "EXPENSE") => setFilterType(value)}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tümü</SelectItem>
                                <SelectItem value="INCOME">Gelirler</SelectItem>
                                <SelectItem value="EXPENSE">Giderler</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead>Açıklama</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Tür</TableHead>
                                    <TableHead className="text-right">Tutar</TableHead>
                                    {isAdmin && <TableHead className="text-right">İşlemler</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
                                            İşlem bulunamadı. Veritabanı bağlantısını kontrol edin.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">
                                                {transaction.date ? new Date(transaction.date).toLocaleDateString("tr-TR") : '-'}
                                            </TableCell>
                                            <TableCell>{transaction.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{transaction.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={transaction.type === "INCOME" ? "success" : "destructive"}>
                                                    {transaction.type === "INCOME" ? "Gelir" : "Gider"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${transaction.type === "INCOME" ? "text-green-500" : "text-red-500"
                                                }`}>
                                                {transaction.type === "INCOME" ? "+" : "-"}₺{transaction.amount.toLocaleString("tr-TR")}
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" disabled>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" disabled>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
