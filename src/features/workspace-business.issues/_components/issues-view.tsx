"use client";

import { useWorkspace } from '@/features/workspace-core';
import { Button } from "@/shared/shadcn-ui/button";
import { Badge } from "@/shared/shadcn-ui/badge";
import { AlertCircle, Plus, ArrowRight, ShieldAlert, DollarSign, PenTool, MessageSquare, CornerUpLeft, CheckCircle2 } from "lucide-react";
import { toast } from "@/shared/utility-hooks/use-toast";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/shadcn-ui/dialog";
import { Label } from "@/shared/shadcn-ui/label";
import { Input } from "@/shared/shadcn-ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/shadcn-ui/select";
import { useAuth } from "@/shared/app-providers/auth-provider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/shared/shadcn-ui/sheet";
import { type WorkspaceIssue } from "@/shared/types";
import { format } from "date-fns";
import { ScrollArea } from "@/shared/shadcn-ui/scroll-area";
import { Textarea } from "@/shared/shadcn-ui/textarea";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function WorkspaceIssues() {
  const { workspace, logAuditEvent, protocol, createIssue, addCommentToIssue, resolveIssue } = useWorkspace();
  const { state: authState } = useAuth();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newIssue, setNewIssue] = useState<{ title: string; type: 'technical' | 'financial'; priority: 'high' | 'medium' }>({ title: "", type: "technical", priority: "high" });
  const [selectedIssue, setSelectedIssue] = useState<WorkspaceIssue | null>(null);
  const [newComment, setNewComment] = useState("");

  const issues = useMemo(() => Object.values(workspace.issues || {}).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)), [workspace.issues]);

  const handleAddIssue = async () => {
    if (!newIssue.title.trim()) return;

    try {
        await createIssue(newIssue.title, newIssue.type, newIssue.priority);
        logAuditEvent("B-Track Activated", `Issue Submitted: ${newIssue.title}`, 'create');
        toast({ title: "B-Track issue has been submitted" });
        setIsAddOpen(false);
        setNewIssue({ title: "", type: "technical", priority: "high" });
    } catch (error: unknown) {
        console.error("Error adding issue:", error);
        toast({
          variant: "destructive",
          title: "Failed to Add Issue",
          description: getErrorMessage(error, "An unknown error occurred."),
        });
    }
  };
  
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedIssue || !authState.user) return;
    try {
      await addCommentToIssue(selectedIssue.id, authState.user.name, newComment.trim());
      setNewComment("");
      toast({ title: "Comment posted" });
    } catch (error: unknown) {
        console.error("Error adding comment:", error);
        toast({
          variant: "destructive",
          title: "Failed to Post Comment",
          description: getErrorMessage(error, "An unknown error occurred."),
        });
    }
  };

  const handleResolveIssue = async (issue: WorkspaceIssue) => {
    if (!authState.user) return;
    try {
      // Outbox pattern: resolveIssue routes through Transaction Runner in workspace context.
      // The workspace:issues:resolved event is collected in the Outbox and flushed to the
      // Event Bus only after the Firestore write commits — no direct publish from the view.
      await resolveIssue(issue.id, issue.title, authState.user.name, issue.sourceTaskId);
      logAuditEvent("B-Track Resolved", `Issue Closed: ${issue.title}`, 'update');
      setSelectedIssue(null);
      toast({ title: "Issue Resolved", description: `"${issue.title}" has been closed. A-Track may now resume.` });
    } catch (error: unknown) {
      console.error("Error resolving issue:", error);
      toast({
        variant: "destructive",
        title: "Failed to Resolve Issue",
        description: getErrorMessage(error, "An unknown error occurred."),
      });
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="size-4 text-amber-500" />;
      case 'technical': return <PenTool className="size-4 text-primary" />;
      default: return <AlertCircle className="size-4 text-accent" />;
    }
  };

  return (
    <div className="space-y-6 duration-500 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <ShieldAlert className="size-4 text-accent" /> B-Track: Anomaly & Conflict Governance
          </h3>
          <Badge variant="outline" className="h-4 border-accent/20 bg-accent/5 text-[8px] text-accent">
            PROTOCOL: {protocol || "STANDARD"}
          </Badge>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-2 border-accent/20 text-[9px] font-bold uppercase text-accent" onClick={() => setIsAddOpen(true)}>
          <Plus className="size-3" /> Submit Issue
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {issues?.map(issue => (
          <button key={issue.id} type="button" className="flex w-full cursor-pointer items-center justify-between rounded-r-2xl border border-l-4 border-border/60 border-l-accent bg-card/40 p-4 text-left hover:bg-muted/30" onClick={() => setSelectedIssue(issue)}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent/10 p-2 text-accent">
                {getIssueIcon(issue.type)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{issue.title}</h4>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="border-accent/20 text-[8px] uppercase text-accent">{issue.type}</Badge>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Status: {issue.issueState}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
              <ArrowRight className="size-4" />
            </Button>
          </button>
        ))}
      </div>

      <Sheet open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
        <SheetContent className="flex flex-col border-l-border/60 p-0 sm:max-w-xl">
          {selectedIssue && (
            <>
              <SheetHeader className="border-b border-border/60 bg-muted/20 p-6">
                <SheetTitle className="font-headline text-xl">{selectedIssue.title}</SheetTitle>
                <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="border-accent/30 bg-accent/10 font-bold uppercase text-accent">{selectedIssue.priority}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">Created: {selectedIssue.createdAt ? format(selectedIssue.createdAt.seconds * 1000, 'PPP') : '...'}</span>
                </div>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <div className="space-y-6 p-6">
                  {(selectedIssue.comments || []).length > 0 ? (
                    selectedIssue.comments?.map(comment => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <div className="mt-1 flex size-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary">{comment.author[0]}</div>
                        <div className="flex-1 rounded-2xl border border-border/40 bg-muted/40 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold">{comment.author}</span>
                            <time className="font-mono text-[10px] text-muted-foreground">{comment.createdAt ? format(comment.createdAt.seconds * 1000, 'p') : '...'}</time>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                     <div className="flex flex-col items-center gap-3 p-12 text-center text-muted-foreground">
                        <MessageSquare className="size-8 opacity-20" />
                        <span className="text-xs font-bold uppercase">No discussion yet.</span>
                     </div>
                  )}
                </div>
              </ScrollArea>
              <SheetFooter className="border-t border-border/60 bg-background p-4">
                <div className="flex w-full flex-col gap-3">
                  {selectedIssue.issueState === 'open' && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-green-500/30 text-green-600 hover:bg-green-500/10 hover:text-green-700"
                      onClick={() => handleResolveIssue(selectedIssue)}
                    >
                      <CheckCircle2 className="size-4" /> Mark Resolved
                    </Button>
                  )}
                  <div className="flex items-start gap-3">
                    <Textarea 
                      placeholder="Type your comment here..." 
                      className="flex-1 rounded-xl border-border/50 bg-muted/50 focus-visible:ring-accent"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button size="icon" className="size-10 rounded-xl bg-accent hover:bg-accent/90" onClick={handleAddComment} disabled={!newComment.trim()}>
                      <CornerUpLeft className="size-4" />
                    </Button>
                  </div>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Submit Governance Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Issue Title</Label>
              <Input value={newIssue.title} onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })} placeholder="Describe the anomaly..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newIssue.type} onValueChange={(v) => setNewIssue({ ...newIssue, type: v as 'technical' | 'financial' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newIssue.priority} onValueChange={(v) => setNewIssue({ ...newIssue, priority: v as 'high' | 'medium' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddIssue} className="bg-accent hover:bg-accent/90">Submit Issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
