"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/shadcn-ui/card"
import { Badge } from "@/shared/shadcn-ui/badge"
import { Button } from "@/shared/shadcn-ui/button"
import { Handshake, Plus, FolderTree, ArrowRight, Globe, AlertCircle } from "lucide-react"
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
import { useApp } from "@/react-hooks/state-hooks/use-app"
import { useAccountManagement } from "@/react-hooks/state-hooks/use-account-management"
import { useI18n } from "@/shared/app-providers/i18n-provider"
import type { Team } from "@/domain-types/domain"
import { PageHeader } from "@/shared/shadcn-ui/page-header"

/**
 * PartnersView - Manages logical groupings of EXTERNAL partners (Partner Teams).
 * Principle: Create a team first, then invite members into it.
 */
export function PartnersView() {
  const { state } = useApp()
  const { t } = useI18n()
  const { accounts, activeAccount } = state
  const { createTeam } = useAccountManagement()
  const [mounted, setMounted] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeOrg = useMemo(() => 
    activeAccount?.accountType === 'organization' ? accounts[activeAccount.id] : null,
    [accounts, activeAccount]
  )

  if (!mounted) return null

  if (!activeOrg) {
    return (
        <div className="p-8 text-center flex flex-col items-center gap-4">
            <AlertCircle className="w-10 h-10 text-muted-foreground" />
            <h3 className="font-bold">{t('account.governanceNotAvailable')}</h3>
            <p className="text-sm text-muted-foreground">
                {t('account.governanceNotAvailableDescription')}
            </p>
        </div>
      )
  }

  const partnerTeams = (activeOrg.teams || []).filter((team: Team) => team.type === 'external')

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return
    
    try {
      await createTeam(newTeamName, 'external')
      setNewTeamName("")
      setIsCreateOpen(false)
      toast({ title: "Partner Team created" })
    } catch (e: any) {
      console.error("Error creating partner team:", e)
      toast({
        variant: "destructive",
        title: "Failed to Create Team",
        description: e.message || "An unknown error occurred.",
      })
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title={t('account.partnersTitle')} 
        description={t('account.partnersDescription')}
      >
        <Button className="gap-2 font-bold uppercase text-[11px] tracking-widest h-10 px-6 shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> {t('account.createPartnerTeam')}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partnerTeams.map((team: Team) => (
          <Card 
            key={team.id} 
            className="border-border/60 hover:border-accent/40 transition-all cursor-pointer group bg-card/40 backdrop-blur-sm shadow-sm" 
            onClick={() => router.push(`/dashboard/account/partners/${team.id}`)}
          >
            <CardHeader className="pb-4">
              <div className="p-2.5 w-fit bg-accent/5 rounded-xl text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                <Globe className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-headline group-hover:text-accent transition-colors">{team.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">{team.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-[10px] font-bold bg-accent/10 text-accent border-none px-2">
                {(team.memberIds || []).length} {t('account.resonatingPartners')}
              </Badge>
            </CardContent>
            <CardFooter className="border-t border-border/10 py-4 flex justify-between items-center bg-muted/5">
              <span className="text-[9px] font-mono text-muted-foreground">TID: {team.id.toUpperCase()}</span>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[9px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5">
                {t('account.manageAndRecruit')} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        <div 
          className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-muted/5 border-border/40 hover:bg-accent/5 hover:border-accent/20 transition-all cursor-pointer group min-h-[240px]"
          onClick={() => setIsCreateOpen(true)}
        >
          <div className="p-4 rounded-full bg-muted/10 group-hover:bg-accent/10 transition-colors">
            <Handshake className="w-10 h-10 text-muted-foreground group-hover:text-accent transition-colors opacity-30" />
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-4">{t('account.createCollaborationBoundary')}</p>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">{t('account.createPartnerTeamTitle')}</DialogTitle>
            <DialogDescription>{t('account.createPartnerTeamDescription')}</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest">{t('account.teamName')}</Label>
            <Input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder={t('account.partnerTeamNamePlaceholder')} className="rounded-xl h-11" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">{t('common.cancel')}</Button>
            <Button onClick={handleCreateTeam} className="bg-accent hover:bg-accent/90 rounded-xl px-8 shadow-lg shadow-accent/20">{t('account.createPartnerTeam')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
