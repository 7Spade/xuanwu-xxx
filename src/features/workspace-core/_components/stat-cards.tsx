"use client";

import { useMemo } from "react";
import { useAccount } from "../_hooks/use-account";
import { useApp } from "../_hooks/use-app";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn-ui/card";
import { Progress } from "@/shared/shadcn-ui/progress";
import { ShieldCheck, Activity, Layers, Zap } from "lucide-react";

export function StatCards() {
  const { state: accountState } = useAccount();
  const { state: appState } = useApp();
  const { auditLogs, workspaces } = accountState;
  const { activeAccount } = appState;

  const accountName = activeAccount?.name ?? ""

  const auditLogsArray = useMemo(() => Object.values(auditLogs), [auditLogs]);
  const workspacesArray = useMemo(() => Object.values(workspaces), [workspaces]);
  
  const consistency = useMemo(() => {
    if (workspacesArray.length === 0) return 100;
    const protocols = workspacesArray.map(w => w.protocol || 'Default');
    const uniqueProtocols = new Set(protocols);
    const val = Math.round((1 / (uniqueProtocols.size || 1)) * 100);
    return isFinite(val) ? val : 100;
  }, [workspacesArray]);

  const pulseRate = useMemo(() => {
    const val = (auditLogsArray.length / 20) * 100;
    return isFinite(val) ? Math.min(val, 100) : 0;
  }, [auditLogsArray]);

  const capabilityLoad = useMemo(() => {
    const totalCapabilities = workspacesArray.reduce((acc, w) => acc + (w.capabilities?.length || 0), 0);
    const val = totalCapabilities * 10;
    return isFinite(val) ? Math.min(val, 100) : 0;
  }, [workspacesArray]);

  return (
    <div className="gpu-accelerated grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="border-border/60 shadow-sm transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Dimension Consistency</CardTitle>
          <ShieldCheck className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="font-headline text-2xl font-bold">{consistency}% Protocol Alignment</div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Dimension {accountName} currently has {workspacesArray.length} workspace nodes mounted.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-tighter">
              <span>Environment Resonance</span>
              <span>{consistency}%</span>
            </div>
            <Progress value={consistency} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Activity Pulse</CardTitle>
          <Activity className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="font-headline text-2xl font-bold">{pulseRate > 50 ? 'High-Frequency' : 'Steady-State'}</div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Recent changes in technical specs and identity resonance.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-tighter">
              <span>Real-time Activity</span>
              <span>{Math.round(pulseRate)}%</span>
            </div>
            <Progress value={pulseRate} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm transition-all duration-300 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Capability Load</CardTitle>
          <Layers className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="font-headline text-2xl font-bold">{capabilityLoad}% Resource Utilization</div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Pressure from atomic capability stacks on the underlying architecture.
          </p>
          <div className="mt-4 flex items-center gap-2 text-primary">
            <Zap className="size-4 animate-pulse fill-primary" />
            <span className="text-[10px] font-bold uppercase tracking-tight text-primary">AI Optimization Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
