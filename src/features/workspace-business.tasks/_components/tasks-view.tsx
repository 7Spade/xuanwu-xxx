
'use client';

import { useWorkspace } from '@/features/workspace-core';
import { Button } from '@/shared/shadcn-ui/button';
import { Input } from '@/shared/shadcn-ui/input';
import { Textarea } from '@/shared/shadcn-ui/textarea';
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Settings2,
  Trash2,
  Coins,
  Clock,
  View,
  BarChart3,
  CalendarPlus,
  ClipboardPlus,
  OctagonX,
  Send,
  UploadCloud,
  X,
  Loader2,
  Paperclip,
  MapPin,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from '@/shared/utility-hooks/use-toast';
import { Badge } from '@/shared/shadcn-ui/badge';
import { type WorkspaceTask, type Location , type TaskWithChildren } from '@/shared/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/shadcn-ui/dialog';
import { Label } from '@/shared/shadcn-ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/shadcn-ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/shadcn-ui/dropdown-menu';
import { Progress } from '@/shared/shadcn-ui/progress';
import { cn } from '@/shared/lib';
import { buildTaskTree } from '@/shared/lib';
import { useStorage } from '@/features/workspace-business.files';
import Image from "next/image";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

function ProgressReportDialog({
  task,
  isOpen,
  onClose,
  onSubmit,
}: {
  task: TaskWithChildren | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, newCompletedQuantity: number) => Promise<void>;
}) {
  const [submissionQuantity, setSubmissionQuantity] = useState<number | string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubmissionQuantity('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!task) return null;

  const currentCompleted = task.completedQuantity || 0;
  const totalQuantity = task.quantity || 1;

  const handleSubmit = async () => {
    const submitted = Number(submissionQuantity);
    if (isNaN(submitted) || submitted <= 0) {
      toast({ variant: 'destructive', title: 'Invalid quantity' });
      return;
    }

    const newTotal = currentCompleted + submitted;
    if (newTotal > totalQuantity) {
      toast({ variant: 'destructive', title: 'Quantity exceeds total' });
      return;
    }

    setIsSubmitting(true);
    await onSubmit(task.id, newTotal);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Progress</DialogTitle>
          <DialogDescription>
            Submit completed quantity for &quot;{task.name}&quot;. Current: {currentCompleted} / {totalQuantity}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Label htmlFor="submission-quantity">Quantity for this submission</Label>
          <Input
            id="submission-quantity"
            type="number"
            value={submissionQuantity}
            onChange={(e) => setSubmissionQuantity(e.target.value)}
            placeholder={`e.g., 15 (max: ${totalQuantity - currentCompleted})`}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Progress'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


/**
 * WorkspaceTasks - WBS Engineering Task Governance Center (Advanced)
 * Features: Infinite nesting, bi-directional budget constraints, dynamic column governance, auto-topology numbering.
 * ARCHITECTURE REFACTORED: Now consumes state from context.
 */
export function WorkspaceTasks() {
  const { workspace, logAuditEvent, eventBus, createTask, updateTask, deleteTask } = useWorkspace();
  const { uploadTaskAttachment } = useStorage(workspace.id);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<WorkspaceTask> | null>(null);
  const [reportingTask, setReportingTask] = useState<TaskWithChildren | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [previewingImage, setPreviewingImage] = useState<string | null>(null);
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(['type', 'priority', 'discount', 'subtotal', 'progress', 'status'])
  );

  const tasks = useMemo(
    () =>
      Object.values(workspace.tasks || {}).sort(
        (a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0)
      ),
    [workspace.tasks]
  );

  const tree = useMemo(() => buildTaskTree(tasks), [tasks]);

  useEffect(() => {
    if (!isAddOpen) {
      setPhotos([]);
    }
  }, [isAddOpen]);

  // Discrete Recovery Principle (AB dual-track):
  //   TRACK_B_ISSUES →|IssueResolved 事件| WORKSPACE_EVENT_BUS
  //   A 軌自行訂閱後恢復（not direct back-flow）
  // When an issue is resolved with a sourceTaskId, unblock the blocked task.
  useEffect(() => {
    const unsub = eventBus.subscribe('workspace:issues:resolved', async (payload) => {
      if (!payload.sourceTaskId) return;
      try {
        await updateTask(payload.sourceTaskId, { progressState: 'doing' });
        toast({
          title: 'Task Unblocked',
          description: `Task resumed after issue "${payload.issueTitle}" was resolved.`,
        });
      } catch {
        // Non-critical: task unblock is best-effort; user can manually update state.
      }
    });
    return () => unsub();
  }, [eventBus, updateTask]);

  const handleLocationChange = (field: keyof Location, value: string) => {
    setEditingTask(prev => ({
        ...prev,
        location: {
            ...prev?.location,
            description: prev?.location?.description || '',
            [field]: value
        }
    }))
  };

  const handleSaveTask = async () => {
    if (!editingTask?.name) return;
    setIsUploading(true);

    try {
      const newPhotoURLs = await Promise.all(
        photos.map(photo => uploadTaskAttachment(photo))
      );
      
      const existingPhotoURLs = editingTask.photoURLs || [];
      const finalPhotoURLs = [...existingPhotoURLs, ...newPhotoURLs];

      const subtotal =
        (Number(editingTask.quantity) || 0) *
        (Number(editingTask.unitPrice) || 0) - (Number(editingTask.discount) || 0);

      if (editingTask.parentId) {
        const parent = tasks.find((t) => t.id === editingTask.parentId);
        if (parent) {
          const currentChildrenSum = tasks
            .filter(
              (t) => t.parentId === editingTask.parentId && t.id !== editingTask.id
            )
            .reduce((acc, t) => acc + (t.subtotal || 0), 0);

          if (currentChildrenSum + subtotal > (parent.subtotal || 0)) {
            toast({
              variant: 'destructive',
              title: 'Budget Overflow Intercepted',
              description: `Sum of child items cannot exceed the budget limit of "${parent.name}".`,
            });
            setIsUploading(false);
            return;
          }
        }
      }

      if (editingTask.id) {
        const childSum = tasks
          .filter((t) => t.parentId === editingTask.id)
          .reduce((acc, t) => acc + (t.subtotal || 0), 0);
        if (subtotal < childSum) {
          toast({
            variant: 'destructive',
            title: 'Budget Sovereignty Conflict',
            description: `Budget limit ($${subtotal}) cannot be less than the sum of existing child items ($${childSum}).`,
          });
          setIsUploading(false);
          return;
        }
      }

      const finalData: Partial<WorkspaceTask> = {
        ...editingTask,
        subtotal,
        photoURLs: finalPhotoURLs,
        progressState: editingTask.progressState || 'todo',
      };
      delete finalData.progress; // Ensure calculated progress is not saved

      if (editingTask.id) {
        await updateTask(editingTask.id, finalData);

        logAuditEvent(
          'Calibrated WBS Node',
          `${editingTask.name} [Subtotal: ${subtotal}]`,
          'update'
        );

        const updatedTaskForEvent: WorkspaceTask = {
          ...(workspace.tasks?.[editingTask.id] || {}),
          ...finalData,
        } as WorkspaceTask;
        
        if (finalData.progressState === 'completed') {
          eventBus.publish('workspace:tasks:completed', { task: updatedTaskForEvent });
        }
      } else {
        const taskToCreate: Omit<WorkspaceTask, 'id' | 'createdAt' | 'updatedAt'> = {
            ...finalData,
            name: finalData.name!,
            progressState: finalData.progressState!,
            subtotal: finalData.subtotal!,
            completedQuantity: 0,
        };
        await createTask(taskToCreate);
        logAuditEvent('Defined WBS Node', editingTask.name!, 'create');
      }

      setEditingTask(null);
      setIsAddOpen(false);
    } catch (error: unknown) {
      console.error('Error saving task:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Save Task',
        description: getErrorMessage(error, 'An unknown error occurred.'),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReportProgress = async (taskId: string, newCompletedQuantity: number) => {
    try {
      await updateTask(taskId, { completedQuantity: newCompletedQuantity });
      toast({ title: "Progress Updated" });
      setReportingTask(null);
    } catch (error: unknown) {
      console.error("Error reporting progress:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to Update Progress',
        description: getErrorMessage(error, "An unknown error occurred."),
      });
    }
  };

  const handleSubmitForQA = async (task: TaskWithChildren) => {
    const updates = { progressState: 'completed' as const };

    try {
      await updateTask(task.id, updates);
      
      const updatedTaskForEvent: WorkspaceTask = {
        ...task,
        progressState: 'completed',
      };
      
      eventBus.publish('workspace:tasks:completed', { task: updatedTaskForEvent });
      logAuditEvent('Submitted for QA', task.name, 'update');
      toast({
        title: 'Task Submitted for QA',
        description: `"${task.name}" is now in the QA queue.`,
      });
    } catch (error: unknown) {
      console.error('Error submitting for QA:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: getErrorMessage(error, 'An unknown error occurred.'),
      });
    }
  };


  const handleDeleteTask = async (node: TaskWithChildren) => {
    if (confirm('Confirm destruction of this node and all its descendants?')) {
      try {
        await deleteTask(node.id);
      } catch (error: unknown) {
        console.error('Error deleting task:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to Delete Task',
          description: getErrorMessage(error, 'An unknown error occurred.'),
        });
      }
    }
  };
  
  const handleScheduleRequest = (task: WorkspaceTask) => {
    eventBus.publish('workspace:tasks:scheduleRequested', { taskName: task.name! });
    toast({
        title: 'Schedule Request Sent',
        description: `"${task.name}" was sent to the Schedule capability.`,
    });
  };

  const handleMarkBlocked = async (task: TaskWithChildren) => {
    if (!['todo', 'doing'].includes(task.progressState)) return;
    try {
      await updateTask(task.id, { progressState: 'blocked' as const });
      const updatedTask: WorkspaceTask = { ...task, progressState: 'blocked' as WorkspaceTask['progressState'] };
      eventBus.publish('workspace:tasks:blocked', { task: updatedTask });
      logAuditEvent('Task Blocked', task.name, 'update');
      toast({ title: 'Task Blocked', description: `"${task.name}" is blocked. A B-track issue will be created.` });
    } catch (error: unknown) {
      toast({ variant: 'destructive', title: 'Failed to Block Task', description: getErrorMessage(error, 'Unknown error.') });
    }
  };

  const toggleColumn = (key: string) => {
    const next = new Set(visibleColumns);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setVisibleColumns(next);
  };
  
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };


  const RenderTask = ({
    node,
    level = 0,
  }: {
    node: TaskWithChildren;
    level?: number;
  }) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const isViolating = node.descendantSum > node.subtotal;

    return (
      <div className="duration-300 animate-in slide-in-from-left-2">
        <div
          className={cn(
            'group flex items-center gap-3 p-3 rounded-2xl border transition-all mb-1',
            isViolating
              ? 'bg-destructive/5 border-destructive/30'
              : 'bg-card/40 border-border/60 hover:border-primary/40',
            level > 0 &&
              'ml-8 relative before:absolute before:left-[-20px] before:top-[-10px] before:bottom-[50%] before:w-[1.5px] before:bg-primary/20 after:absolute after:left-[-20px] after:top-[50%] after:w-[15px] after:h-[1.5px] after:bg-primary/20'
          )}
        >
          <button
            onClick={() => {
              const next = new Set(expandedIds);
              if (next.has(node.id)) next.delete(node.id);
              else next.add(node.id);
              setExpandedIds(next);
            }}
            className={cn(
              'p-1 hover:bg-primary/10 rounded-lg transition-colors',
              !hasChildren && 'opacity-0 pointer-events-none'
            )}
          >
            {isExpanded ? (
              <ChevronDown className="size-3.5 text-primary" />
            ) : (
              <ChevronRight className="size-3.5 text-primary" />
            )}
          </button>

          <div className="grid flex-1 grid-cols-12 items-center gap-3">
            <div className="col-span-4 flex items-center gap-2">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-black text-primary">
                {node.wbsNo}
              </span>
              <div className="flex flex-1 flex-col truncate">
                <p className="truncate text-xs font-black tracking-tight">
                  {node.name}
                </p>
                {node.location?.description && (
                  <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="size-3" />
                      <p className="truncate text-[10px] font-medium">{[node.location.building, node.location.floor, node.location.room, node.location.description].filter(Boolean).join(' - ')}</p>
                  </div>
                )}
                 {node.photoURLs && node.photoURLs.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-2">
                    {node.photoURLs.map((url, i) => (
                       <button key={i} onClick={() => setPreviewingImage(url)} className="relative size-8 overflow-hidden rounded border transition-opacity hover:opacity-80">
                         <Image src={url} alt={`Task attachment ${i + 1}`} fill sizes="32px" className="object-cover" />
                       </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-8 grid grid-cols-6 items-center gap-2">
              {visibleColumns.has('type') && (
                <div className="truncate text-[9px] font-bold uppercase text-muted-foreground">
                  {node.type}
                </div>
              )}
              {visibleColumns.has('priority') && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[7px] h-4 px-1 uppercase w-fit',
                    node.priority === 'high'
                      ? 'border-red-500/50 text-red-500'
                      : ''
                  )}
                >
                  {node.priority}
                </Badge>
              )}
              {visibleColumns.has('discount') && (
                <div className="text-right">
                    <p className="text-[8px] font-black uppercase leading-none text-muted-foreground">
                        Discount
                    </p>
                    <p className="text-[10px] font-bold text-destructive">
                        -${(node.discount || 0).toLocaleString()}
                    </p>
                </div>
              )}
              {visibleColumns.has('subtotal') && (
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase leading-none text-muted-foreground">
                    Budget
                  </p>
                  <p
                    className={cn(
                      'text-[10px] font-bold',
                      isViolating ? 'text-destructive' : 'text-primary'
                    )}
                  >
                    ${node.subtotal?.toLocaleString()}
                  </p>
                </div>
              )}
              {visibleColumns.has('progress') && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Progress value={node.progress || 0} className="h-1 flex-1" />
                    <span className="text-[8px] font-black">
                      {node.progress || 0}%
                    </span>
                  </div>
                  {(node.quantity ?? 1) > 1 && (
                    <span className="text-right font-mono text-[9px] font-bold text-muted-foreground">
                      {node.completedQuantity || 0} / {node.quantity}
                    </span>
                  )}
                </div>
              )}
              {visibleColumns.has('status') && (
                <div className="flex items-center justify-end">
                  {node.progress === 100 && ['todo', 'doing'].includes(node.progressState) ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-blue-500 hover:bg-blue-500/10 hover:text-blue-500"
                      onClick={() => handleSubmitForQA(node)}
                      title="Submit for QA"
                    >
                      <Send className="size-4" />
                    </Button>
                  ) : (
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full self-center',
                        node.progressState === 'completed'
                          ? 'bg-blue-500'
                          : node.progressState === 'verified'
                          ? 'bg-purple-500'
                          : node.progressState === 'accepted'
                          ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                          : node.progressState === 'blocked'
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      )}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="ml-2 flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
             {(node.quantity ?? 1) > 1 && !hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-primary"
                onClick={() => setReportingTask(node)}
              >
                <ClipboardPlus className="size-3.5" />
              </Button>
            )}
             <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-primary"
                onClick={() => handleScheduleRequest(node)}
            >
                <CalendarPlus className="size-3.5" />
            </Button>
            {['todo', 'doing'].includes(node.progressState) && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-destructive"
                onClick={() => handleMarkBlocked(node)}
                title="Mark as Blocked (B-Track)"
              >
                <OctagonX className="size-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-primary"
              onClick={() => {
                setEditingTask({
                  parentId: node.id,
                  quantity: 1,
                  completedQuantity: 0,
                  unitPrice: 0,
                  discount: 0,
                  type: 'Sub-task',
                  priority: 'medium',
                  progressState: 'todo',
                });
                setIsAddOpen(true);
              }}
            >
              <Plus className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-primary"
              onClick={() => {
                setEditingTask({
                    ...node,
                    location: node.location || { description: '' }
                });
                setIsAddOpen(true);
              }}
            >
              <Settings2 className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-destructive"
              onClick={() => handleDeleteTask(node)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="space-y-0.5">
            {node.children.map((child: TaskWithChildren) => (
              <RenderTask key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 duration-500 animate-in fade-in">
      <div className="flex items-center justify-between rounded-3xl border border-primary/20 bg-card/40 p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
              WBS Governance
            </h3>
            <p className="flex items-center gap-2 text-[9px] font-bold uppercase text-muted-foreground">
              <Clock className="size-3" /> Real-time Budget & Topology
              Monitoring
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-xl text-[10px] font-black uppercase"
              >
                <View className="size-3.5" /> View Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase">
                Visible Columns
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={visibleColumns.has('type')}
                onCheckedChange={() => toggleColumn('type')}
              >
                Task Type
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.has('priority')}
                onCheckedChange={() => toggleColumn('priority')}
              >
                Priority
              </DropdownMenuCheckboxItem>
               <DropdownMenuCheckboxItem
                checked={visibleColumns.has('discount')}
                onCheckedChange={() => toggleColumn('discount')}
              >
                Discount
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.has('subtotal')}
                onCheckedChange={() => toggleColumn('subtotal')}
              >
                Budget
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.has('progress')}
                onCheckedChange={() => toggleColumn('progress')}
              >
                Progress
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.has('status')}
                onCheckedChange={() => toggleColumn('status')}
              >
                Status
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            className="h-9 gap-2 rounded-full px-5 text-[10px] font-black uppercase shadow-lg shadow-primary/20"
            onClick={() => {
              setEditingTask({
                quantity: 1,
                completedQuantity: 0,
                unitPrice: 0,
                discount: 0,
                type: 'Top-level Project',
                priority: 'medium',
                progressState: 'todo',
                photoURLs: [],
                location: { description: '' }
              });
              setIsAddOpen(true);
            }}
          >
            <Plus className="size-3.5" /> Create Root Node
          </Button>
        </div>
      </div>

       <ProgressReportDialog
        task={reportingTask}
        isOpen={!!reportingTask}
        onClose={() => setReportingTask(null)}
        onSubmit={handleReportProgress}
      />

      <Dialog open={!!previewingImage} onOpenChange={(open) => !open && setPreviewingImage(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-1 shadow-none">
          <DialogHeader>
            <DialogTitle className="sr-only">Image Preview</DialogTitle>
            <DialogDescription className="sr-only">A larger view of the attached image.</DialogDescription>
          </DialogHeader>
            {previewingImage && (
                <div className="relative aspect-video h-auto w-full">
                    <Image src={previewingImage} alt="Attachment preview" fill sizes="100vw" className="rounded-lg object-contain" />
                </div>
            )}
        </DialogContent>
      </Dialog>

      <div className="space-y-1">
        {tree.length > 0 ? (
          tree.map((root) => <RenderTask key={root.id} node={root} />)
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed bg-muted/5 p-20 text-center opacity-20">
            <Coins className="size-12" />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Awaiting Engineering Node Definition...
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTask(null);
            setIsAddOpen(false);
          } else {
            setIsAddOpen(true);
          }
        }}
      >
        <DialogContent className="max-w-3xl overflow-hidden rounded-[2.5rem] border-none p-0 shadow-2xl">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 font-headline text-3xl">
                <Settings2 className="size-8" />{' '}
                {editingTask?.id ? 'Calibrate WBS Node' : 'Define New Node'}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="grid max-h-[70vh] grid-cols-2 gap-6 overflow-y-auto p-8">
            <div className="col-span-2 space-y-1.5">
              <Label className="ml-1 text-[10px] font-black uppercase text-muted-foreground">
                Task Name
              </Label>
              <Input
                value={editingTask?.name || ''}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, name: e.target.value })
                }
                className="h-12 rounded-xl border-none bg-muted/30 font-bold"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="ml-1 text-[10px] font-black uppercase text-muted-foreground">
                Description & Specs
              </Label>
              <Textarea
                value={editingTask?.description || ''}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    description: e.target.value,
                  })
                }
                className="min-h-[100px] resize-none rounded-xl border-none bg-muted/30"
              />
            </div>

            <div className="col-span-2 space-y-2">
                <Label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                    <MapPin className="size-3"/> Location
                </Label>
                <div className="grid grid-cols-3 gap-4">
                    <Input
                        placeholder="Building"
                        value={editingTask?.location?.building || ''}
                        onChange={(e) => handleLocationChange('building', e.target.value)}
                        className="h-11 rounded-xl border-none bg-muted/30"
                    />
                    <Input
                        placeholder="Floor"
                        value={editingTask?.location?.floor || ''}
                        onChange={(e) => handleLocationChange('floor', e.target.value)}
                        className="h-11 rounded-xl border-none bg-muted/30"
                    />
                    <Input
                        placeholder="Room"
                        value={editingTask?.location?.room || ''}
                        onChange={(e) => handleLocationChange('room', e.target.value)}
                        className="h-11 rounded-xl border-none bg-muted/30"
                    />
                </div>
                <Textarea
                    placeholder="Location details (e.g., 'Behind the main server rack')"
                    value={editingTask?.location?.description || ''}
                    onChange={(e) => handleLocationChange('description', e.target.value)}
                    className="resize-none rounded-xl border-none bg-muted/30"
                    rows={2}
                />
            </div>
            
            <div className="col-span-2 space-y-3">
                <Label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                    <Paperclip className="size-3"/> Attachments
                </Label>
                
                {editingTask?.photoURLs && editingTask.photoURLs.length > 0 && (
                   <div className="grid grid-cols-4 gap-2">
                    {editingTask.photoURLs.map((url, index) => (
                      <div key={index} className="group relative aspect-square">
                        <Image src={url} alt={`Existing attachment ${index + 1}`} fill sizes="200px" className="rounded-lg object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-4 gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="group relative aspect-square">
                        <Image src={URL.createObjectURL(photo)} alt={`New attachment ${index}`} fill sizes="200px" className="rounded-lg object-cover" />
                        <Button variant="destructive" size="icon" className="absolute right-1 top-1 size-5 opacity-0 transition-opacity group-hover:opacity-100" onClick={() => handleRemovePhoto(index)}>
                            <X className="size-3"/>
                        </Button>
                      </div>
                    ))}
                </div>
                
                <Button asChild variant="outline" className="h-12 w-full cursor-pointer rounded-xl border-2 border-dashed bg-muted/30 hover:bg-muted/50">
                    <label htmlFor="photo-upload">
                        <UploadCloud className="mr-2 size-4" /> Upload Images
                        <input id="photo-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handlePhotoSelect} />
                    </label>
                </Button>
            </div>

            <div className="space-y-1.5">
              <Label className="ml-1 text-[10px] font-black uppercase text-muted-foreground">
                Status
              </Label>
              <Select
                value={editingTask?.progressState}
                onValueChange={(v) =>
                  setEditingTask({
                    ...editingTask,
                    progressState: v as WorkspaceTask['progressState'],
                  })
                }
              >
                <SelectTrigger className="h-11 rounded-xl border-none bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To-do</SelectItem>
                  <SelectItem value="doing">Doing</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2 grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="task-quantity" className="ml-1 text-[10px] font-black uppercase text-muted-foreground">
                    Quantity (Qty)
                    </Label>
                    <Input
                    id="task-quantity"
                    type="number"
                    value={editingTask?.quantity || 0}
                    onChange={(e) =>
                        setEditingTask({
                        ...editingTask,
                        quantity: Number(e.target.value),
                        })
                    }
                    className="h-11 rounded-xl border-none bg-muted/30"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="task-unitprice" className="ml-1 text-[10px] font-black uppercase text-muted-foreground">
                    Unit Price
                    </Label>
                    <Input
                    id="task-unitprice"
                    type="number"
                    value={editingTask?.unitPrice || 0}
                    onChange={(e) =>
                        setEditingTask({
                        ...editingTask,
                        unitPrice: Number(e.target.value),
                        })
                    }
                    className="h-11 rounded-xl border-none bg-muted/30"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="task-discount" className="ml-1 text-[10px] font-black uppercase text-muted-foreground">
                    Discount
                    </Label>
                    <Input
                    id="task-discount"
                    type="number"
                    value={editingTask?.discount || 0}
                    onChange={(e) =>
                        setEditingTask({
                        ...editingTask,
                        discount: Number(e.target.value),
                        })
                    }
                    className="h-11 rounded-xl border-none bg-muted/30"
                    />
                </div>
            </div>

            <div className="col-span-2 flex items-center justify-between rounded-3xl border border-primary/10 bg-primary/5 p-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Subtotal
                </p>
              </div>
              <span className="font-mono text-2xl font-black text-primary">
                $
                {(
                  (editingTask?.quantity || 0) * (editingTask?.unitPrice || 0) - (editingTask?.discount || 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <DialogFooter className="border-t bg-muted/30 p-6">
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddOpen(false);
                setEditingTask(null);
              }}
              className="rounded-xl text-[10px] font-black uppercase"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTask}
              disabled={isUploading}
              className="rounded-xl px-8 text-[10px] font-black uppercase shadow-xl shadow-primary/20"
            >
              {isUploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {isUploading ? "Uploading & Syncing..." : "Sync to Cloud Sovereignty"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    
