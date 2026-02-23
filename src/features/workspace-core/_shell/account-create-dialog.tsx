
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/shadcn-ui/dialog"
import { Button } from "@/shared/shadcn-ui/button"
import { Label } from "@/shared/shadcn-ui/label"
import { Input } from "@/shared/shadcn-ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "@/shared/utility-hooks/use-toast"
import { type Account } from "@/shared/types"
import type { AppAction } from '../_components/app-provider'

interface AccountCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  createOrganization: (name: string) => Promise<string>
  dispatch: React.Dispatch<AppAction>
  accounts: Record<string, Account>
  t: (key: string) => string
}

export function AccountCreateDialog({
  open,
  onOpenChange,
  createOrganization,
  dispatch,
  accounts,
  t,
}: AccountCreateDialogProps) {
  const [newOrganizationName, setNewOrganizationName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pendingOrganizationId, setPendingOrganizationId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setNewOrganizationName("")
      setIsLoading(false)
      setPendingOrganizationId(null)
    }
  }, [open])

  useEffect(() => {
    if (pendingOrganizationId && accounts[pendingOrganizationId]) {
      const organization = accounts[pendingOrganizationId]
      dispatch({ type: "SET_ACTIVE_ACCOUNT", payload: { ...organization, accountType: "organization" } })
      setPendingOrganizationId(null)
    }
  }, [pendingOrganizationId, accounts, dispatch])

  const handleCreate = async () => {
    if (!newOrganizationName.trim()) return
    setIsLoading(true)
    try {
      const newOrganizationId = await createOrganization(newOrganizationName)
      setPendingOrganizationId(newOrganizationId)
      onOpenChange(false)
      toast({ title: t('dimension.newDimensionCreated') })
    } catch (error: unknown) {
      toast({ variant: "destructive", title: t('dimension.failedToCreate'), description: error instanceof Error ? error.message : String(error) })
      setPendingOrganizationId(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{t('dimension.createTitle')}</DialogTitle>
          <DialogDescription>{t('dimension.createDescription')}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t('dimension.dimensionName')}
          </Label>
          <Input
            value={newOrganizationName}
            onChange={(e) => setNewOrganizationName(e.target.value)}
            placeholder={t('dimension.dimensionNamePlaceholder')}
            className="h-12 rounded-xl"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl" disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreate} className="rounded-xl px-8 shadow-lg shadow-primary/20" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t('common.creating')}
              </>
            ) : (
              t('dimension.createDimension')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
