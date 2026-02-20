
'use client';

import { useWorkspace } from '../../../../../../context/workspace-context';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
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
  Send,
  UploadCloud,
  X,
  Loader2,
  Paperclip,
  MapPin,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from '@/shared/hooks/use-toast';
import { Badge } from '@/shared/ui/badge';
import { WorkspaceTask, Location } from '@/types/domain';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/ui/dialog';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Progress } from '@/shared/ui/progress';
import { cn } from '@/lib/utils';
import { buildTaskTree } from './workspace-tasks.logic';
import type { TaskWithChildren } from './workspace-tasks.types';
import { useStorage } from '@/hooks/infra/use-storage';
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
            Submit completed quantity for "{task.name}". Current: {currentCompleted} / {totalQuantity}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
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
      <div className="animate-in slide-in-from-left-2 duration-300">
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
              <ChevronDown className="w-3.5 h-3.5 text-primary" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-primary" />
            )}
          </button>

          <div className="flex-1 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-4 flex items-center gap-2">
              <span className="text-[9px] font-mono font-black bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                {node.wbsNo}
              </span>
              <div className="flex flex-col flex-1 truncate">
                <p className="text-xs font-black tracking-tight truncate">
                  {node.name}
                </p>
                {node.location?.description && (
                  <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <p className="text-[10px] font-medium truncate">{[node.location.building, node.location.floor, node.location.room, node.location.description].filter(Boolean).join(' - ')}</p>
                  </div>
                )}
                 {node.photoURLs && node.photoURLs.length > 0 && (
                  <div className="flex items-center gap-2 mt-1.5">
                    {node.photoURLs.map((url, i) => (
                       <button key={i} onClick={() => setPreviewingImage(url)} className="relative w-8 h-8 rounded border overflow-hidden hover:opacity-80 transition-opacity">
                         <Image src={url} alt={`Task attachment ${i + 1}`} fill sizes="32px" className="object-cover" />
                       </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-8 grid grid-cols-6 gap-2 items-center">
              {visibleColumns.has('type') && (
                <div className="text-[9px] font-bold uppercase text-muted-foreground truncate">
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
                    <p className="text-[8px] font-black text-muted-foreground uppercase leading-none">
                        Discount
                    </p>
                    <p className="text-[10px] font-bold text-destructive">
                        -${(node.discount || 0).toLocaleString()}
                    </p>
                </div>
              )}
              {visibleColumns.has('subtotal') && (
                <div className="text-right">
                  <p className="text-[8px] font-black text-muted-foreground uppercase leading-none">
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
                    <span className="text-[9px] text-muted-foreground font-mono font-bold text-right">
                      {node.completedQuantity || 0} / {node.quantity}
                    </span>
                  )}
                </div>
              )}
              {visibleColumns.has('status') && (
                <div className="flex justify-end items-center">
                  {node.progress === 100 && ['todo', 'doing'].includes(node.progressState) ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-blue-500 hover:bg-blue-500/10 hover:text-blue-500"
                      onClick={() => handleSubmitForQA(node)}
                      title="Submit for QA"
                    >
                      <Send className="w-4 h-4" />
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
                          : 'bg-amber-500'
                      )}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-2">
             {(node.quantity ?? 1) > 1 && !hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-primary"
                onClick={() => setReportingTask(node)}
              >
                <ClipboardPlus className="w-3.5 h-3.5" />
              </Button>
            )}
             <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-primary"
                onClick={() => handleScheduleRequest(node)}
            >
                <CalendarPlus className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-primary"
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
              <Plus className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-primary"
              onClick={() => {
                setEditingTask({
                    ...node,
                    location: node.location || { description: '' }
                });
                setIsAddOpen(true);
              }}
            >
              <Settings2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-destructive"
              onClick={() => handleDeleteTask(node)}
            >
              <Trash2 className="w-3.5 h-3.5" />
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between bg-card/40 backdrop-blur-md p-4 rounded-3xl border border-primary/20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
              WBS Governance
            </h3>
            <p className="text-[9px] text-muted-foreground font-bold uppercase flex items-center gap-2">
              <Clock className="w-3 h-3" /> Real-time Budget & Topology
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
                className="h-9 gap-2 font-black uppercase text-[10px] rounded-xl"
              >
                <View className="w-3.5 h-3.5" /> View Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold">
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
            className="h-9 gap-2 font-black uppercase text-[10px] rounded-full shadow-lg shadow-primary/20 px-5"
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
            <Plus className="w-3.5 h-3.5" /> Create Root Node
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
        <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none">
          <DialogHeader>
            <DialogTitle className="sr-only">Image Preview</DialogTitle>
            <DialogDescription className="sr-only">A larger view of the attached image.</DialogDescription>
          </DialogHeader>
            {previewingImage && (
                <div className="relative aspect-video w-full h-auto">
                    <Image src={previewingImage} alt="Attachment preview" fill sizes="100vw" className="object-contain rounded-lg" />
                </div>
            )}
        </DialogContent>
      </Dialog>

      <div className="space-y-1">
        {tree.length > 0 ? (
          tree.map((root) => <RenderTask key={root.id} node={root} />)
        ) : (
          <div className="p-20 text-center border-2 border-dashed rounded-3xl bg-muted/5 opacity-20 flex flex-col items-center gap-3">
            <Coins className="w-12 h-12" />
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
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="font-headline text-3xl flex items-center gap-3">
                <Settings2 className="w-8 h-8" />{' '}
                {editingTask?.id ? 'Calibrate WBS Node' : 'Define New Node'}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-8 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                Task Name
              </Label>
              <Input
                value={editingTask?.name || ''}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, name: e.target.value })
                }
                className="h-12 rounded-xl bg-muted/30 border-none font-bold"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
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
                className="rounded-xl bg-muted/30 border-none resize-none min-h-[100px]"
              />
            </div>

            <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3"/> Location
                </Label>
                <div className="grid grid-cols-3 gap-4">
                    <Input
                        placeholder="Building"
                        value={editingTask?.location?.building || ''}
                        onChange={(e) => handleLocationChange('building', e.target.value)}
                        className="h-11 rounded-xl bg-muted/30 border-none"
                    />
                    <Input
                        placeholder="Floor"
                        value={editingTask?.location?.floor || ''}
                        onChange={(e) => handleLocationChange('floor', e.target.value)}
                        className="h-11 rounded-xl bg-muted/30 border-none"
                    />
                    <Input
                        placeholder="Room"
                        value={editingTask?.location?.room || ''}
                        onChange={(e) => handleLocationChange('room', e.target.value)}
                        className="h-11 rounded-xl bg-muted/30 border-none"
                    />
                </div>
                <Textarea
                    placeholder="Location details (e.g., 'Behind the main server rack')"
                    value={editingTask?.location?.description || ''}
                    onChange={(e) => handleLocationChange('description', e.target.value)}
                    className="rounded-xl bg-muted/30 border-none resize-none"
                    rows={2}
                />
            </div>
            
            <div className="col-span-2 space-y-3">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-2">
                    <Paperclip className="w-3 h-3"/> Attachments
                </Label>
                
                {editingTask?.photoURLs && editingTask.photoURLs.length > 0 && (
                   <div className="grid grid-cols-4 gap-2">
                    {editingTask.photoURLs.map((url, index) => (
                      <div key={index} className="relative group aspect-square">
                        <Image src={url} alt={`Existing attachment ${index + 1}`} fill sizes="200px" className="object-cover rounded-lg" />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-4 gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group aspect-square">
                        <Image src={URL.createObjectURL(photo)} alt={`New attachment ${index}`} fill sizes="200px" className="object-cover rounded-lg" />
                        <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemovePhoto(index)}>
                            <X className="w-3 h-3"/>
                        </Button>
                      </div>
                    ))}
                </div>
                
                <Button asChild variant="outline" className="w-full h-12 rounded-xl border-dashed border-2 bg-muted/30 hover:bg-muted/50 cursor-pointer">
                    <label htmlFor="photo-upload">
                        <UploadCloud className="w-4 h-4 mr-2" /> Upload Images
                        <input id="photo-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handlePhotoSelect} />
                    </label>
                </Button>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
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
                <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To-do</SelectItem>
                  <SelectItem value="doing">Doing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2 grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="task-quantity" className="text-[10px] font-black uppercase text-muted-foreground ml-1">
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
                    className="h-11 rounded-xl bg-muted/30 border-none"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="task-unitprice" className="text-[10px] font-black uppercase text-muted-foreground ml-1">
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
                    className="h-11 rounded-xl bg-muted/30 border-none"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="task-discount" className="text-[10px] font-black uppercase text-muted-foreground ml-1">
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
                    className="h-11 rounded-xl bg-muted/30 border-none"
                    />
                </div>
            </div>

            <div className="col-span-2 p-6 bg-primary/5 rounded-3xl flex justify-between items-center border border-primary/10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Subtotal
                </p>
              </div>
              <span className="text-2xl font-mono font-black text-primary">
                $
                {(
                  (editingTask?.quantity || 0) * (editingTask?.unitPrice || 0) - (editingTask?.discount || 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/30 border-t">
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddOpen(false);
                setEditingTask(null);
              }}
              className="rounded-xl font-black uppercase text-[10px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTask}
              disabled={isUploading}
              className="rounded-xl px-8 shadow-xl shadow-primary/20 font-black uppercase text-[10px]"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isUploading ? "Uploading & Syncing..." : "Sync to Cloud Sovereignty"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    
