"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Receipt, Sparkles, Loader2, RefreshCw, PlusCircle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { WeeklyChart } from "@/components/charts/weekly-chart"
import { ExpensePieChart } from "@/components/charts/expense-pie-chart"
import {
    fetchDashboardData,
    addTransaction,
    type Transaction,
    type DashboardStats
} from "@/lib/actions/n8n"
import { calculateWeeklyStats, calculateExpenseDistribution } from "@/lib/utils/dashboard"
import { toast } from "sonner"

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

// Refresh interval: 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000

// Manual form fields component - OUTSIDE main component to prevent focus loss
function ManualFormFields({
    formData,
    setFormData,
    isLoading,
}: {
    formData: {
        date: string
        amount: string
        type: "INCOME" | "EXPENSE"
        category: string
        description: string
    }
    setFormData: React.Dispatch<React.SetStateAction<typeof formData>>
    isLoading: boolean
}) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="admin-manual-date">Tarih</Label>
                    <Input
                        id="admin-manual-date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="admin-manual-amount">Tutar (₺)</Label>
                    <Input
                        id="admin-manual-amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tür</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value: "INCOME" | "EXPENSE") => setFormData(prev => ({ ...prev, type: value }))}
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                <Label htmlFor="admin-manual-description">Açıklama</Label>
                <Input
                    id="admin-manual-description"
                    placeholder="İşlem açıklaması..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    disabled={isLoading}
                />
            </div>
        </>
    )
}

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats>({ income: 0, expense: 0, balance: 0 })
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [weeklyData, setWeeklyData] = useState<{ name: string; gelir: number; gider: number }[]>([])
    const [expenseData, setExpenseData] = useState<{ name: string; value: number; color: string }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // AI Input state
    const [aiInput, setAiInput] = useState("")
    const [aiLoading, setAiLoading] = useState(false)

    // Manual form state
    const [manualForm, setManualForm] = useState({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        type: "EXPENSE" as "INCOME" | "EXPENSE",
        category: "",
        description: "",
    })
    const [manualLoading, setManualLoading] = useState(false)

    // Fetch data from webhook
    const loadData = useCallback(async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) setIsRefreshing(true)

            const data = await fetchDashboardData()

            setStats(data.stats)
            setTransactions(data.transactions)
            setWeeklyData(calculateWeeklyStats(data.transactions))
            setExpenseData(calculateExpenseDistribution(data.transactions))
            setLastUpdated(new Date())

            if (showRefreshToast) {
                toast.success("Veriler Güncellendi", {
                    description: `${data.transactions.length} işlem yüklendi`,
                })
            }
        } catch (error) {
            console.error('Data load error:', error)
            if (showRefreshToast) {
                toast.error("Veri Yükleme Hatası", {
                    description: "Veriler alınamadı, tekrar deneyiniz.",
                })
            }
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [])

    // Initial load
    useEffect(() => {
        loadData()
    }, [loadData])

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            loadData()
        }, REFRESH_INTERVAL)

        return () => clearInterval(interval)
    }, [loadData])

    // Handle AI Submit
    const handleAISubmit = async () => {
        if (!aiInput.trim()) return

        setAiLoading(true)

        try {
            const response = await addTransaction(aiInput)

            if (response.success) {
                toast.success("İşlem Başarıyla Eklendi", {
                    description: "Veriler yenileniyor...",
                })
                setAiInput("")
                // Reload data after adding transaction
                setTimeout(() => {
                    loadData(false)
                    router.refresh()
                }, 1500)
            } else {
                toast.error("Hata", {
                    description: response.error || "İşlem kaydedilemedi.",
                })
            }
        } catch {
            toast.error("Bağlantı Hatası", {
                description: "Sunucuya bağlanılamadı.",
            })
        } finally {
            setAiLoading(false)
        }
    }

    // Handle Manual Submit
    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!manualForm.amount || !manualForm.category || !manualForm.description) {
            toast.error("Eksik Bilgi", {
                description: "Lütfen tüm alanları doldurun.",
            })
            return
        }

        setManualLoading(true)

        // Build a natural language string for n8n
        const text = `${manualForm.date} tarihinde ${manualForm.category} kategorisinde ${manualForm.amount} TL ${manualForm.type === 'INCOME' ? 'gelir' : 'gider'}: ${manualForm.description}`

        try {
            const response = await addTransaction(text)

            if (response.success) {
                toast.success("İşlem Başarıyla Eklendi", {
                    description: "Veriler yenileniyor...",
                })
                setManualForm({
                    date: new Date().toISOString().split("T")[0],
                    amount: "",
                    type: "EXPENSE",
                    category: "",
                    description: "",
                })
                setTimeout(() => {
                    loadData(false)
                    router.refresh()
                }, 1500)
            } else {
                toast.error("Hata", {
                    description: response.error || "İşlem kaydedilemedi.",
                })
            }
        } catch {
            toast.error("Bağlantı Hatası", {
                description: "Sunucuya bağlanılamadı.",
            })
        } finally {
            setManualLoading(false)
        }
    }

    // Manual refresh
    const handleRefresh = () => {
        loadData(true)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Veriler yükleniyor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Refresh */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Genel Bakış</h2>
                    {lastUpdated && (
                        <p className="text-xs text-muted-foreground">
                            Son güncelleme: {lastUpdated.toLocaleTimeString("tr-TR")}
                        </p>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Yenile
                </Button>
            </div>

            {/* Transaction Entry - Full Tabs like Worker */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5" />
                        Hızlı İşlem Ekle
                    </CardTitle>
                    <CardDescription>
                        Yapay zeka ile yazarak veya manuel form ile işlem ekleyin
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="ai" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="ai" className="gap-2">
                                <Sparkles className="h-4 w-4" />
                                AI ile Ekle
                            </TabsTrigger>
                            <TabsTrigger value="manual" className="gap-2">
                                <Receipt className="h-4 w-4" />
                                Manuel Giriş
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="ai">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="admin-ai-input">İşlemi Doğal Dilde Yazın</Label>
                                    <Textarea
                                        id="admin-ai-input"
                                        placeholder="Örn: Bugün Ahmet'e 500 TL mazot parası verdim"
                                        value={aiInput}
                                        onChange={(e) => setAiInput(e.target.value)}
                                        className="min-h-[100px]"
                                        disabled={aiLoading}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        n8n webhook&apos;u yazınızı analiz edip veritabanına kaydedecektir.
                                    </p>
                                </div>

                                <Button
                                    onClick={handleAISubmit}
                                    disabled={aiLoading || !aiInput.trim()}
                                    className="w-full"
                                >
                                    {aiLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Gönderiliyor...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            AI ile Kaydet
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="manual">
                            <form onSubmit={handleManualSubmit} className="space-y-4">
                                <ManualFormFields
                                    formData={manualForm}
                                    setFormData={setManualForm}
                                    isLoading={manualLoading}
                                />

                                <Button type="submit" disabled={manualLoading} className="w-full">
                                    {manualLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            İşlemi Kaydet
                                        </>
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Toplam Gelir
                        </CardTitle>
                        <div className="p-2 bg-green-500/10 rounded-full">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            ₺{stats.income.toLocaleString("tr-TR")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">Canlı Veri</span>
                            <span>Webhook</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Toplam Gider
                        </CardTitle>
                        <div className="p-2 bg-red-500/10 rounded-full">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            ₺{stats.expense.toLocaleString("tr-TR")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <ArrowDownRight className="h-3 w-3 text-red-500" />
                            <span className="text-red-500">Canlı Veri</span>
                            <span>Webhook</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Net Bakiye
                        </CardTitle>
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Wallet className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            ₺{stats.balance.toLocaleString("tr-TR")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <ArrowUpRight className="h-3 w-3 text-primary" />
                            <span className="text-primary">Canlı Veri</span>
                            <span>Webhook</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            Haftalık Finansal Durum
                        </CardTitle>
                        <CardDescription>
                            Bu haftanın gelir ve gider karşılaştırması
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WeeklyChart data={weeklyData} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5" />
                            Gider Dağılımı
                        </CardTitle>
                        <CardDescription>
                            Kategorilere göre gider oranları
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ExpensePieChart data={expenseData} />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Son İşlemler
                    </CardTitle>
                    <CardDescription>
                        Webhook&apos;tan alınan son finansal hareketler
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Henüz işlem bulunmuyor.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead>Açıklama</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Tür</TableHead>
                                    <TableHead className="text-right">Tutar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.slice(0, 10).map((transaction) => (
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
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
