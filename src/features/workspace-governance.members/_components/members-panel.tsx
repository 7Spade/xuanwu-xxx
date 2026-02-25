"use client";

import { useWorkspace } from '@/features/workspace-core';
import { useApp } from '@/shared/app-providers/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/shadcn-ui/card";
import { Button } from "@/shared/shadcn-ui/button";
import { Badge } from "@/shared/shadcn-ui/badge";
import { 
  Users, 
  Trash2, 
  ShieldCheck, 
  Globe, 
  Plus, 
  CheckCircle2,
  ShieldAlert,
  MoreVertical
} from "lucide-react";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn-ui/tabs";
import { toast } from "@/shared/utility-hooks/use-toast";
import { type Team, type WorkspaceRole, type MemberReference } from "@/shared/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/shadcn-ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/shadcn-ui/select";
import { Label } from "@/shared/shadcn-ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/shadcn-ui/dropdown-menu";
import { cn } from "@/shared/lib";


const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

// TODO: [Refactor Grant Model] This component now uses a safer update pattern, but the core access model is still a composite of team-based access (`workspace.teamIds`) and individual-based access (`workspace.grants`). A more robust, unified model would represent team access as a special type of grant (e.g., a grant with a `teamId` instead of a `userId`). This would simplify both security rules and client-side logic into a single, expressive `grants` array.

/**
 * WorkspaceMembers - Comprehensive access governance for the workspace.
 * Implements a unified authorization system for Internal and Partner Teams using WorkspaceGrant.
 */
export function WorkspaceMembers() {
  const { workspace, logAuditEvent, authorizeWorkspaceTeam, revokeWorkspaceTeam, grantIndividualWorkspaceAccess, revokeIndividualWorkspaceAccess } = useWorkspace();
  const { state } = useApp();
  const { accounts, activeAccount } = state;
  const activeOrganizationId = activeAccount?.accountType === 'organization' ? activeAccount.id : null;

  const [grantTarget, setGrantTarget] = useState<MemberReference | null>(null);
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>('Contributor');
  const [loadingTeamId, setLoadingTeamId] = useState<string | null>(null);
  const [loadingGrantId, setLoadingGrantId] = useState<string | null>(null);

  const activeOrganization = useMemo(() => 
    activeOrganizationId ? accounts[activeOrganizationId] : null,
    [accounts, activeOrganizationId]
  );

  const handleToggleTeam = async (team: Team, isAuthorized: boolean) => {
    if (loadingTeamId) return;
    setLoadingTeamId(team.id);
    try {
      if (isAuthorized) {
        await revokeWorkspaceTeam(team.id);
        logAuditEvent("Revoked Team Access", team.name, 'delete');
        toast({ title: "Access Revoked" });
      } else {
        await authorizeWorkspaceTeam(team.id);
        logAuditEvent("Authorized Team", team.name, 'create');
        toast({ title: "Team Access Granted" });
      }
    } catch (error: unknown) {
      console.error("Error toggling team access:", error);
      toast({
        variant: "destructive",
        title: "Permission Update Failed",
        description: getErrorMessage(error, "You may not have the required permissions."),
      });
    } finally {
      setLoadingTeamId(null);
    }
  };

  const handleConfirmGrant = async () => {
    if (!grantTarget || loadingGrantId) return;
    setLoadingGrantId('new');
    try {
      await grantIndividualWorkspaceAccess(grantTarget.id, selectedRole, workspace.protocol);
      logAuditEvent("Authorized Individual", `${grantTarget.name} as ${selectedRole}`, 'create');
      toast({ title: "Individual Access Granted" });
      setGrantTarget(null);
    } catch (error: unknown) {
      console.error("Error granting access:", error);
      toast({
        variant: "destructive",
        title: "Grant Failed",
        description: getErrorMessage(error, "You may not have the required permissions."),
      });
    } finally {
      setLoadingGrantId(null);
    }
  };

  const handleRevokeGrant = async (grantId: string) => {
    if (loadingGrantId) return;
    setLoadingGrantId(grantId);
    try {
      const grant = (workspace.grants || []).find(g => g.grantId === grantId);
      const member = (activeOrganization?.members || []).find(m => m.id === grant?.userId);
      
      await revokeIndividualWorkspaceAccess(grantId);
      
      logAuditEvent("Revoked Individual Access", member?.name || grantId, 'delete');
      toast({ title: "Individual Access Revoked", variant: "destructive" });
    } catch (error: unknown) {
      console.error("Error revoking grant:", error);
      toast({
        variant: "destructive",
        title: "Revoke Failed",
        description: getErrorMessage(error, "You may not have the required permissions."),
      });
    } finally {
      setLoadingGrantId(null);
    }
  };


  if (!activeOrganization) return null;

  const internalTeams = (activeOrganization.teams || []).filter(t => t.type === 'internal');
  const partnerTeams = (activeOrganization.teams || []).filter(t => t.type === 'external');

  const renderTeamCard = (team: Team, type: 'internal' | 'external') => {
    const isAuthorized = (workspace.teamIds || []).includes(team.id);
    const isInternal = type === 'internal';

    return (
      <Card key={team.id} className={`border-border/60 transition-all ${isAuthorized ? (isInternal ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/20' : 'border-accent/30 bg-accent/5 ring-1 ring-accent/20') : 'bg-card/40'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${isAuthorized ? (isInternal ? 'bg-primary text-white' : 'bg-accent text-white') : 'bg-muted text-muted-foreground'}`}>
              {isInternal ? <Users className="size-4" /> : <Globe className="size-4" />}
            </div>
            <div>
              <CardTitle className="text-sm font-bold">{team.name}</CardTitle>
              <CardDescription className="text-[9px] font-bold uppercase">{team.memberIds.length} Members</CardDescription>
            </div>
          </div>
          <Button 
            variant={isAuthorized ? "destructive" : "outline"} 
            size="sm" 
            className="h-7 text-[9px] font-bold uppercase tracking-widest"
            onClick={() => handleToggleTeam(team, isAuthorized)}
            disabled={!!loadingTeamId}
          >
            {loadingTeamId === team.id ? "..." : isAuthorized ? "Revoke" : "Authorize"}
          </Button>
        </CardHeader>
        {isAuthorized && (
          <CardContent className="p-4 pt-0">
            <div className={`mt-3 flex items-center gap-2 rounded-lg border bg-background/50 p-2 ${isInternal ? 'border-primary/10' : 'border-accent/10'}`}>
              {isInternal ? <CheckCircle2 className="size-3 text-primary" /> : <ShieldAlert className="size-3 text-accent" />}
              <span className={`text-[9px] font-bold uppercase tracking-widest ${isInternal ? 'text-primary' : 'text-accent'}`}>
                {isInternal ? 'Access Resonating' : 'External Controlled Access'}
              </span>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-8 pb-20 duration-500 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" /> Workspace Access Governance
          </h3>
          <p className="text-[10px] font-bold uppercase text-muted-foreground">Strategy: Granular Grant-Based Authorization</p>
        </div>
      </div>

      <Tabs defaultValue="internal-teams" className="space-y-6">
        <TabsList className="rounded-xl border border-border/50 bg-muted/40 p-1">
          <TabsTrigger value="internal-teams" className="px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:text-primary">
            Internal Teams ({internalTeams.length})
          </TabsTrigger>
          <TabsTrigger value="partner-teams" className="px-6 text-[10px] font-bold uppercase tracking-widest data-[state=active]:text-accent">
            Partner Teams ({partnerTeams.length})
          </TabsTrigger>
          <TabsTrigger value="individuals" className="px-6 text-[10px] font-bold uppercase tracking-widest">
            Individuals ({(activeOrganization.members || []).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal-teams" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {internalTeams.map(team => renderTeamCard(team, 'internal'))}
        </TabsContent>

        <TabsContent value="partner-teams" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {partnerTeams.map(team => renderTeamCard(team, 'external'))}
        </TabsContent>

        <TabsContent value="individuals" className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(activeOrganization.members || []).map(member => {
            const directGrant = (workspace.grants || []).find(g => g.userId === member.id && g.status === 'active');
            const hasInheritedAccess = (activeOrganization.teams || [])
              .some(t => (workspace.teamIds || []).includes(t.id) && t.memberIds.includes(member.id));
            
            const cardClass = cn('border-border/60', {
              'bg-muted/20 opacity-60': hasInheritedAccess && !directGrant,
              'bg-primary/5 border-primary/30': directGrant,
              'bg-card/40': !hasInheritedAccess && !directGrant,
            });

            return (
              <Card key={member.id} className={cardClass}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full border bg-muted text-[10px] font-bold shadow-sm">
                      {member.name[0]}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="h-3.5 px-1 text-[7px] uppercase tracking-tighter">
                          {member.role}
                        </Badge>
                        {hasInheritedAccess && !directGrant && (
                          <Badge variant="secondary" className="h-3.5 border-none bg-primary/10 px-1 text-[7px] font-black uppercase text-primary">
                            Inherited
                          </Badge>
                        )}
                        {directGrant && (
                           <Badge variant="secondary" className="h-3.5 border-none bg-green-500/10 px-1 text-[7px] font-black uppercase text-green-600">
                            {directGrant.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {!hasInheritedAccess && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="size-8" disabled={!!loadingGrantId}>
                           <MoreVertical className="size-4" />
                         </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {directGrant ? (
                          <DropdownMenuItem onClick={() => handleRevokeGrant(directGrant.grantId)} className="cursor-pointer text-destructive" disabled={loadingGrantId === directGrant.grantId}>
                             <Trash2 className="mr-2 size-4" /> {loadingGrantId === directGrant.grantId ? 'Revoking...' : 'Revoke Access'}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setGrantTarget(member)} className="cursor-pointer">
                             <Plus className="mr-2 size-4" /> Grant Access
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </CardHeader>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      <div className="space-y-4 rounded-3xl border border-dashed bg-muted/30 p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="size-4" />
          <h4 className="text-xs font-bold uppercase tracking-widest">Access Governance Principles</h4>
        </div>
        <p className="text-[11px] italic leading-relaxed text-muted-foreground">
          This workspace uses &quot;Composite Authorization&quot;. A member&apos;s final access = (Team Inheritance ∪ Direct Individual Grant).
          When access is granted via multiple paths, the &quot;Least Restrictive&quot; principle is applied to ensure uninterrupted operational momentum.
        </p>
      </div>

      <Dialog open={!!grantTarget} onOpenChange={(open) => !open && setGrantTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Individual Access</DialogTitle>
            <CardDescription>Grant direct access for &quot;{grantTarget?.name}&quot; to this workspace.</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label>Workspace Role</Label>
            <Select value={selectedRole} onValueChange={(v: WorkspaceRole) => setSelectedRole(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Contributor">Contributor</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGrantTarget(null)} disabled={loadingGrantId === 'new'}>Cancel</Button>
            <Button onClick={handleConfirmGrant} disabled={loadingGrantId === 'new'}>
              {loadingGrantId === 'new' ? 'Granting...' : 'Confirm Grant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
