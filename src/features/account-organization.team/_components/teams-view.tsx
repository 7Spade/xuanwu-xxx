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
import { useApp } from "@/shared/app-providers/app-context"
import { useTeamManagement } from "@/features/account-organization.team"
import { useI18n } from "@/shared/app-providers/i18n-provider"
import type { Team } from "@/shared/types"
import { PageHeader } from "@/shared/ui/page-header"

/**
 * TeamsView - Manages the logical groupings of INTERNAL members within the dimension.
 */
export function TeamsView() {
  const router = useRouter()
  const { t } = useI18n()
  const { state } = useApp()
  const { accounts, activeAccount } = state
  const { createTeam } = useTeamManagement()
  const [mounted, setMounted] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")

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

  const teams = (activeOrganization.teams || []).filter((team: Team) => team.type === 'internal')

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
    <div className="mx-auto max-w-7xl space-y-6 duration-500 animate-in fade-in">
      <PageHeader 
        title={t('account.teamsTitle')} 
        description={t('account.teamsDescription')}
      >
        <Button className="h-10 gap-2 text-[11px] font-bold uppercase tracking-widest" onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4" /> {t('account.createInternalTeam')}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team: Team) => (
          <Card key={team.id} className="group cursor-pointer border-border/60 transition-all hover:border-primary/40" onClick={() => router.push(`/dashboard/account/teams/${team.id}`)}>
            <CardHeader>
              <div className="mb-2 w-fit rounded-xl bg-primary/5 p-2.5 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                <Users className="size-5" />
              </div>
              <CardTitle className="font-headline text-lg">{team.name}</CardTitle>
              <CardDescription className="text-xs">{team.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-[10px] font-bold">
                {(team.memberIds || []).length} {t('account.members')}
              </Badge>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t bg-muted/5 py-4">
              <span className="font-mono text-[9px] text-muted-foreground">ID: {team.id.toUpperCase()}</span>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-[9px] font-bold uppercase tracking-widest text-primary">
                {t('account.manageMembers')} <ArrowRight className="size-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        <button 
          type="button"
          className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/40 bg-muted/5 p-8 text-center transition-colors hover:bg-muted/10"
          onClick={() => setIsCreateOpen(true)}
        >
          <FolderTree className="mb-4 size-8 text-muted-foreground opacity-20" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('account.createNewTeam')}</p>
        </button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">{t('account.createInternalTeam')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
