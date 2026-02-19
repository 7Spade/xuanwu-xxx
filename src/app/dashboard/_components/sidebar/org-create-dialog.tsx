
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/app/_components/ui/dialog"
import { Button } from "@/app/_components/ui/button"
import { Label } from "@/app/_components/ui/label"
import { Input } from "@/app/_components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/ui/use-toast"
import { Account } from "@/types/domain"

interface OrgCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  createOrganization: (name: string) => Promise<string>
  dispatch: React.Dispatch<any>
  accounts: Record<string, Account>
  t: (key: string) => string
}

export function OrgCreateDialog({
  open,
  onOpenChange,
  createOrganization,
  dispatch,
  accounts,
  t,
}: OrgCreateDialogProps) {
  const [newOrgName, setNewOrgName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pendingOrgId, setPendingOrgId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setNewOrgName("")
      setIsLoading(false)
      setPendingOrgId(null)
    }
  }, [open])

  useEffect(() => {
    if (pendingOrgId && accounts[pendingOrgId]) {
      const org = accounts[pendingOrgId]
      dispatch({ type: "SET_ACTIVE_ACCOUNT", payload: { ...org, accountType: "organization" } })
      setPendingOrgId(null)
    }
  }, [pendingOrgId, accounts, dispatch])

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return
    setIsLoading(true)
    try {
      const newOrgId = await createOrganization(newOrgName)
      setPendingOrgId(newOrgId)
      onOpenChange(false)
      toast({ title: t('dimension.newDimensionCreated') })
    } catch (error: any) {
      toast({ variant: "destructive", title: t('dimension.failedToCreate'), description: error.message })
      setPendingOrgId(null)
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
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            {t('dimension.dimensionName')}
          </Label>
          <Input
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder={t('dimension.dimensionNamePlaceholder')}
            className="rounded-xl h-12"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl" disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreateOrg} className="rounded-xl px-8 shadow-lg shadow-primary/20" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
