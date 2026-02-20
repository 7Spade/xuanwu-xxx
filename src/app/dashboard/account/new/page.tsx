// [職責] Canonical full-page account creation — shown on direct URL access to /dashboard/account/new
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/shadcn-ui/button"
import { Label } from "@/shared/shadcn-ui/label"
import { Input } from "@/shared/shadcn-ui/input"
import { Loader2 } from "lucide-react"
import { useI18n } from "@/shared/context/i18n-context"
import { toast } from "@/shared/hooks/use-toast"
import { useAccountManagement } from "@/hooks/state/use-account-management"
import { useApp } from "@/hooks/state/use-app"

export default function AccountNewPage() {
  const router = useRouter()
  const { t } = useI18n()
  const { createOrganization } = useAccountManagement()
  const { state: appState, dispatch } = useApp()
  const { accounts } = appState

  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pendingOrgId, setPendingOrgId] = useState<string | null>(null)

  useEffect(() => {
    if (pendingOrgId && accounts[pendingOrgId]) {
      const org = accounts[pendingOrgId]
      dispatch({ type: "SET_ACTIVE_ACCOUNT", payload: { ...org, accountType: "organization" } })
      setPendingOrgId(null)
      router.push("/dashboard")
    }
  }, [pendingOrgId, accounts, dispatch, router])

  const handleCreate = async () => {
    if (!name.trim()) return
    setIsLoading(true)
    try {
      const newOrgId = await createOrganization(name.trim())
      setPendingOrgId(newOrgId)
      toast({ title: t("dimension.newDimensionCreated") })
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error"
      toast({ variant: "destructive", title: t("dimension.failedToCreate"), description: msg })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🐢</div>
          <h1 className="font-headline text-2xl font-bold">{t("dimension.createTitle")}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t("dimension.createDescription")}</p>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            {t("dimension.dimensionName")}
          </Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            placeholder={t("dimension.dimensionNamePlaceholder")}
            className="rounded-xl h-12"
            autoFocus
          />
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl"
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleCreate}
            className="rounded-xl px-8 shadow-lg shadow-primary/20"
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.creating")}
              </>
            ) : (
              t("dimension.createDimension")
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
