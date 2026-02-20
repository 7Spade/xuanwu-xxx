
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { ShieldCheck, ShieldAlert, Users, AlertCircle } from "lucide-react";
import { useState, useEffect, useMemo, ReactNode } from "react";
import { useApp } from "@/hooks/state/use-app";
import { useAccount } from "@/hooks/state/use-account";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  badge?: ReactNode;
}

function PageHeader({ title, description, children, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="space-y-1">
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className="text-4xl font-bold tracking-tight font-headline">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}

// DEPRECATED FOR WRITE: This permission matrix, which manages access by mapping `teamId` to `workspace.teamIds`, is now a read-only visualization. The `WorkspaceMembersManagement` component handles both team and individual grants. This component now serves to provide a high-level, read-only view of composite access state (Team Inheritance).

export default function PermissionMatrixPage() {
  const { state: appState } = useApp();
  const { state: accountState } = useAccount();
  const { accounts, activeAccount } = appState;
  const { workspaces } = accountState;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  const workspacesArray = useMemo(() => Object.values(workspaces), [workspaces]);

  const activeOrg = useMemo(() => 
    activeAccount?.accountType === 'organization' ? accounts[activeAccount.id] : null,
    [accounts, activeAccount]
  );
  
  if (!mounted) return null;

  if (!activeOrg) {
    return (
        <div className="p-8 text-center flex flex-col items-center gap-4">
            <AlertCircle className="w-10 h-10 text-muted-foreground" />
            <h3 className="font-bold">Governance Center Not Available</h3>
            <p className="text-sm text-muted-foreground">
                Permission matrix is only available within an organization dimension.
            </p>
        </div>
      )
  }

  const teams = (activeOrg.teams || []).filter(t => t.type === 'internal');
  const orgWorkspaces = workspacesArray.filter(w => w.dimensionId === activeAccount?.id);

  const hasAccess = (teamId: string, workspaceId: string) => {
    const ws = workspaces[workspaceId];
    return ws?.teamIds?.includes(teamId) || false;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="Permission Resonance Matrix" 
        description="Visualize mappings between internal teams and logical workspaces. Access management is handled within each workspace's governance panel."
      />

      <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[220px] text-[10px] font-bold uppercase tracking-widest py-6 px-6">Team / Workspace Node</TableHead>
              {orgWorkspaces.map(ws => (
                <TableHead key={ws.id} className="text-center min-w-[120px]">
                  <span className="text-[10px] font-bold uppercase tracking-tight text-primary">{ws.name}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map(team => (
              <TableRow key={team.id} className="hover:bg-muted/5 transition-colors group">
                <TableCell className="font-bold py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-headline">{team.name}</span>
                      <span className="text-[9px] text-muted-foreground">{(team.memberIds || []).length} Members</span>
                    </div>
                  </div>
                </TableCell>
                {orgWorkspaces.map(ws => {
                  const access = hasAccess(team.id, ws.id);
                  return (
                    <TableCell 
                      key={ws.id} 
                      className="text-center p-0"
                    >
                      <div className="flex items-center justify-center h-full min-h-[80px]">
                        {access ? (
                          <ShieldCheck className="w-5 h-5 text-green-500" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-muted-foreground opacity-10" />
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
