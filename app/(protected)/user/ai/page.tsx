"use client"

import { useState, useRef } from "react"
import { Send, Sparkles, Loader2, Paperclip, X, FileText, Image, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { addTransaction, addTransactionWithFile } from "@/lib/actions/n8n"
import { useAuthStore } from "@/lib/store/auth-store"
import { useTranslation } from "@/lib/store/language-store"
import { toast } from "sonner"

/**
 * User Quick Transaction Page
 * /user/ai - Quick transaction entry for finance_user
 * 
 * NOT a chat interface - just a simple form to add transactions
 * Sends to /webhook/islem-ekle with userId
 */
export default function UserQuickTransactionPage() {
    const { t, language } = useTranslation()
    const user = useAuthStore((state) => state.user)

    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Example transactions for quick input
    const exampleTransactions = language === 'tr' ? [
        "500 TL mazot gideri",
        "Otel için 2000 TL ödedim",
        "Müşteriden 1500 TL tahsilat",
        "350 EUR komisyon geldi",
        "Personel maaşı 8500 TL",
    ] : [
        "500 TL fuel expense",
        "Paid 2000 TL for hotel",
        "1500 TL collection from customer",
        "350 EUR commission received",
        "Staff salary 8500 TL",
    ]

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    setFilePreview(e.target?.result as string)
                }
                reader.readAsDataURL(file)
            } else {
                setFilePreview(null)
            }
        }
    }

    const removeFile = () => {
        setSelectedFile(null)
        setFilePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return <Image className="h-4 w-4" />
        }
        return <FileText className="h-4 w-4" />
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) {
            toast.error(language === 'tr' ? 'İşlem açıklaması girin' : 'Enter transaction description')
            return
        }

        setIsLoading(true)
        setLastResult(null)

        try {
            let response

            if (selectedFile) {
                // Send with file using FormData
                const formData = new FormData()
                formData.append('text', input)
                formData.append('file', selectedFile)
                if (user?.id) formData.append('userId', user.id)
                response = await addTransactionWithFile(formData)
            } else {
                // Send text only with userId
                response = await addTransaction(input, user?.id)
            }

            if (response.success) {
                setLastResult({
                    success: true,
                    message: language === 'tr'
                        ? 'İşlem başarıyla eklendi!'
                        : 'Transaction added successfully!'
                })
                toast.success(language === 'tr' ? 'İşlem eklendi' : 'Transaction added')
                setInput("")
                removeFile()
            } else {
                setLastResult({
                    success: false,
                    message: response.error || (language === 'tr' ? 'Bir hata oluştu' : 'An error occurred')
                })
                toast.error(response.error || t.toast.error)
            }
        } catch (error) {
            console.error('Transaction error:', error)
            setLastResult({
                success: false,
                message: language === 'tr' ? 'Bağlantı hatası' : 'Connection error'
            })
            toast.error(t.toast.connectionError)
        } finally {
            setIsLoading(false)
        }
    }

    const handleExampleClick = (example: string) => {
        setInput(example)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {language === 'tr' ? 'Hızlı İşlem Ekle' : 'Quick Transaction Entry'}
                </h1>
                <p className="text-muted-foreground">
                    {language === 'tr'
                        ? 'İşlemi doğal dilde yazın, sistem otomatik olarak işleyecek.'
                        : 'Write the transaction in natural language, the system will process it automatically.'}
                </p>
            </div>

            {/* User Info */}
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>
                        {language === 'tr'
                            ? `Merhaba ${user?.displayName || 'Kullanıcı'}! İşlemleriniz otomatik olarak sizin adınıza kaydedilecek.`
                            : `Hello ${user?.displayName || 'User'}! Your transactions will be automatically saved under your name.`}
                    </span>
                </div>
            </div>

            {/* Transaction Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {language === 'tr' ? 'İşlem Girişi' : 'Transaction Entry'}
                    </CardTitle>
                    <CardDescription>
                        {language === 'tr'
                            ? 'Örnek: "500 TL mazot gideri" veya "Müşteriden 2000 TL tahsilat"'
                            : 'Example: "500 TL fuel expense" or "2000 TL collection from customer"'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Example Transactions */}
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            {language === 'tr' ? 'Örnek işlemler:' : 'Example transactions:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {exampleTransactions.map((example, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExampleClick(example)}
                                    className="text-xs"
                                >
                                    {example}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={
                                    language === 'tr'
                                        ? 'İşlemi yazın... (örn: "500 TL mazot gideri")'
                                        : 'Enter transaction... (e.g. "500 TL fuel expense")'
                                }
                                className="min-h-[100px] text-base resize-none"
                                disabled={isLoading}
                            />
                        </div>

                        {/* File Preview */}
                        {selectedFile && (
                            <div className="p-3 bg-muted/50 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    {filePreview ? (
                                        <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                                    ) : (
                                        <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                                            {getFileIcon(selectedFile.name)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={removeFile} type="button">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf,.xlsx,.xls,.csv"
                                onChange={handleFileSelect}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                            >
                                <Paperclip className="h-4 w-4 mr-2" />
                                {language === 'tr' ? 'Dosya Ekle' : 'Attach File'}
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isLoading || !input.trim()}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {language === 'tr' ? 'Gönderiliyor...' : 'Sending...'}
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        {language === 'tr' ? 'İşlem Ekle' : 'Add Transaction'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Result Message */}
                    {lastResult && (
                        <div className={`p-4 rounded-lg border ${lastResult.success
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}>
                            <div className="flex items-center gap-2">
                                {lastResult.success ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                )}
                                <p className={`text-sm font-medium ${lastResult.success
                                    ? 'text-green-700 dark:text-green-300'
                                    : 'text-red-700 dark:text-red-300'
                                    }`}>
                                    {lastResult.message}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-muted/30">
                <CardContent className="pt-6">
                    <div className="space-y-3 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">
                            {language === 'tr' ? '💡 İpuçları:' : '💡 Tips:'}
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>
                                {language === 'tr'
                                    ? 'Tutarı ve para birimini belirtin (örn: 500 TL, 100 USD)'
                                    : 'Specify amount and currency (e.g. 500 TL, 100 USD)'}
                            </li>
                            <li>
                                {language === 'tr'
                                    ? 'Gelir/gider türünü belirtin (örn: "geldi", "ödedim", "tahsilat")'
                                    : 'Specify income/expense type (e.g. "received", "paid", "collection")'}
                            </li>
                            <li>
                                {language === 'tr'
                                    ? 'Fatura veya makbuz ekleyebilirsiniz'
                                    : 'You can attach invoices or receipts'}
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
