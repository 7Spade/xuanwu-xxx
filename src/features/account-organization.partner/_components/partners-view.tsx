"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/shadcn-ui/card"
import { Badge } from "@/shared/shadcn-ui/badge"
import { Button } from "@/shared/shadcn-ui/button"
import { Handshake, Plus, ArrowRight, Globe, AlertCircle } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/shared/shadcn-ui/dialog"
import { Label } from "@/shared/shadcn-ui/label"
import { Input } from "@/shared/shadcn-ui/input"
import { useRouter } from "next/navigation"
import { toast } from "@/shared/utility-hooks/use-toast"
import { useApp } from "@/shared/app-providers/app-context"
import { usePartnerManagement } from "@/features/account-organization.partner"
import { useI18n } from "@/shared/app-providers/i18n-provider"
import type { Team } from "@/shared/types"
import { PageHeader } from "@/shared/ui/page-header"

/**
 * PartnersView - Manages logical groupings of EXTERNAL partners (Partner Teams).
 * Principle: Create a team first, then invite members into it.
 */
export function PartnersView() {
  const { state } = useApp()
  const { t } = useI18n()
  const { accounts, activeAccount } = state
  const { createPartnerGroup } = usePartnerManagement()
  const [mounted, setMounted] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeOrganization = useMemo(() => 
    activeAccount?.accountType === 'organization' ? accounts[activeAccount.id] : null,
    [accounts, activeAccount]
  )

  if (!mounted) return null

  if (!activeOrganization) {
    return (
        <div className="flex flex-col items-center gap-4 p-8 text-center">
            <AlertCircle className="size-10 text-muted-foreground" />
            <h3 className="font-bold">{t('account.governanceNotAvailable')}</h3>
            <p className="text-sm text-muted-foreground">
                {t('account.governanceNotAvailableDescription')}
            </p>
        </div>
      )
  }

  const partnerTeams = (activeOrganization.teams || []).filter((team: Team) => team.type === 'external')

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return
    
    try {
      await createPartnerGroup(newTeamName)
      setNewTeamName("")
      setIsCreateOpen(false)
      toast({ title: "Partner Team created" })
    } catch (e: unknown) {
      console.error("Error creating partner team:", e)
      toast({
        variant: "destructive",
        title: "Failed to Create Team",
        description: (e instanceof Error ? e.message : null) || "An unknown error occurred.",
      })
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 duration-500 animate-in fade-in">
      <PageHeader 
        title={t('account.partnersTitle')} 
        description={t('account.partnersDescription')}
      >
        <Button className="h-10 gap-2 bg-accent px-6 text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-accent/20 hover:bg-accent/90" onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4" /> {t('account.createPartnerTeam')}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {partnerTeams.map((team: Team) => (
          <Card 
            key={team.id} 
            className="group cursor-pointer border-border/60 bg-card/40 shadow-sm backdrop-blur-sm transition-all hover:border-accent/40" 
            onClick={() => router.push(`/dashboard/account/partners/${team.id}`)}
          >
            <CardHeader className="pb-4">
              <div className="mb-4 w-fit rounded-xl bg-accent/5 p-2.5 text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-white">
                <Globe className="size-5" />
              </div>
              <CardTitle className="font-headline text-lg transition-colors group-hover:text-accent">{team.name}</CardTitle>
              <CardDescription className="line-clamp-2 text-xs">{team.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="border-none bg-accent/10 px-2 text-[10px] font-bold text-accent">
                {(team.memberIds || []).length} {t('account.resonatingPartners')}
              </Badge>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-border/10 bg-muted/5 py-4">
              <span className="font-mono text-[9px] text-muted-foreground">TID: {team.id.toUpperCase()}</span>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[9px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5">
                {t('account.manageAndRecruit')} <ArrowRight className="size-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        <button 
          type="button"
          className="group flex min-h-[240px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 p-8 text-center transition-all hover:border-accent/20 hover:bg-accent/5"
          onClick={() => setIsCreateOpen(true)}
        >
          <div className="rounded-full bg-muted/10 p-4 transition-colors group-hover:bg-accent/10">
            <Handshake className="size-10 text-muted-foreground opacity-30 transition-colors group-hover:text-accent" />
          </div>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('account.createCollaborationBoundary')}</p>
        </button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">{t('account.createPartnerTeamTitle')}</DialogTitle>
            <DialogDescription>{t('account.createPartnerTeamDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <Label className="text-xs font-bold uppercase tracking-widest">{t('account.teamName')}</Label>
            <Input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder={t('account.partnerTeamNamePlaceholder')} className="h-11 rounded-xl" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">{t('common.cancel')}</Button>
            <Button onClick={handleCreateTeam} className="rounded-xl bg-accent px-8 shadow-lg shadow-accent/20 hover:bg-accent/90">{t('account.createPartnerTeam')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
