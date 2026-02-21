// [職責] Canonical full-page account creation — shown on direct URL access to /dashboard/account/new
"use client"

import { useRouter } from "next/navigation"
import { useI18n } from "@/shared/app-providers/i18n-provider"
import { AccountNewForm } from "@/features/account"

export default function AccountNewPage() {
  const router = useRouter()
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🐢</div>
          <h1 className="font-headline text-2xl font-bold">{t("dimension.createTitle")}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t("dimension.createDescription")}</p>
        </div>
        <AccountNewForm
          onSuccess={() => router.push("/dashboard")}
          onCancel={() => router.push("/dashboard")}
        />
      </div>
    </div>
  )
}
