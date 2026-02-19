
"use client";

import { useMemo } from "react";
import { useAccount } from "@/hooks/state/use-account";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Progress } from "@/app/_components/ui/progress";
import { ShieldCheck, Activity, Layers, Zap } from "lucide-react";
import { Workspace } from "@/types/domain";

interface StatCardsProps {
    orgId: string;
    orgName: string;
}

export function StatCards({ orgId, orgName }: StatCardsProps) {
  const { state: accountState } = useAccount();
  const { auditLogs, workspaces } = accountState;

  const auditLogsArray = useMemo(() => Object.values(auditLogs), [auditLogs]);
  const workspacesArray = useMemo(() => Object.values(workspaces), [workspaces]);
  
  const orgWorkspaces = useMemo(() => 
    workspacesArray.filter(w => w.dimensionId === orgId),
    [workspacesArray, orgId]
  );
  
  const consistency = useMemo(() => {
    if (orgWorkspaces.length === 0) return 100;
    const protocols = orgWorkspaces.map(w => w.protocol || 'Default');
    const uniqueProtocols = new Set(protocols);
    const val = Math.round((1 / (uniqueProtocols.size || 1)) * 100);
    return isFinite(val) ? val : 100;
  }, [orgWorkspaces]);

  const pulseRate = useMemo(() => {
    const recentPulseCount = auditLogsArray.filter(l => l.accountId === orgId).length;
    const val = (recentPulseCount / 20) * 100;
    return isFinite(val) ? Math.min(val, 100) : 0;
  }, [auditLogsArray, orgId]);

  const capabilityLoad = useMemo(() => {
    const totalCapabilities = orgWorkspaces.reduce((acc, w) => acc + (w.capabilities?.length || 0), 0);
    const val = totalCapabilities * 10;
    return isFinite(val) ? Math.min(val, 100) : 0;
  }, [orgWorkspaces]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 gpu-accelerated">
      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Dimension Consistency</CardTitle>
          <ShieldCheck className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{consistency}% Protocol Alignment</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Dimension {orgName} currently has {orgWorkspaces.length} workspace nodes mounted.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-tighter">
              <span>Environment Resonance</span>
              <span>{consistency}%</span>
            </div>
            <Progress value={consistency} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Activity Pulse</CardTitle>
          <Activity className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{pulseRate > 50 ? 'High-Frequency' : 'Steady-State'}</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Recent changes in technical specs and identity resonance.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-tighter">
              <span>Real-time Activity</span>
              <span>{Math.round(pulseRate)}%</span>
            </div>
            <Progress value={pulseRate} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Capability Load</CardTitle>
          <Layers className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{capabilityLoad}% Resource Utilization</div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Pressure from atomic capability stacks on the underlying architecture.
          </p>
          <div className="mt-4 flex items-center gap-2 text-primary">
            <Zap className="w-4 h-4 fill-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-tight text-primary">AI Optimization Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
