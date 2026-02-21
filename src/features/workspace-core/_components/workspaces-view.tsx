// [職責] Workspaces list view — contains all state and rendering logic
"use client";

import { useState, useEffect } from "react";
import { Terminal } from "lucide-react";
import { useVisibleWorkspaces } from "@/features/workspace-core";
import { useApp } from "@/features/workspace-core";
import { useI18n } from "@/shared/app-providers/i18n-provider";
import { useWorkspaceFilters } from "@/features/workspace-business.files";
import { WorkspaceListHeader } from "./workspace-list-header";
import { WorkspaceGridView } from "./workspace-grid-view";
import { WorkspaceTableView } from "./workspace-table-view";
import { Button } from "@/shared/shadcn-ui/button";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";

export function WorkspacesView() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const { t } = useI18n();
  const router = useRouter();

  const {
    state: { activeAccount },
  } = useApp();
  const allVisibleWorkspaces = useVisibleWorkspaces();
  const filteredWorkspaces = useWorkspaceFilters(
    allVisibleWorkspaces,
    searchQuery
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !activeAccount) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 gpu-accelerated">
      <WorkspaceListHeader
        activeAccountName={activeAccount.name}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      {filteredWorkspaces.length > 0 ? (
        viewMode === "grid" ? (
          <WorkspaceGridView workspaces={filteredWorkspaces} />
        ) : (
          <WorkspaceTableView workspaces={filteredWorkspaces} />
        )
      ) : (
        <div className="p-24 text-center border-2 border-dashed rounded-3xl bg-muted/5 border-border/40">
          <Terminal className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
          <h3 className="text-2xl font-bold font-headline mb-2">
            {t("workspaces.spaceVoid")}
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-sm">
            {t("workspaces.noSpacesFound")}
          </p>
          <Button
            size="lg"
            className="rounded-full px-8 shadow-lg font-bold uppercase tracking-widest text-xs"
            onClick={() => router.push(ROUTES.WORKSPACES_NEW)}
          >
            {t("workspaces.createInitialSpace")}
          </Button>
        </div>
      )}
    </div>
  );
}
