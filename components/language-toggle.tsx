"use client"

import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/lib/store/language-store"

export function LanguageToggle() {
    const { t, language, setLanguage } = useTranslation()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Languages className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">{t.language.toggle}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => setLanguage("tr")}
                    className={language === 'tr' ? 'bg-accent' : ''}
                >
                    🇹🇷 {t.language.tr}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setLanguage("en")}
                    className={language === 'en' ? 'bg-accent' : ''}
                >
                    🇬🇧 {t.language.en}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
