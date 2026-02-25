"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/shadcn-ui/card"
import { Badge } from "@/shared/shadcn-ui/badge"
import { Button } from "@/shared/shadcn-ui/button"
import { UserPlus, Trash2, Mail, AlertCircle } from "lucide-react"
import { toast } from "@/shared/utility-hooks/use-toast"
import { useState, useEffect, useMemo } from "react"
import { type MemberReference } from "@/shared/types"
import { useApp } from "@/shared/app-providers/app-context"
import { useMemberManagement } from '../_hooks/use-member-management'
import { useI18n } from "@/shared/app-providers/i18n-provider"
import { PageHeader } from "@/shared/ui/page-header"

export function MembersView() {
  const [mounted, setMounted] = useState(false)
  const { t } = useI18n()
  const { state } = useApp()
  const { accounts, activeAccount } = state
  const { recruitMember, dismissMember } = useMemberManagement()

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

  const members = activeOrganization.members || []

  const handleRecruitMember = async () => {
    const newId = `m-${Math.random().toString(36).slice(-4)}`
    const name = "New Researcher"
    const email = `user-${newId}@orgverse.io`
    
    try {
      await recruitMember(newId, name, email)
      toast({ title: t('account.identityResonanceActivated'), description: t('account.identityResonanceDescription') })
    } catch (error: unknown) {
      console.error("Error recruiting member:", error)
      const message = error instanceof Error ? error.message : t('common.unknownError')
      toast({
        variant: "destructive",
        title: t('account.failedToRecruitMember'),
        description: message,
      })
    }
  }

  const handleDismissMember = async (member: MemberReference) => {
    try {
      await dismissMember(member)
      toast({ title: t('account.identityDeregistered'), description: t('account.memberRemoved', { name: member.name }), variant: "destructive" })
    } catch (error: unknown) {
      console.error("Error dismissing member:", error)
      const message = error instanceof Error ? error.message : t('common.unknownError')
      toast({
        variant: "destructive",
        title: t('account.failedToDismissMember'),
        description: message,
      })
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 duration-500 animate-in fade-in">
      <PageHeader 
        title={t('account.membersTitle')} 
        description={t('account.membersDescription', { name: activeOrganization.name })}
      >
        <Button className="flex h-10 items-center gap-2 px-6 text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20" onClick={handleRecruitMember}>
          <UserPlus className="size-4" /> {t('account.recruitNewMember')}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member: MemberReference) => (
          <Card key={member.id} className="group overflow-hidden border-border/60 bg-card/50 backdrop-blur-sm transition-all hover:shadow-md">
            <div className="h-1 bg-primary/20 transition-colors group-hover:bg-primary" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-bold text-primary">
                  {member.name?.[0] || 'U'}
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
                  <CardDescription className="font-mono text-[10px] opacity-60">{member.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 mt-2 flex items-center justify-between">
                <Badge variant="outline" className="border-primary/20 bg-primary/5 px-2 py-0.5 text-[9px] font-bold uppercase text-primary">
                  {member.role}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <span className={`size-1.5 rounded-full ${member.presence === 'active' ? 'animate-pulse bg-green-500' : 'bg-muted'}`} />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">{member.presence}</span>
                </div>
              </div>
              <div className="flex gap-2 border-t border-border/40 pt-4">
                <Button variant="outline" size="sm" className="h-8 flex-1 gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <Mail className="size-3" /> {t('account.contact')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDismissMember(member)}
                  disabled={member.role === 'Owner'}
                  className="h-8 hover:bg-destructive/5 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
