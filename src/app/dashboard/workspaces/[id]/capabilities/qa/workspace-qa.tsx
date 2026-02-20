"use client";

import { useWorkspace } from "../../../../../../context/workspace-context";
import { Button } from "@/shared/ui/button";
import { ShieldCheck, XCircle, CheckCircle, Search, AlertTriangle } from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";
import { Badge } from "@/shared/ui/badge";
import { WorkspaceTask } from "@/types/domain";
import { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/auth-context";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/**
 * WorkspaceQA - A-Track quality threshold.
 * Determines if a task is qualified to enter the "Verified" stage.
 * ARCHITECTURE REFACTORED: Now stateful and fully event-driven.
 */
export function WorkspaceQA() {
  const { workspace, logAuditEvent, eventBus, updateTask } = useWorkspace();
  const { state: { user } } = useAuth();
  
  const [qaTasks, setQaTasks] = useState<WorkspaceTask[]>([]);

  // 1. Independent State Hydration: Consumes task data from the parent context on mount.
  useEffect(() => {
    const initialTasks = Object.values(workspace.tasks || {}).filter(
      (task) => task.progressState === "completed"
    );
    setQaTasks(initialTasks);
  }, [workspace.tasks]);


  // 2. Event-Driven Updates: Subscribes to events for real-time changes.
  useEffect(() => {
    // When a task is marked as completed, add it to our QA queue.
    const unsubComplete = eventBus.subscribe(
      'workspace:tasks:completed',
      (payload) => {
        setQaTasks(prev => {
          if (prev.some(t => t.id === payload.task.id)) return prev;
          return [...prev, payload.task];
        });
      }
    );

    // When a task is approved in QA, remove it from our queue.
    const unsubApprove = eventBus.subscribe(
      'workspace:qa:approved',
      (payload) => {
        setQaTasks(prev => prev.filter(t => t.id !== payload.task.id));
      }
    );

    // When a task is rejected in QA, remove it from our queue.
    const unsubReject = eventBus.subscribe(
      'workspace:qa:rejected',
      (payload) => {
        setQaTasks(prev => prev.filter(t => t.id !== payload.task.id));
      }
    );

    // Cleanup subscriptions on component unmount
    return () => {
      unsubComplete();
      unsubApprove();
      unsubReject();
    };
  }, [eventBus]);


  const handleApprove = async (task: WorkspaceTask) => {
    const updates = { progressState: 'verified' as const };
    
    try {
      await updateTask(task.id, updates);
      eventBus.publish('workspace:qa:approved', {
          task: {...task, ...updates},
          approvedBy: user?.name || "System"
      });
      logAuditEvent("A-Track Advancement", `QA Passed: ${task.name}`, 'update');
      toast({ title: "QA Passed", description: `${task.name} has been sent for final acceptance.` });
    } catch (error: unknown) {
      console.error("Error approving QA:", error);
      toast({
        variant: "destructive",
        title: "Failed to Approve QA",
        description: getErrorMessage(error, "An unknown error occurred."),
      });
    }
  };

  const handleReject = async (task: WorkspaceTask) => {
    const updates = { progressState: 'todo' as const };
    
    try {
      await updateTask(task.id, updates);
      // Step 1: Publish an event. Decouples QA from Issue creation.
      eventBus.publish('workspace:qa:rejected', {
          task: {...task, ...updates},
          rejectedBy: user?.name || 'System'
      });

      // Step 2: Log the specific action for the audit trail.
      logAuditEvent("A-Track Rollback", `QA Rejected: ${task.name}`, 'update');
      
      // Step 3: Inform the user.
      toast({ 
        variant: "destructive", 
        title: "Task Rejected", 
        description: `${task.name} has been sent back and an anomaly ticket is being created.` 
      });
    } catch (error: unknown) {
        console.error("Error rejecting QA:", error);
        toast({
          variant: "destructive",
          title: "Failed to Reject QA",
          description: getErrorMessage(error, "An unknown error occurred."),
        });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" /> A-Track: Quality Assurance (QA)
        </h3>
        <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary border-none">{qaTasks.length} Pending Review</Badge>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {qaTasks.map(task => (
          <div key={task.id} className="p-4 bg-card/40 border border-border/60 rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all">
            <div className="space-y-1">
              <h4 className="text-sm font-bold">{task.name}</h4>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Submitter: Dimension Member</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleReject(task)}
              >
                <XCircle className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-green-600/70 hover:bg-green-600/10 hover:text-green-600"
                onClick={() => handleApprove(task)}
              >
                <CheckCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
         {qaTasks.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl opacity-20">
            <Search className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">No items pending QA</p>
          </div>
        )}
      </div>

       <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-blue-600 uppercase">QA Standards</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            All tasks entering the QA phase must pass automated testing and manual review to ensure they meet the defined technical specifications and acceptance criteria.
          </p>
        </div>
      </div>
    </div>
  );
}
