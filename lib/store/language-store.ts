import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { translations } from '@/lib/i18n/translations'

export type Language = 'tr' | 'en'

interface LanguageState {
    language: Language
    setLanguage: (lang: Language) => void
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'tr' as Language,
            setLanguage: (lang: Language) => set({ language: lang }),
        }),
        {
            name: 'language-storage',
        }
    )
)

// Hook to get translations - reads language from store and returns correct translations
export function useTranslation() {
    const { language, setLanguage } = useLanguageStore()
    // Use 'as const' assertion removed translations, access directly
    const t = language === 'tr' ? translations.tr : translations.en
    return { t, language, setLanguage }
}
