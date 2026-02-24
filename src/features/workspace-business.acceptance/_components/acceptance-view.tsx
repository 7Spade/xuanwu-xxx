"use client";

import { useWorkspace } from '@/features/workspace-core';
import { Button } from "@/shared/shadcn-ui/button";
import { Trophy, CheckCircle2, Search, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "@/shared/utility-hooks/use-toast";
import { Badge } from "@/shared/shadcn-ui/badge";
import type { WorkspaceTask } from "@/shared/types";
import { useState, useEffect } from "react";
import { useAuth } from "@/shared/app-providers/auth-provider";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/**
 * WorkspaceAcceptance - A-Track final delivery threshold.
 * Determines if a task truly qualifies for "Accepted" status.
 * ARCHITECTURE REFACTORED: Now consumes state from context and events.
 */
export function WorkspaceAcceptance() {
  const { workspace, logAuditEvent, eventBus, updateTask } = useWorkspace();
  const { state: { user } } = useAuth();
  
  const [verifiedTasks, setVerifiedTasks] = useState<WorkspaceTask[]>([]);

  // 1. Independent State Hydration: Consumes task data from the parent context on mount.
  useEffect(() => {
    const initialTasks = Object.values(workspace.tasks || {}).filter(
      (task) => task.progressState === "verified"
    );
    setVerifiedTasks(initialTasks);
  }, [workspace.tasks]);


  // 2. Event-Driven Updates: Subscribes to events for real-time changes.
  useEffect(() => {
    // A task enters this queue when QA approves it.
    const unsubApprove = eventBus.subscribe(
      'workspace:quality-assurance:approved',
      (payload) => {
        setVerifiedTasks(prev => {
            if (prev.some(t => t.id === payload.task.id)) return prev;
            return [...prev, payload.task];
        });
      }
    );
    
    // A task leaves this queue when it is failed (sent back to todo).
    const unsubFail = eventBus.subscribe(
      'workspace:acceptance:failed',
      (payload) => {
        setVerifiedTasks(prev => prev.filter(t => t.id !== payload.task.id));
      }
    );
    
    // A task also leaves this queue when it is passed (accepted).
     const unsubPass = eventBus.subscribe(
      'workspace:acceptance:passed',
      (payload) => {
        setVerifiedTasks(prev => prev.filter(t => t.id !== payload.task.id));
      }
    );

    return () => {
      unsubApprove();
      unsubFail();
      unsubPass();
    };
  }, [eventBus]);


  const handleAccept = async (task: WorkspaceTask) => {
    const updates = { progressState: 'accepted' as const };
    
    try {
      await updateTask(task.id, updates);
      eventBus.publish('workspace:acceptance:passed', {
          task: {...task, ...updates},
          acceptedBy: user?.name || "System"
      });
      logAuditEvent("Final Acceptance Passed", `Task: ${task.name}`, 'update');
      toast({ title: "Task Accepted", description: `${task.name} has passed all dimension verifications.` });
    } catch (error: unknown) {
      console.error("Error accepting task:", error);
      toast({
        variant: "destructive",
        title: "Failed to Accept Task",
        description: getErrorMessage(error, "An unknown error occurred."),
      });
    }
  };

  const handleFail = async (task: WorkspaceTask) => {
    const updates = { progressState: 'todo' as const };
    
    try {
      await updateTask(task.id, updates);
      eventBus.publish('workspace:acceptance:failed', {
          task: {...task, ...updates},
          rejectedBy: user?.name || "System"
      });
      logAuditEvent("Acceptance Failed", `Task rolled back: ${task.name}`, 'update');
      toast({ 
        variant: "destructive", 
        title: "Acceptance Failed", 
        description: `${task.name} has been reverted to 'To-Do' and a high-priority issue is being created.` 
      });
    } catch (error: unknown) {
        console.error("Error failing task acceptance:", error);
        toast({
          variant: "destructive",
          title: "Failed to Update Task",
          description: getErrorMessage(error, "An unknown error occurred."),
        });
    }
  };

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Trophy className="size-4 text-amber-500" /> A-Track: User Acceptance Testing (UAT)
          </h3>
        </div>
        <Badge className="border-amber-500/20 bg-amber-500/10 text-[10px] font-bold text-amber-600">{verifiedTasks.length} Pending</Badge>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {verifiedTasks.map(task => (
          <div key={task.id} className="group flex items-center justify-between rounded-2xl border-2 border-amber-500/10 bg-card/40 p-5 transition-all hover:border-amber-500/40">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">{task.name}</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-500/20 bg-green-500/5 px-1 text-[7px] text-green-600">QA PASSED</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleFail(task)}
              >
                <XCircle className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-500"
                onClick={() => handleAccept(task)}
              >
                <CheckCircle2 className="size-5" />
              </Button>
            </div>
          </div>
        ))}
        {verifiedTasks.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed p-12 text-center opacity-20">
            <Search className="mx-auto mb-2 size-8" />
            <p className="text-xs font-bold uppercase tracking-widest">No items pending acceptance</p>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4">
        <AlertTriangle className="mt-0.5 size-4 text-amber-500" />
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase text-amber-600">Acceptance Security Notice</p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Any acceptance failure is treated as a critical spec deviation and will automatically create a high-priority issue on the B-Track for immediate follow-up.
          </p>
        </div>
      </div>
    </div>
  );
}
