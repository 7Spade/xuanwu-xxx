"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/shared/shadcn-ui/card"
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
import type { PartnerInvite, MemberReference } from "@/shared/types"
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
import { useApp } from "@/features/workspace-core"
import { useAccount } from "@/features/account"
import { useAccountManagement } from "@/features/account"
import type { Team } from "@/shared/types"
import { PageHeader } from "@/shared/shadcn-ui/page-header"

/**
 * PartnerDetailView - Manages recruitment and identity governance within a specific partner team.
 * REFACTORED: Now consumes invites from the global AppContext.
 */
export function PartnerDetailView() {
  const { id: teamId } = useParams()
  const router = useRouter()

  const { state: appState } = useApp()
  const { state: accountState } = useAccount()
  const { accounts, activeAccount } = appState
  const { invites } = accountState
  const { sendPartnerInvite, dismissPartnerMember } = useAccountManagement()
  
  const [mounted, setMounted] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeOrg = useMemo(() => 
    activeAccount?.accountType === 'organization' ? accounts[activeAccount.id] : null,
    [accounts, activeAccount]
  )

  const team = useMemo(() => 
    activeOrg?.teams?.find((team: Team) => team.id === teamId && team.type === 'external'),
    [activeOrg, teamId]
  )
  
  const teamInvites = useMemo(() => 
    Object.values(invites).filter(invite => invite.teamId === teamId),
    [invites, teamId]
  )

  if (!mounted || !team || !activeOrg) return null

  const teamMembers = (activeOrg.members || []).filter((m: MemberReference) => team.memberIds?.includes(m.id))

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return

    try {
      await sendPartnerInvite(team.id, inviteEmail)
      setInviteEmail("")
      setIsInviteOpen(false)
      toast({ title: "Recruitment protocol sent", description: `${inviteEmail} will receive a resonance request.` })
    } catch (e: any) {
      console.error("Error sending invite:", e)
      toast({
        variant: "destructive",
        title: "Failed to Send Invite",
        description: e.message || "An unknown error occurred.",
      })
    }
  }
  
  const handleDismissMember = async (member: MemberReference) => {
    if (!activeOrg) return

    try {
      await dismissPartnerMember(team.id, member)
      toast({ title: "Partner relationship terminated" })
    } catch (e: any) {
      console.error("Error dismissing partner member:", e)
      toast({
        variant: "destructive",
        title: "Failed to Dismiss Partner",
        description: e.message || "An unknown error occurred.",
      })
    }
  }


  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 hover:bg-accent/5">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Partner Governance / {team.name}</span>
      </div>

      <PageHeader 
        title={team.name} 
        description={team.description}
      >
        <Button className="gap-2 font-bold uppercase text-[11px] tracking-widest h-10 px-6 shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90" onClick={() => setIsInviteOpen(true)}>
          <MailPlus className="w-4 h-4" /> Recruit New Partner
        </Button>
      </PageHeader>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="bg-muted/40 p-1 border border-border/50 rounded-xl">
          <TabsTrigger value="members" className="text-xs font-bold uppercase tracking-widest px-6 data-[state=active]:text-accent">Resonating Members ({teamMembers.length})</TabsTrigger>
          <TabsTrigger value="invites" className="text-xs font-bold uppercase tracking-widest px-6">Pending Recruits ({teamInvites.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member: MemberReference) => (
              <Card key={member.id} className="border-border/60 bg-card/40 backdrop-blur-sm border-l-4 border-l-accent group">
                <CardHeader className="p-4 flex flex-row items-center gap-4 pb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold border border-accent/20">
                    {member.name?.[0] || 'P'}
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
                    <CardDescription className="text-[10px] font-mono opacity-60">{member.email}</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="border-t border-border/10 py-3 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 ml-auto text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => handleDismissMember(member)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {teamMembers.length === 0 && (
              <div className="col-span-full p-20 text-center border-2 border-dashed rounded-3xl bg-muted/5 opacity-30">
                <Globe className="w-12 h-12 mx-auto mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">This team has no resonating partner identities yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invites">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamInvites.map((invite: PartnerInvite) => (
              <Card key={invite.id} className="border-border/60 bg-muted/5 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <Badge variant="secondary" className="text-[8px] font-black uppercase bg-amber-500/10 text-amber-600 border-none">{invite.inviteState}</Badge>
                </div>
                <CardHeader>
                  <div className="p-2 bg-background rounded-lg border w-fit mb-3">
                    <Clock className="w-4 h-4 text-muted-foreground animate-pulse" />
                  </div>
                  <CardTitle className="text-sm font-bold truncate">{invite.email}</CardTitle>
                  <CardDescription className="text-[10px] font-mono">Sent: {invite.invitedAt?.seconds ? new Date(invite.invitedAt.seconds * 1000).toLocaleDateString() : 'Syncing...'}</CardDescription>
                </CardHeader>
                <CardFooter className="border-t border-border/10 py-3">
                  <p className="text-[9px] text-muted-foreground italic">Awaiting external entity to sign in and accept protocol...</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-accent p-8 text-white">
            <DialogHeader>
              <DialogTitle className="font-headline text-3xl flex items-center gap-3">
                <SendHorizontal className="w-8 h-8" /> Send Recruitment Protocol
              </DialogTitle>
              <DialogDescription className="text-accent-foreground/80 mt-2 font-medium">
                Send a temporary digital resonance invitation to an external entity and mount them to "{team.name}".
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Partner Contact Endpoint (Email)</Label>
              <Input 
                value={inviteEmail} 
                onChange={(e) => setInviteEmail(e.target.value)} 
                placeholder="partner@external-corp.io" 
                className="rounded-2xl h-12 border-muted-foreground/20 focus-visible:ring-accent/30"
              />
            </div>
            <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-accent mt-0.5" />
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-accent uppercase tracking-widest">Security Declaration</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Upon acceptance, the invitee will be granted "Guest" permissions. All operations will be restricted by the isolation protocol and will not have access to other unrelated dimensional spaces.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-muted/30 border-t">
            <Button variant="ghost" onClick={() => setIsInviteOpen(false)} className="rounded-xl font-bold uppercase text-[10px] tracking-widest">Cancel</Button>
            <Button onClick={handleSendInvite} className="bg-accent hover:bg-accent/90 rounded-xl px-8 shadow-lg shadow-accent/20 font-bold uppercase text-[10px] tracking-widest">Initiate Recruitment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
