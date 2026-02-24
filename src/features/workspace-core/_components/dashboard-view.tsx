// [職責] Wave 4 — Dashboard overview view (client island)
// Extracted from app/dashboard/page.tsx to follow the features/ view pattern.
"use client"

import { useEffect, useMemo, useState } from "react"
import { User as UserIcon } from "lucide-react"
import { Badge } from "@/shared/shadcn-ui/badge"
import { useAuth } from "@/shared/app-providers/auth-provider"
import { useI18n } from "@/shared/app-providers/i18n-provider"
import { useApp } from "@/features/workspace-core"
import { useVisibleWorkspaces } from "../_hooks/use-visible-workspaces"
import { StatCards } from "./stat-cards"
import { AccountGrid } from "@/features/account-organization.core"
import { PermissionTree } from "@/features/account-governance.role"
import { WorkspaceList } from "./workspace-list"
import { PageHeader } from "@/shared/ui/page-header"


/**
 * DashboardView — The "smart" dashboard overview container.
 * Manages all account/workspace state and delegates rendering to _components/.
 * app/dashboard/page.tsx is now a thin RSC wrapper that renders this.
 */
export function DashboardView() {
  const [mounted, setMounted] = useState(false)
  const { t } = useI18n()

  const { state: appState } = useApp()
  const { state: authState } = useAuth()

  const { accounts, activeAccount } = appState
  const { user } = authState

  const organizationsArray = useMemo(
    () => Object.values(accounts).filter((a) => a.accountType === "organization"),
    [accounts]
  )
  const dimensionWorkspaces = useVisibleWorkspaces()

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeOrganization = useMemo(
    () => (activeAccount?.accountType === "organization" ? accounts[activeAccount.id] : null),
    [accounts, activeAccount]
  )

  const currentUserRoleInOrganization = useMemo(() => {
    if (!activeOrganization || !user) return "Guest"
    if (activeOrganization.ownerId === user.id) return "Owner"
    const member = activeOrganization.members?.find((m) => m.id === user.id)
    return member?.role || "Guest"
  }, [activeOrganization, user])

  if (!mounted || !activeAccount) return null

  const isOrganizationContext = activeAccount.accountType === "organization" && activeOrganization

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20 duration-700 animate-in fade-in">
      <PageHeader
        title={activeAccount.name}
        description={
          isOrganizationContext
            ? t("settings.dimensionManagementDescription")
            : t("settings.personalDimensionDescription")
        }
      >
        {isOrganizationContext && (
          <div className="flex items-center gap-6 rounded-2xl border border-border/50 bg-muted/40 p-4 shadow-sm backdrop-blur-sm">
            <div className="border-r border-border/50 px-4 text-center">
              <p className="font-headline text-2xl font-bold">{dimensionWorkspaces.length}</p>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Workspace Nodes</p>
            </div>
            <div className="px-4 text-center">
              <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Your Role</p>
              <Badge className="border-primary/20 bg-primary/10 font-headline text-primary">
                {currentUserRoleInOrganization}
              </Badge>
            </div>
          </div>
        )}
      </PageHeader>

      {!isOrganizationContext && (
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-accent/20 bg-accent/5 p-8 text-center">
          <UserIcon className="mb-4 size-16 text-accent/50" />
          <h3 className="font-headline text-xl font-bold">Personal Dimension</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Manage your private projects and logical spaces. To collaborate with others, switch to or
            create an organization dimension using the switcher in the sidebar.
          </p>
        </div>
      )}

      {isOrganizationContext && (
        <>
          <StatCards />
          <AccountGrid accounts={organizationsArray.filter((o) => o.id !== activeOrganization.id).slice(0, 3)} />
        </>
      )}

      <div className={`grid grid-cols-1 ${isOrganizationContext ? "lg:grid-cols-2" : ""} gap-8`}>
        <WorkspaceList workspaces={dimensionWorkspaces} />
        {isOrganizationContext && <PermissionTree currentRole={currentUserRoleInOrganization} t={t} />}
      </div>
    </div>
  )
}
