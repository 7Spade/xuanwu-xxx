"use client";

import { useWorkspace } from "../../../../../../context/workspace-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/shadcn-ui/card";
import { Button } from "@/shared/shadcn-ui/button";
import { Badge } from "@/shared/shadcn-ui/badge";
import { 
  Users, 
  Trash2, 
  ShieldCheck, 
  Globe, 
  User, 
  Plus, 
  CheckCircle2,
  ShieldAlert,
  MoreVertical
} from "lucide-react";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn-ui/tabs";
import { toast } from "@/shared/hooks/use-toast";
import { Team, WorkspaceGrant, WorkspaceRole, MemberReference } from "@/types/domain";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/shadcn-ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/shadcn-ui/select";
import { Label } from "@/shared/shadcn-ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/shadcn-ui/dropdown-menu";
import { cn } from "@/shared/utils/utils";
import { useApp } from "@/hooks/state/use-app";


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
  const activeOrgId = activeAccount?.accountType === 'organization' ? activeAccount.id : null;

  const [grantTarget, setGrantTarget] = useState<MemberReference | null>(null);
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>('Contributor');

  const activeOrg = useMemo(() => 
    activeOrgId ? accounts[activeOrgId] : null,
    [accounts, activeOrgId]
  );

  const handleToggleTeam = async (team: Team, isAuthorized: boolean) => {
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
    }
  };

  const handleConfirmGrant = async () => {
    if (!grantTarget) return;

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
    }
  };

  const handleRevokeGrant = async (grantId: string) => {
    try {
      const grant = (workspace.grants || []).find(g => g.grantId === grantId);
      const member = activeOrg?.members.find(m => m.id === grant?.userId);
      
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
    }
  };


  if (!activeOrg) return null;

  const internalTeams = (activeOrg.teams || []).filter(t => t.type === 'internal');
  const partnerTeams = (activeOrg.teams || []).filter(t => t.type === 'external');

  const renderTeamCard = (team: Team, type: 'internal' | 'external') => {
    const isAuthorized = (workspace.teamIds || []).includes(team.id);
    const isInternal = type === 'internal';

    return (
      <Card key={team.id} className={`border-border/60 transition-all ${isAuthorized ? (isInternal ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' : 'bg-accent/5 border-accent/30 ring-1 ring-accent/20') : 'bg-card/40'}`}>
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isAuthorized ? (isInternal ? 'bg-primary text-white' : 'bg-accent text-white') : 'bg-muted text-muted-foreground'}`}>
              {isInternal ? <Users className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            </div>
            <div>
              <CardTitle className="text-sm font-bold">{team.name}</CardTitle>
              <CardDescription className="text-[9px] uppercase font-bold">{team.memberIds.length} Members</CardDescription>
            </div>
          </div>
          <Button 
            variant={isAuthorized ? "destructive" : "outline"} 
            size="sm" 
            className="h-7 text-[9px] font-bold uppercase tracking-widest"
            onClick={() => handleToggleTeam(team, isAuthorized)}
          >
            {isAuthorized ? "Revoke" : "Authorize"}
          </Button>
        </CardHeader>
        {isAuthorized && (
          <CardContent className="p-4 pt-0">
            <div className={`mt-3 p-2 bg-background/50 rounded-lg border flex items-center gap-2 ${isInternal ? 'border-primary/10' : 'border-accent/10'}`}>
              {isInternal ? <CheckCircle2 className="w-3 h-3 text-primary" /> : <ShieldAlert className="w-3 h-3 text-accent" />}
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Workspace Access Governance
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Strategy: Granular Grant-Based Authorization</p>
        </div>
      </div>

      <Tabs defaultValue="internal-teams" className="space-y-6">
        <TabsList className="bg-muted/40 p-1 border border-border/50 rounded-xl">
          <TabsTrigger value="internal-teams" className="text-[10px] font-bold uppercase tracking-widest px-6 data-[state=active]:text-primary">
            Internal Teams ({internalTeams.length})
          </TabsTrigger>
          <TabsTrigger value="partner-teams" className="text-[10px] font-bold uppercase tracking-widest px-6 data-[state=active]:text-accent">
            Partner Teams ({partnerTeams.length})
          </TabsTrigger>
          <TabsTrigger value="individuals" className="text-[10px] font-bold uppercase tracking-widest px-6">
            Individuals ({(activeOrg.members || []).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal-teams" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {internalTeams.map(team => renderTeamCard(team, 'internal'))}
        </TabsContent>

        <TabsContent value="partner-teams" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partnerTeams.map(team => renderTeamCard(team, 'external'))}
        </TabsContent>

        <TabsContent value="individuals" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeOrg.members || []).map(member => {
            const directGrant = (workspace.grants || []).find(g => g.userId === member.id && g.status === 'active');
            const hasInheritedAccess = (activeOrg.teams || [])
              .some(t => (workspace.teamIds || []).includes(t.id) && t.memberIds.includes(member.id));
            
            const cardClass = cn('border-border/60', {
              'bg-muted/20 opacity-60': hasInheritedAccess && !directGrant,
              'bg-primary/5 border-primary/30': directGrant,
              'bg-card/40': !hasInheritedAccess && !directGrant,
            });

            return (
              <Card key={member.id} className={cardClass}>
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold border shadow-sm">
                      {member.name[0]}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">{member.name}</CardTitle>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[7px] h-3.5 px-1 uppercase tracking-tighter">
                          {member.role}
                        </Badge>
                        {hasInheritedAccess && !directGrant && (
                          <Badge variant="secondary" className="text-[7px] h-3.5 px-1 bg-primary/10 text-primary border-none font-black uppercase">
                            Inherited
                          </Badge>
                        )}
                        {directGrant && (
                           <Badge variant="secondary" className="text-[7px] h-3.5 px-1 bg-green-500/10 text-green-600 border-none font-black uppercase">
                            {directGrant.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {!hasInheritedAccess && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8">
                           <MoreVertical className="w-4 h-4" />
                         </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {directGrant ? (
                          <DropdownMenuItem onClick={() => handleRevokeGrant(directGrant.grantId)} className="text-destructive cursor-pointer">
                             <Trash2 className="mr-2 h-4 w-4" /> Revoke Access
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setGrantTarget(member)} className="cursor-pointer">
                             <Plus className="mr-2 h-4 w-4" /> Grant Access
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

      <div className="p-6 bg-muted/30 border border-dashed rounded-3xl space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-widest">Access Governance Principles</h4>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed italic">
          This workspace uses "Composite Authorization". A member's final access = (Team Inheritance ∪ Direct Individual Grant).
          When access is granted via multiple paths, the "Least Restrictive" principle is applied to ensure uninterrupted operational momentum.
        </p>
      </div>

      <Dialog open={!!grantTarget} onOpenChange={(open) => !open && setGrantTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Individual Access</DialogTitle>
            <CardDescription>Grant direct access for "{grantTarget?.name}" to this workspace.</CardDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
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
            <Button variant="ghost" onClick={() => setGrantTarget(null)}>Cancel</Button>
            <Button onClick={handleConfirmGrant}>Confirm Grant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
