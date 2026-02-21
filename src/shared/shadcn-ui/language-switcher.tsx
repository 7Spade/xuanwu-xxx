"use client"

import { useI18n } from "@/shared/app-providers/i18n-provider"
import { type Locale } from "@/shared/i18n-types/i18n"
import { Button } from "@/shared/shadcn-ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/shadcn-ui/dropdown-menu"
import { Globe } from "lucide-react"

const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  "zh-TW": "繁體中文",
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9">
          <Globe className="size-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLocale("en")}
          className={locale === "en" ? "bg-accent" : ""}
        >
          {LOCALE_NAMES["en"]}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale("zh-TW")}
          className={locale === "zh-TW" ? "bg-accent" : ""}
        >
          {LOCALE_NAMES["zh-TW"]}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
