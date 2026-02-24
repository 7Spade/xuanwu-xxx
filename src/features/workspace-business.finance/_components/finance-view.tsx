
"use client";

import { useWorkspace } from '@/features/workspace-core';
import { Button } from "@/shared/shadcn-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn-ui/card";
import { Badge } from "@/shared/shadcn-ui/badge";
import { Wallet, Landmark, TrendingUp, CheckCircle2, AlertCircle, ArrowUpRight, FileSearch } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { type WorkspaceTask } from "@/shared/types";
import { toast } from "@/shared/utility-hooks/use-toast";

type ParsedFinanceItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  sourceDocument: string;
  intentId: string;
};

/**
 * WorkspaceFinance - Handles fund disbursement and budget tracking after acceptance.
 * Wired connections:
 * - workspace:acceptance:passed → accepted tasks queue
 * - workspace:document-parser:itemsExtracted → financial directives from parsing (PARSING_INTENT → TRACK_A_FINANCE)
 * - workspace:finance:disburseFailed → published to B-track on failure (TRACK_A_FINANCE → TRACK_B_ISSUES)
 */
export function WorkspaceFinance() {
  const { workspace, logAuditEvent, eventBus } = useWorkspace();
  
  const [acceptedTasks, setAcceptedTasks] = useState<WorkspaceTask[]>([]);
  // Financial directives received directly from the document parser (PARSING_INTENT → TRACK_A_FINANCE)
  const [parsedDirectives, setParsedDirectives] = useState<ParsedFinanceItem[]>([]);
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
    const unsubAcceptance = eventBus.subscribe(
      'workspace:acceptance:passed',
      (payload) => {
        setAcceptedTasks(prev => {
          if (prev.some(t => t.id === payload.task.id)) return prev;
          return [...prev, payload.task];
        });
      }
    );

    // PARSING_INTENT -->|財務指令| TRACK_A_FINANCE
    // Receive financial line items directly from the parser for pre-acceptance visibility.
    const unsubParser = eventBus.subscribe(
      'workspace:document-parser:itemsExtracted',
      (payload) => {
        const financialItems = payload.items.filter(item => (item.subtotal ?? 0) > 0);
        if (financialItems.length === 0) return;
        setParsedDirectives(prev => [
          ...prev,
          ...financialItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            sourceDocument: payload.sourceDocument,
            intentId: payload.intentId,
          })),
        ]);
      }
    );

    return () => {
      unsubAcceptance();
      unsubParser();
    };
  }, [eventBus]);


  const totalSpent = useMemo(() => 
    acceptedTasks.reduce((acc, t) => acc + (Number(t.subtotal) || 0), 0),
    [acceptedTasks]
  );

  const handleDisburse = async (task: WorkspaceTask) => {
    try {
      await logAuditEvent("Initiated Fund Disbursement", `Task: ${task.name}`, 'update');
      setAcceptedTasks(prev => prev.filter(t => t.id !== task.id));
      toast({ title: "Disbursement Initiated", description: `Fund transfer for "${task.name}" has been queued.` });
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : "Unknown disbursement error";
      // TRACK_A_FINANCE -->|異常| TRACK_B_ISSUES — publish failure event for event handler to create B-track issue
      eventBus.publish('workspace:finance:disburseFailed', {
        taskId: task.id,
        taskTitle: task.name,
        amount: Number(task.subtotal) || 0,
        reason,
      });
      toast({ variant: "destructive", title: "Disbursement Failed", description: reason });
    }
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

      {parsedDirectives.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <FileSearch className="size-4 text-amber-500" /> Financial Directives from Parser ({parsedDirectives.length})
          </h3>
          <div className="space-y-2">
            {parsedDirectives.map((item, index) => (
              <div key={`${item.intentId}-${index}`} className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
                    <FileSearch className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{item.name}</h4>
                    <p className="text-[9px] text-muted-foreground">From: {item.sourceDocument} · qty {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="border-amber-500/30 text-[8px] text-amber-600">PENDING A-TRACK</Badge>
                  <p className="mt-1 text-xs font-bold text-amber-700">${item.subtotal.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  onClick={() => handleDisburse(task)}
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
