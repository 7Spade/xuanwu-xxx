// [職責] Intercepting route — renders AccountCreateDialog as overlay from within dashboard
// Client nav: modal overlay; direct URL: falls through to dashboard/account/new/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/shadcn-ui/dialog"
import { Button } from "@/shared/shadcn-ui/button"
import { Label } from "@/shared/shadcn-ui/label"
import { Input } from "@/shared/shadcn-ui/input"
import { Loader2 } from "lucide-react"
import { useI18n } from "@/shared/context/i18n-context"
import { toast } from "@/shared/hooks/use-toast"
import { useAccountManagement } from "@/hooks/state/use-account-management"
import { useApp } from "@/hooks/state/use-app"

export default function AccountNewModalPage() {
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
      router.back()
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
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {t("dimension.createTitle")}
          </DialogTitle>
          <DialogDescription>{t("dimension.createDescription")}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            {t("dimension.dimensionName")}
          </Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            placeholder={t("dimension.dimensionNamePlaceholder")}
            className="rounded-xl h-12 mt-2"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => router.back()}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
