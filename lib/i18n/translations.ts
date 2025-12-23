export const translations = {
    tr: {
        // Common
        common: {
            loading: "Yükleniyor...",
            refresh: "Yenile",
            save: "Kaydet",
            cancel: "İptal",
            search: "Ara...",
            filter: "Filtrele",
            export: "Excel'e Aktar",
            all: "Tümü",
            income: "Gelir",
            expense: "Gider",
            balance: "Bakiye",
            date: "Tarih",
            description: "Açıklama",
            category: "Kategori",
            subCategory: "Alt Kategori",
            amount: "Tutar",
            type: "Tür",
            currency: "Para Birimi",
            liveData: "Canlı Veri",
        },

        // Navigation
        nav: {
            overview: "Genel Bakış",
            transactions: "İşlemler",
            aiAnalyst: "AI Analist",
            myPanel: "Panelim",
            addTransaction: "İşlem Ekle",
            logout: "Çıkış Yap",
            users: "Kullanıcılar",
            activity: "Aktivite",
        },

        // Login
        login: {
            welcome: "Hoş Geldiniz",
            subtitle: "Hesabınıza giriş yaparak devam edin",
            admin: "Yönetici",
            worker: "Personel",
            username: "Kullanıcı Adı",
            password: "Şifre",
            adminLogin: "Yönetici Girişi",
            workerLogin: "Personel Girişi",
            loggingIn: "Giriş yapılıyor...",
            loginFailed: "Kullanıcı adı veya şifre hatalı",
            demo: "Demo",
            fillAllFields: "Lütfen tüm alanları doldurun",
            connectionError: "Bağlantı hatası. Lütfen tekrar deneyin.",
        },

        // Dashboard
        dashboard: {
            title: "Genel Bakış",
            lastUpdate: "Son güncelleme",
            totalIncome: "Toplam Gelir",
            totalExpense: "Toplam Gider",
            netBalance: "Net Bakiye",
            quickAdd: "Hızlı İşlem Ekle",
            quickAddDesc: "Yapay zeka ile doğal dilde işlem ekleyin",
            writeNaturally: "İşlemi Doğal Dilde Yazın",
            placeholder: "Örn: Bugün Ahmet'e 500 TL mazot parası verdim",
            webhookNote: "n8n webhook'u yazınızı analiz edip veritabanına kaydedecektir.",
            saveWithAI: "AI ile Kaydet",
            sending: "Gönderiliyor...",
            weeklyStats: "Haftalık Finansal Durum",
            weeklyDesc: "Bu haftanın gelir ve gider karşılaştırması",
            expenseDist: "Gider Dağılımı",
            expenseDistDesc: "Kategorilere göre gider oranları",
            recentTrans: "Son İşlemler",
            recentTransDesc: "Webhook'tan alınan son finansal hareketler",
            noTransactions: "Henüz işlem bulunmuyor.",
        },

        // Worker Dashboard
        worker: {
            welcome: "Hoş geldin",
            welcomeDesc: "AI ile doğal dilde işlem ekleyebilirsin.",
            last10: "Webhook'tan alınan son 10 işlem",
        },

        // Transactions Page
        transactions: {
            title: "Tüm İşlemler",
            adminDesc: "Webhook'tan alınan tüm finansal hareketler",
            userDesc: "İşlemlerinizi görüntüleyin",
            noResults: "İşlem bulunamadı.",
            incomes: "Gelirler",
            expenses: "Giderler",
        },

        // AI Chat
        chat: {
            title: "AI Finans Asistanı",
            desc: "Finansal verileriniz hakkında sorular sorun",
            welcome: "Merhaba! Ben BestHoliday Finans Asistanınızım. Size finansal verileriniz hakkında sorular sorabilirsiniz.",
            placeholder: "Mesajınızı yazın...",
            send: "Gönder",
            attach: "Dosya Ekle",
            voice: "Sesli Mesaj",
            suggestions: "Önerilen Sorular",
        },

        // Sidebar
        sidebar: {
            quickLook: "Hızlı Bakış",
            recentActivity: "Son Aktivite",
            noActivity: "Henüz aktivite yok",
            loadingData: "Veri yükleniyor...",
            connectionError: "Veri alınamadı",
        },

        // Toasts
        toast: {
            success: "İşlem Başarıyla Eklendi",
            refreshing: "Veriler yenileniyor...",
            error: "Hata",
            saveFailed: "İşlem kaydedilemedi.",
            connectionError: "Bağlantı Hatası",
            serverError: "Sunucuya bağlanılamadı.",
            dataUpdated: "Veriler Güncellendi",
            dataLoadError: "Veri Yükleme Hatası",
            dataLoadFailed: "Veriler alınamadı, tekrar deneyiniz.",
            transactionsLoaded: "işlem yüklendi",
        },

        // Theme
        theme: {
            toggle: "Tema değiştir",
            light: "Açık",
            dark: "Koyu",
            system: "Sistem",
        },

        // Language
        language: {
            toggle: "Dil değiştir",
            tr: "Türkçe",
            en: "English",
        },

        // Currencies
        currencies: {
            TRY: "Türk Lirası",
            USD: "Amerikan Doları",
            EUR: "Euro",
        },

        // Users Management
        users: {
            title: "Kullanıcı Yönetimi",
            subtitle: "Sistem kullanıcılarını yönetin",
            addUser: "Yeni Kullanıcı",
            username: "Kullanıcı Adı",
            displayName: "Görünen Ad",
            role: "Rol",
            status: "Durum",
            createdAt: "Oluşturulma",
            createdBy: "Oluşturan",
            actions: "İşlemler",
            active: "Aktif",
            inactive: "Pasif",
            noUsers: "Kullanıcı bulunamadı",
            resetPassword: "Şifre Sıfırla",
            toggleActive: "Aktifliği Değiştir",
            newPassword: "Yeni Şifre",
            generatePassword: "Güçlü Şifre Oluştur",
            copyPassword: "Kopyala",
            passwordCopied: "Şifre kopyalandı",
            createUser: "Kullanıcı Oluştur",
            userCreated: "Kullanıcı oluşturuldu",
            passwordReset: "Şifre sıfırlandı",
            statusChanged: "Kullanıcı durumu değiştirildi",
            admin: "Yönetici",
            worker: "Personel",
        },

        // Activity/Audit
        activityLog: {
            title: "Aktivite Kaydı",
            subtitle: "Sistem aktivitelerini görüntüleyin",
            time: "Zaman",
            actor: "Kullanıcı",
            action: "İşlem",
            entityType: "Nesne Tipi",
            entityId: "Nesne ID",
            ip: "IP Adresi",
            payload: "Detay",
            noActivity: "Aktivite bulunamadı",
            viewDetails: "Detayları Gör",
            payloadWarning: "Bu veri hassas bilgiler içerebilir",
            actions: {
                LOGIN: "Giriş",
                LOGOUT: "Çıkış",
                TRANSACTION_ADD: "İşlem Ekleme",
                CHAT_QUERY: "AI Sorgusu",
                USER_CREATE: "Kullanıcı Oluşturma",
                USER_PASSWORD_RESET: "Şifre Sıfırlama",
                USER_TOGGLE_ACTIVE: "Durum Değişikliği",
            },
            dateRange: "Tarih Aralığı",
            from: "Başlangıç",
            to: "Bitiş",
        },
    },

    en: {
        // Common
        common: {
            loading: "Loading...",
            refresh: "Refresh",
            save: "Save",
            cancel: "Cancel",
            search: "Search...",
            filter: "Filter",
            export: "Export to Excel",
            all: "All",
            income: "Income",
            expense: "Expense",
            balance: "Balance",
            date: "Date",
            description: "Description",
            category: "Category",
            subCategory: "Subcategory",
            amount: "Amount",
            type: "Type",
            currency: "Currency",
            liveData: "Live Data",
        },

        // Navigation
        nav: {
            overview: "Overview",
            transactions: "Transactions",
            aiAnalyst: "AI Analyst",
            myPanel: "My Panel",
            addTransaction: "Add Transaction",
            logout: "Logout",
            users: "Users",
            activity: "Activity",
        },

        // Login
        login: {
            welcome: "Welcome",
            subtitle: "Sign in to your account to continue",
            admin: "Admin",
            worker: "Staff",
            username: "Username",
            password: "Password",
            adminLogin: "Admin Login",
            workerLogin: "Staff Login",
            loggingIn: "Signing in...",
            loginFailed: "Invalid username or password",
            demo: "Demo",
            fillAllFields: "Please fill in all fields",
            connectionError: "Connection error. Please try again.",
        },

        // Dashboard
        dashboard: {
            title: "Overview",
            lastUpdate: "Last update",
            totalIncome: "Total Income",
            totalExpense: "Total Expense",
            netBalance: "Net Balance",
            quickAdd: "Quick Add Transaction",
            quickAddDesc: "Add transactions using natural language with AI",
            writeNaturally: "Write Transaction in Natural Language",
            placeholder: "E.g.: Today I gave Ahmet 500 TL for fuel",
            webhookNote: "n8n webhook will analyze your text and save to database.",
            saveWithAI: "Save with AI",
            sending: "Sending...",
            weeklyStats: "Weekly Financial Status",
            weeklyDesc: "This week's income and expense comparison",
            expenseDist: "Expense Distribution",
            expenseDistDesc: "Expense ratios by category",
            recentTrans: "Recent Transactions",
            recentTransDesc: "Latest financial activities from webhook",
            noTransactions: "No transactions yet.",
        },

        // Worker Dashboard
        worker: {
            welcome: "Welcome",
            welcomeDesc: "You can add transactions using natural language with AI.",
            last10: "Last 10 transactions from webhook",
        },

        // Transactions Page
        transactions: {
            title: "All Transactions",
            adminDesc: "All financial activities from webhook",
            userDesc: "View your transactions",
            noResults: "No transactions found.",
            incomes: "Incomes",
            expenses: "Expenses",
        },

        // AI Chat
        chat: {
            title: "AI Finance Assistant",
            desc: "Ask questions about your financial data",
            welcome: "Hello! I'm your BestHoliday Finance Assistant. You can ask me questions about your financial data.",
            placeholder: "Type your message...",
            send: "Send",
            attach: "Attach File",
            voice: "Voice Message",
            suggestions: "Suggested Questions",
        },

        // Sidebar
        sidebar: {
            quickLook: "Quick Look",
            recentActivity: "Recent Activity",
            noActivity: "No activity yet",
            loadingData: "Loading data...",
            connectionError: "Could not load data",
        },

        // Toasts
        toast: {
            success: "Transaction Added Successfully",
            refreshing: "Refreshing data...",
            error: "Error",
            saveFailed: "Failed to save transaction.",
            connectionError: "Connection Error",
            serverError: "Could not connect to server.",
            dataUpdated: "Data Updated",
            dataLoadError: "Data Load Error",
            dataLoadFailed: "Could not load data, please try again.",
            transactionsLoaded: "transactions loaded",
        },

        // Theme
        theme: {
            toggle: "Toggle theme",
            light: "Light",
            dark: "Dark",
            system: "System",
        },

        // Language
        language: {
            toggle: "Change language",
            tr: "Türkçe",
            en: "English",
        },

        // Currencies
        currencies: {
            TRY: "Turkish Lira",
            USD: "US Dollar",
            EUR: "Euro",
        },

        // Users Management
        users: {
            title: "User Management",
            subtitle: "Manage system users",
            addUser: "Add User",
            username: "Username",
            displayName: "Display Name",
            role: "Role",
            status: "Status",
            createdAt: "Created At",
            createdBy: "Created By",
            actions: "Actions",
            active: "Active",
            inactive: "Inactive",
            noUsers: "No users found",
            resetPassword: "Reset Password",
            toggleActive: "Toggle Status",
            newPassword: "New Password",
            generatePassword: "Generate Strong Password",
            copyPassword: "Copy",
            passwordCopied: "Password copied",
            createUser: "Create User",
            userCreated: "User created",
            passwordReset: "Password reset",
            statusChanged: "User status changed",
            admin: "Admin",
            worker: "Staff",
        },

        // Activity/Audit
        activityLog: {
            title: "Activity Log",
            subtitle: "View system activities",
            time: "Time",
            actor: "User",
            action: "Action",
            entityType: "Entity Type",
            entityId: "Entity ID",
            ip: "IP Address",
            payload: "Details",
            noActivity: "No activity found",
            viewDetails: "View Details",
            payloadWarning: "This data may contain sensitive information",
            actions: {
                LOGIN: "Login",
                LOGOUT: "Logout",
                TRANSACTION_ADD: "Add Transaction",
                CHAT_QUERY: "AI Query",
                USER_CREATE: "Create User",
                USER_PASSWORD_RESET: "Reset Password",
                USER_TOGGLE_ACTIVE: "Status Change",
            },
            dateRange: "Date Range",
            from: "From",
            to: "To",
        },
    },
} as const

export type Language = keyof typeof translations
export type TranslationKeys = typeof translations.tr
