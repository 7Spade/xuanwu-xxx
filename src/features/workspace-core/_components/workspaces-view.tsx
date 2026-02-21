// [職責] Workspaces list view — contains all state and rendering logic
"use client";

import { useState, useEffect } from "react";
import { Terminal } from "lucide-react";
import { useVisibleWorkspaces , useApp } from "@/features/workspace-core";
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
    <div className="gpu-accelerated mx-auto max-w-7xl space-y-6 duration-500 animate-in fade-in">
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
        <div className="rounded-3xl border-2 border-dashed border-border/40 bg-muted/5 p-24 text-center">
          <Terminal className="mx-auto mb-6 size-16 text-muted-foreground opacity-10" />
          <h3 className="mb-2 font-headline text-2xl font-bold">
            {t("workspaces.spaceVoid")}
          </h3>
          <p className="mx-auto mb-8 max-w-sm text-sm text-muted-foreground">
            {t("workspaces.noSpacesFound")}
          </p>
          <Button
            size="lg"
            className="rounded-full px-8 text-xs font-bold uppercase tracking-widest shadow-lg"
            onClick={() => router.push(ROUTES.WORKSPACES_NEW)}
          >
            {t("workspaces.createInitialSpace")}
          </Button>
        </div>
      )}
    </div>
  );
}
