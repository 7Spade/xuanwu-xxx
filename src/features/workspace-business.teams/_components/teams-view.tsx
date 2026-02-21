"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/shadcn-ui/card"
import { Badge } from "@/shared/shadcn-ui/badge"
import { Button } from "@/shared/shadcn-ui/button"
import { Users, Plus, FolderTree, ArrowRight, AlertCircle } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/shared/shadcn-ui/dialog"
import { Label } from "@/shared/shadcn-ui/label"
import { Input } from "@/shared/shadcn-ui/input"
import { useRouter } from "next/navigation"
import { toast } from "@/shared/utility-hooks/use-toast"
import { useApp } from "@/features/workspace-core"
import { useAccountManagement } from "@/features/account"
import { useI18n } from "@/shared/app-providers/i18n-provider"
import type { Team } from "@/shared/types"
import { PageHeader } from "@/shared/shadcn-ui/page-header"

/**
 * TeamsView - Manages the logical groupings of INTERNAL members within the dimension.
 */
export function TeamsView() {
  const router = useRouter()
  const { t } = useI18n()
  const { state } = useApp()
  const { accounts, activeAccount } = state
  const { createTeam } = useAccountManagement()
  const [mounted, setMounted] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")

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

  const teams = (activeOrg.teams || []).filter((team: Team) => team.type === 'internal')

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return
    
    try {
      await createTeam(newTeamName, 'internal')
      setNewTeamName("")
      setIsCreateOpen(false)
      toast({ title: t('account.internalTeamCreated') })
    } catch (error: unknown) {
      console.error("Error creating internal team:", error)
      const message = error instanceof Error ? error.message : t('common.unknownError')
      toast({
        variant: "destructive",
        title: t('account.failedToCreateTeam'),
        description: message,
      })
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title={t('account.teamsTitle')} 
        description={t('account.teamsDescription')}
      >
        <Button className="gap-2 font-bold uppercase text-[11px] tracking-widest h-10" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> {t('account.createInternalTeam')}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team: Team) => (
          <Card key={team.id} className="border-border/60 hover:border-primary/40 transition-all cursor-pointer group" onClick={() => router.push(`/dashboard/account/teams/${team.id}`)}>
            <CardHeader>
              <div className="p-2.5 w-fit bg-primary/5 rounded-xl text-primary mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Users className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-headline">{team.name}</CardTitle>
              <CardDescription className="text-xs">{team.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-[10px] font-bold">
                {(team.memberIds || []).length} {t('account.members')}
              </Badge>
            </CardContent>
            <CardFooter className="border-t py-4 flex justify-between items-center bg-muted/5">
              <span className="text-[9px] font-mono text-muted-foreground">ID: {team.id.toUpperCase()}</span>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-[9px] font-bold uppercase tracking-widest text-primary">
                {t('account.manageMembers')} <ArrowRight className="w-3 h-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        <div 
          className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center bg-muted/5 border-border/40 hover:bg-muted/10 transition-colors cursor-pointer"
          onClick={() => setIsCreateOpen(true)}
        >
          <FolderTree className="w-8 h-8 text-muted-foreground mb-4 opacity-20" />
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">{t('account.createNewTeam')}</p>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">{t('account.createInternalTeam')}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label>{t('account.teamName')}</Label>
            <Input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder={t('account.teamNamePlaceholder')} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleCreateTeam}>{t('account.createInternalTeam')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
