"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/shared/shadcn-ui/card"
import { Button } from "@/shared/shadcn-ui/button"
import { ArrowLeft, UserPlus, Trash2, Users } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { toast } from "@/shared/utility-hooks/use-toast"
import { useApp } from "@/shared/app-providers/app-context"
import { useTeamManagement } from "@/features/account-organization.team"
import type { MemberReference, Team } from "@/shared/types"
import { PageHeader } from "@/shared/ui/page-header"

/**
 * TeamDetailView - 職責：管理特定團隊內的成員 (Team Member 清單)
 */
export function TeamDetailView() {
  const { id } = useParams()
  const router = useRouter()
  
  const { state } = useApp()
  const { accounts, activeAccount } = state
  const { updateTeamMembers } = useTeamManagement()
  const activeOrganizationId = activeAccount?.id
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const activeOrganization = useMemo(() => 
    activeOrganizationId ? accounts[activeOrganizationId] : null,
    [accounts, activeOrganizationId]
  )
  
  const team = activeOrganization?.teams?.find((team: Team) => team.id === id)

  if (!mounted) return null
  if (!activeOrganization || !team) return <div className="p-20 text-center">Team not found.</div>

  const allMembers = activeOrganization.members || []
  const teamMemberIds = team.memberIds || []

  const teamMembers = allMembers.filter((m: MemberReference) => teamMemberIds.includes(m.id))
  const otherOrgMembers = allMembers.filter((m: MemberReference) => !teamMemberIds.includes(m.id) && !m.isExternal)

  const handleMemberToggle = async (memberId: string, action: 'add' | 'remove') => {
    try {
      await updateTeamMembers(team.id, memberId, action)
      toast({ title: action === 'add' ? "Member Assigned" : "Member Removed" })
    } catch (e: unknown) {
      console.error("Error updating team members:", e)
      toast({
        variant: "destructive",
        title: `Failed to ${action === 'add' ? 'Add' : 'Remove'} Member`,
        description: (e instanceof Error ? e.message : null) || "An unknown error occurred.",
      })
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 duration-500 animate-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-8">
          <ArrowLeft className="size-4" />
        </Button>
        <span className="text-xs font-bold uppercase tracking-widest">Internal Team Management / {team.name}</span>
      </div>

      <PageHeader 
        title={team.name} 
        description={team.description}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-widest">Team Members ({teamMembers.length})</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {teamMembers.map((member: MemberReference) => (
              <Card key={member.id} className="border-border/60 bg-card/40 backdrop-blur-sm">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {member.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{member.name}</p>
                      <p className="text-[10px] text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleMemberToggle(member.id, 'remove')}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {teamMembers.length === 0 && (
              <div className="col-span-full rounded-xl border-2 border-dashed p-12 text-center">
                <Users className="mx-auto mb-2 size-8 opacity-10" />
                <p className="text-xs text-muted-foreground">No members are currently assigned to this team.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest">Available Members</h3>
          <Card className="border-border/60 bg-muted/5">
            <CardContent className="space-y-4 p-4">
              {otherOrgMembers.map((member: MemberReference) => (
                <div key={member.id} className="group flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-full border bg-background text-[10px]">
                      {member.name?.[0] || 'U'}
                    </div>
                    <span className="text-xs font-medium">{member.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase text-primary" onClick={() => handleMemberToggle(member.id, 'add')}>
                    <UserPlus className="mr-1 size-3.5" /> Add
                  </Button>
                </div>
              ))}
              {otherOrgMembers.length === 0 && (
                <p className="py-4 text-center text-[10px] italic text-muted-foreground">
                  All internal members have been assigned to a team.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
