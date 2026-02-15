// [職責] 標題、搜尋框與視圖切換 (Grid/List)
"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { useI18n } from "@/context/i18n-context";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight font-headline">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {children}
        </div>
      </div>
    );
}

interface WorkspaceListHeaderProps {
  activeAccountName: string;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export function WorkspaceListHeader({
  activeAccountName,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchQueryChange,
}: WorkspaceListHeaderProps) {
  const { t } = useI18n();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <PageHeader
        title={t("workspaces.title")}
        description={t("workspaces.description").replace(
          "{name}",
          activeAccountName
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg bg-background p-1 shadow-sm border-border/60">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onViewModeChange("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onViewModeChange("list")}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
          <Button className="gap-2 shadow-sm font-bold uppercase tracking-widest text-[11px] h-10 px-4" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4" /> {t("workspaces.createSpace")}
          </Button>
        </div>
      </PageHeader>
      <div className="flex items-center gap-4 bg-card/50 p-3 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("workspaces.searchPlaceholder")}
            className="pl-10 h-10 bg-background border-border/40 focus-visible:ring-primary/30 rounded-xl"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-4 gap-2 text-xs font-bold uppercase tracking-widest border-border/60 rounded-xl"
        >
          <Filter className="w-3.5 h-3.5" /> {t("common.filter")}
        </Button>
      </div>
      <CreateWorkspaceDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}
