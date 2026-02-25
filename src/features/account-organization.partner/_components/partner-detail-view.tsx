"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/shadcn-ui/card"
import { Badge } from "@/shared/shadcn-ui/badge"
import { Button } from "@/shared/shadcn-ui/button"
import { 
  ArrowLeft, 
  MailPlus, 
  Trash2, 
  Globe, 
  Clock, 
  ShieldCheck,
  SendHorizontal
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { toast } from "@/shared/utility-hooks/use-toast"
import type { PartnerInvite, MemberReference , Team } from "@/shared/types"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/shared/shadcn-ui/dialog"
import { Input } from "@/shared/shadcn-ui/input"
import { Label } from "@/shared/shadcn-ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn-ui/tabs"
import { useApp } from "@/shared/app-providers/app-context"
import { usePartnerManagement } from "../_hooks/use-partner-management"
import { subscribeToOrgPartnerInvites } from "../_queries"
import { PageHeader } from "@/shared/ui/page-header"

/**
 * PartnerDetailView - Manages recruitment and identity governance within a specific partner team.
 * Invites are subscribed directly from `accounts/{orgId}/invites` (Account BC / Subject Center)
 * via subscribeToOrgPartnerInvites — NOT via useAccount (WorkspaceContainer).
 */
export function PartnerDetailView() {
  const { id: teamId } = useParams()
  const router = useRouter()

  const { state: appState } = useApp()
  const { accounts, activeAccount } = appState
  const { sendPartnerInvite, dismissPartnerMember } = usePartnerManagement()

  const [mounted, setMounted] = useState(false)
  const [invites, setInvites] = useState<PartnerInvite[]>([])
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  // Subscribe to this org's invites directly (Account BC data — accounts/{orgId}/invites)
  useEffect(() => {
    const orgId = activeAccount?.id
    if (!orgId) return
    const unsub = subscribeToOrgPartnerInvites(orgId, setInvites)
    return unsub
  }, [activeAccount?.id])

  const activeOrganization = useMemo(() =>
    activeAccount?.accountType === 'organization' ? accounts[activeAccount.id] : null,
    [accounts, activeAccount]
  )

  const team = useMemo(() =>
    activeOrganization?.teams?.find((team: Team) => team.id === teamId && team.type === 'external'),
    [activeOrganization, teamId]
  )

  const teamInvites = useMemo(() =>
    invites.filter(invite => invite.teamId === teamId),
    [invites, teamId]
  )

  if (!mounted || !team || !activeOrganization) return null

  const teamMembers = (activeOrganization.members || []).filter((m: MemberReference) => team.memberIds?.includes(m.id))

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return

    try {
      await sendPartnerInvite(team.id, inviteEmail)
      setInviteEmail("")
      setIsInviteOpen(false)
      toast({ title: "Recruitment protocol sent", description: `${inviteEmail} will receive a resonance request.` })
    } catch (e: unknown) {
      console.error("Error sending invite:", e)
      toast({
        variant: "destructive",
        title: "Failed to Send Invite",
        description: (e instanceof Error ? e.message : null) || "An unknown error occurred.",
      })
    }
  }
  
  const handleDismissMember = async (member: MemberReference) => {
    if (!activeOrganization) return

    try {
      await dismissPartnerMember(team.id, member)
      toast({ title: "Partner relationship terminated" })
    } catch (e: unknown) {
      console.error("Error dismissing partner member:", e)
      toast({
        variant: "destructive",
        title: "Failed to Dismiss Partner",
        description: (e instanceof Error ? e.message : null) || "An unknown error occurred.",
      })
    }
  }


  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 duration-500 animate-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="size-8 hover:bg-accent/5">
          <ArrowLeft className="size-4" />
        </Button>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Partner Governance / {team.name}</span>
      </div>

      <PageHeader 
        title={team.name} 
        description={team.description}
      >
        <Button className="h-10 gap-2 bg-accent px-6 text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-accent/20 hover:bg-accent/90" onClick={() => setIsInviteOpen(true)}>
          <MailPlus className="size-4" /> Recruit New Partner
        </Button>
      </PageHeader>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="rounded-xl border border-border/50 bg-muted/40 p-1">
          <TabsTrigger value="members" className="px-6 text-xs font-bold uppercase tracking-widest data-[state=active]:text-accent">Resonating Members ({teamMembers.length})</TabsTrigger>
          <TabsTrigger value="invites" className="px-6 text-xs font-bold uppercase tracking-widest">Pending Recruits ({teamInvites.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member: MemberReference) => (
              <Card key={member.id} className="group border-l-4 border-border/60 border-l-accent bg-card/40 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <div className="flex size-12 items-center justify-center rounded-full border border-accent/20 bg-accent/10 font-bold text-accent">
                    {member.name?.[0] || 'P'}
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
                    <CardDescription className="font-mono text-[10px] opacity-60">{member.email}</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-end border-t border-border/10 py-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-auto size-7 text-muted-foreground transition-colors hover:text-destructive"
                    onClick={() => handleDismissMember(member)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {teamMembers.length === 0 && (
              <div className="col-span-full rounded-3xl border-2 border-dashed bg-muted/5 p-20 text-center opacity-30">
                <Globe className="mx-auto mb-4 size-12" />
                <p className="text-xs font-bold uppercase tracking-widest">This team has no resonating partner identities yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invites">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamInvites.map((invite: PartnerInvite) => (
              <Card key={invite.id} className="relative overflow-hidden border-border/60 bg-muted/5 backdrop-blur-sm">
                <div className="absolute right-0 top-0 p-2">
                  <Badge variant="secondary" className="border-none bg-amber-500/10 text-[8px] font-black uppercase text-amber-600">{invite.inviteState}</Badge>
                </div>
                <CardHeader>
                  <div className="mb-3 w-fit rounded-lg border bg-background p-2">
                    <Clock className="size-4 animate-pulse text-muted-foreground" />
                  </div>
                  <CardTitle className="truncate text-sm font-bold">{invite.email}</CardTitle>
                  <CardDescription className="font-mono text-[10px]">Sent: {invite.invitedAt?.seconds ? new Date(invite.invitedAt.seconds * 1000).toLocaleDateString() : 'Syncing...'}</CardDescription>
                </CardHeader>
                <CardFooter className="border-t border-border/10 py-3">
                  <p className="text-[9px] italic text-muted-foreground">Awaiting external entity to sign in and accept protocol...</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="overflow-hidden rounded-[2rem] border-none p-0 shadow-2xl">
          <div className="bg-accent p-8 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 font-headline text-3xl">
                <SendHorizontal className="size-8" /> Send Recruitment Protocol
              </DialogTitle>
              <DialogDescription className="mt-2 font-medium text-accent-foreground/80">
                Send a temporary digital resonance invitation to an external entity and mount them to &quot;{team.name}&quot;.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="space-y-6 p-8">
            <div className="space-y-2">
              <Label className="px-1 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Partner Contact Endpoint (Email)</Label>
              <Input 
                value={inviteEmail} 
                onChange={(e) => setInviteEmail(e.target.value)} 
                placeholder="partner@external-corp.io" 
                className="h-12 rounded-2xl border-muted-foreground/20 focus-visible:ring-accent/30"
              />
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-accent/10 bg-accent/5 p-4">
              <ShieldCheck className="mt-0.5 size-5 text-accent" />
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Security Declaration</p>
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  Upon acceptance, the invitee will be granted &quot;Guest&quot; permissions. All operations will be restricted by the isolation protocol and will not have access to other unrelated dimensional spaces.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t bg-muted/30 p-6">
            <Button variant="ghost" onClick={() => setIsInviteOpen(false)} className="rounded-xl text-[10px] font-bold uppercase tracking-widest">Cancel</Button>
            <Button onClick={handleSendInvite} className="rounded-xl bg-accent px-8 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-accent/20 hover:bg-accent/90">Initiate Recruitment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
