/**
 * Dashboard Page Component
 * 
 * Responsibility: Main dashboard page that composes various overview components.
 * It acts as a "smart" component, fetching necessary data from hooks and passing
 * it down to "dumb" presentational components.
 */

"use client";

// ============================================================================
// External Dependencies
// ============================================================================
import { useEffect, useMemo, useState, ReactNode } from "react";
import { User as UserIcon } from "lucide-react";
import { Badge } from "@/app/_components/ui/badge";

// ============================================================================
// Internal Dependencies - Contexts & Hooks
// ============================================================================
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/context/i18n-context";
import { useApp } from "@/hooks/state/use-app";
import { useVisibleWorkspaces } from "@/hooks/state/use-visible-workspaces";

// ============================================================================
// Internal Dependencies - Overview Components
// ============================================================================
import { StatCards } from "./_components/overview/stat-cards";
import { OrgGrid } from "./_components/overview/org-grid";
import { WorkspaceList } from "./_components/overview/workspace-list";
import { PermissionTree } from "./_components/overview/permission-tree";

// ============================================================================
// Internal Components
// ============================================================================

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


// ============================================================================
// Main Page Component
// ============================================================================
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { t } = useI18n();

  const { state: appState } = useApp();
  const { state: authState } = useAuth();

  const { organizations, activeAccount } = appState;
  const { user } = authState;

  const organizationsArray = useMemo(() => Object.values(organizations), [organizations]);
  const dimensionWorkspaces = useVisibleWorkspaces();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeOrg = useMemo(() => 
    activeAccount?.type === 'organization' ? organizations[activeAccount.id] : null,
    [organizations, activeAccount]
  );
  
  const currentUserRoleInOrg = useMemo(() => {
    if (!activeOrg || !user) return 'Guest';
    if (activeOrg.ownerId === user.id) return 'Owner';
    const member = activeOrg.members?.find(m => m.id === user.id);
    return member?.role || 'Guest';
  }, [activeOrg, user]);

  if (!mounted || !activeAccount) return null;

  const isOrgContext = activeAccount.type === 'organization' && activeOrg;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700 pb-20">
      <PageHeader 
        title={activeAccount.name}
        description={isOrgContext ? t('settings.dimensionManagementDescription') : t('settings.personalDimensionDescription')}
      >
        {isOrgContext && (
          <div className="flex items-center gap-6 bg-muted/40 p-4 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm">
            <div className="text-center px-4 border-r border-border/50">
              <p className="text-2xl font-bold font-headline">{dimensionWorkspaces.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Workspace Nodes</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Your Role</p>
              <Badge className="font-headline bg-primary/10 text-primary border-primary/20">{currentUserRoleInOrg}</Badge>
            </div>
          </div>
        )}
      </PageHeader>

      {!isOrgContext && (
         <div className="p-8 bg-accent/5 rounded-3xl border-2 border-dashed border-accent/20 flex flex-col items-center text-center">
            <UserIcon className="w-16 h-16 text-accent/50 mb-4" />
            <h3 className="text-xl font-bold font-headline">Personal Dimension</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-2 text-sm">
              Manage your private projects and logical spaces. To collaborate with others, switch to or create an organization dimension using the switcher in the sidebar.
            </p>
        </div>
      )}

      {isOrgContext && (
        <>
          <StatCards orgId={activeOrg.id} orgName={activeOrg.name} />
          <OrgGrid organizations={organizationsArray.filter(o => o.id !== activeOrg.id).slice(0, 3)} />
        </>
      )}

      <div className={`grid grid-cols-1 ${isOrgContext ? 'lg:grid-cols-2' : ''} gap-8`}>
        <WorkspaceList workspaces={dimensionWorkspaces} />
        {isOrgContext && <PermissionTree currentRole={currentUserRoleInOrg} t={t} />}
      </div>
    </div>
  );
}
