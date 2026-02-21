
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/shadcn-ui/button";
import { Badge } from "@/shared/shadcn-ui/badge";
import { Eye, EyeOff, Shield, Trash2, ArrowUpRight, Terminal } from "lucide-react";
import { Workspace } from "@/shared/types";

interface WorkspaceListItemProps {
  workspace: Workspace;
  onDelete?: (id: string) => void;
}

function WorkspaceListItem({ workspace, onDelete }: WorkspaceListItemProps) {
  const router = useRouter();
  const isVisible = workspace.visibility === "visible";
  const visibilityLabel = isVisible ? "Visible" : "Hidden";
  const protocolLabel = workspace.protocol || "Default Protocol";

  return (
    <div 
      className="flex items-center justify-between p-4 bg-card border border-border/60 rounded-xl hover:bg-muted/30 transition-colors group cursor-pointer"
      onClick={() => router.push(`/workspaces/${workspace.id}`)}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/5 rounded-lg text-primary">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{workspace.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter px-1.5 h-4 flex items-center gap-1">
              {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {visibilityLabel}
            </Badge>
            <span className="text-[10px] text-muted-foreground">ID: {workspace.id.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Access Protocol</p>
          <p className="text-[11px] font-medium">{protocolLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <ArrowUpRight className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete?.(workspace.id); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


export function WorkspaceList({ workspaces }: { workspaces: Workspace[] }) {
  const router = useRouter();
  const recentOnes = useMemo(() => workspaces.slice(0, 4), [workspaces]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-headline tracking-tight">Recent Workspaces</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/dashboard/workspaces')}
          className="text-xs text-primary font-bold uppercase tracking-widest hover:bg-primary/5"
        >
          View All <ArrowUpRight className="ml-1 w-3 h-3" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {recentOnes.length > 0 ? recentOnes.map(w => (
          <WorkspaceListItem key={w.id} workspace={w} />
        )) : (
          <div className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-muted/5 border-border/40">
            <Terminal className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground">No workspace nodes have been created yet.</p>
            <Button 
              variant="link"
              onClick={() => router.push('/dashboard/workspaces')}
              className="mt-2 text-xs font-bold text-primary uppercase tracking-widest"
            >
              + Create First Node
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
