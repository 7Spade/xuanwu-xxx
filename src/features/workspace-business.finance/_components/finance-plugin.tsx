
"use client";

import { useWorkspace } from '@/features/workspace-core';
import { Button } from "@/shared/shadcn-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn-ui/card";
import { Wallet, Landmark, TrendingUp, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { type WorkspaceTask } from "@/shared/types";

/**
 * WorkspaceFinance - Handles fund disbursement and budget tracking after acceptance.
 * ARCHITECTURE REFACTORED: Now consumes state from context and events.
 */
export function WorkspaceFinance() {
  const { workspace, logAuditEvent, eventBus } = useWorkspace();
  
  const [acceptedTasks, setAcceptedTasks] = useState<WorkspaceTask[]>([]);
  const totalAcceptedTasks = acceptedTasks.length;

  // 1. Independent State Hydration: Consumes task data from the parent context on mount.
  useEffect(() => {
    const initialTasks = Object.values(workspace.tasks || {}).filter(
      (task) => task.progressState === "accepted"
    );
    setAcceptedTasks(initialTasks);
  }, [workspace.tasks]);

  // 2. Event-Driven Updates: Subscribes to events for real-time changes.
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(
      'workspace:acceptance:passed',
      (payload) => {
        setAcceptedTasks(prev => {
          if (prev.some(t => t.id === payload.task.id)) return prev;
          return [...prev, payload.task];
        });
      }
    );
    return () => unsubscribe();
  }, [eventBus]);


  const totalSpent = useMemo(() => 
    acceptedTasks.reduce((acc, t) => acc + (Number(t.subtotal) || 0), 0),
    [acceptedTasks]
  );

  const handleDisburse = (taskId: string, title: string) => {
    logAuditEvent("Initiated Fund Disbursement", `Task: ${title}`, 'update');
    // In a real app, this would trigger a financial transaction and update the task state.
    // For this demo, we'll just remove it from the list.
    setAcceptedTasks(prev => prev.filter(t => t.id !== taskId));
  };

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
              <Wallet className="size-3.5" /> Total Disbursed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-headline text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="mt-1 text-[10px] text-muted-foreground">Based on {totalAcceptedTasks} accepted tasks</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-600">
              <TrendingUp className="size-3.5" /> Financial Resonance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-headline text-2xl font-bold">100%</div>
            <p className="mt-1 text-[10px] text-muted-foreground">Aligned with dimension budget protocol</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <CheckCircle2 className="size-4" /> Items Ready for Settlement ({totalAcceptedTasks})
        </h3>
        
        <div className="space-y-2">
          {acceptedTasks.map(task => (
            <div key={task.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/40 p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/5 p-2 text-primary">
                  <Landmark className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">{task.name}</h4>
                  <p className="text-[9px] text-muted-foreground">Accepted and ready for fund transfer.</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[8px] font-bold uppercase text-muted-foreground">Approved Amount</p>
                  <p className="text-sm font-bold text-primary">${(Number(task.subtotal) || 0).toLocaleString()}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest"
                  onClick={() => handleDisburse(task.id, task.name)}
                >
                  Disburse <ArrowUpRight className="size-3" />
                </Button>
              </div>
            </div>
          ))}
          {totalAcceptedTasks === 0 && (
            <div className="rounded-2xl border-2 border-dashed p-12 text-center opacity-20">
                <AlertCircle className="mx-auto mb-2 size-8" />
                <p className="text-xs font-bold uppercase tracking-widest">No items pending financial settlement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
