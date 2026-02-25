"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/shadcn-ui/table"
import { ShieldCheck, ShieldAlert, Users, AlertCircle } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useApp } from "@/shared/app-providers/app-context"
import { useAccount } from "@/features/workspace-core"

// DEPRECATED FOR WRITE: This permission matrix visualises mappings between internal teams and
// workspaces. The WorkspaceMembersManagement component handles writes. This is read-only.
//
// ARCHITECTURAL NOTE (cross-BC read):
// This view intentionally reads `workspaces` from WorkspaceContainer (useAccount) because its
// sole purpose is to display the CROSS-BC permission mapping between Subject Center teams and
// Workspace Container workspaces. This is an accepted read-only view-layer cross-BC dependency.
// Long-term: this component should migrate to workspace-governance.role (WorkspaceContainer)
// where the workspace data dependency is natural.
export function PermissionMatrixView() {
  const { state: appState } = useApp()
  const { state: accountState } = useAccount()
  const { accounts, activeAccount } = appState
  const { workspaces } = accountState

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const workspacesArray = useMemo(() => Object.values(workspaces), [workspaces])

  const activeOrganization = useMemo(() =>
    activeAccount?.accountType === "organization" ? accounts[activeAccount.id] : null,
    [accounts, activeAccount]
  )

  if (!mounted) return null

  if (!activeOrganization) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <AlertCircle className="size-10 text-muted-foreground" />
        <h3 className="font-bold">Governance Center Not Available</h3>
        <p className="text-sm text-muted-foreground">
          Permission matrix is only available within an organization dimension.
        </p>
      </div>
    )
  }

  const teams = (activeOrganization.teams || []).filter((t) => t.type === "internal")
  const organizationWorkspaces = workspacesArray.filter((w) => w.dimensionId === activeAccount?.id)

  const hasAccess = (teamId: string, workspaceId: string) => {
    const workspace = workspaces[workspaceId]
    return workspace?.teamIds?.includes(teamId) || false
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 duration-500 animate-in fade-in">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1 className="font-headline text-4xl font-bold tracking-tight">Permission Resonance Matrix</h1>
          <p className="text-muted-foreground">
            Visualize mappings between internal teams and logical workspaces. Access management is
            handled within each workspace&apos;s governance panel.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/50 shadow-sm backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[220px] p-6 text-[10px] font-bold uppercase tracking-widest">
                Team / Workspace Node
              </TableHead>
              {organizationWorkspaces.map((workspace) => (
                <TableHead key={workspace.id} className="min-w-[120px] text-center">
                  <span className="text-[10px] font-bold uppercase tracking-tight text-primary">{workspace.name}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id} className="group transition-colors hover:bg-muted/5">
                <TableCell className="px-6 py-5 font-bold">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/5 p-2 text-primary">
                      <Users className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline text-sm">{team.name}</span>
                      <span className="text-[9px] text-muted-foreground">
                        {(team.memberIds || []).length} Members
                      </span>
                    </div>
                  </div>
                </TableCell>
                {organizationWorkspaces.map((workspace) => {
                  const access = hasAccess(team.id, workspace.id)
                  return (
                    <TableCell key={workspace.id} className="p-0 text-center">
                      <div className="flex h-full min-h-[80px] items-center justify-center">
                        {access ? (
                          <ShieldCheck className="size-5 text-green-500" />
                        ) : (
                          <ShieldAlert className="size-5 text-muted-foreground opacity-10" />
                        )}
                      </div>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
