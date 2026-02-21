"use client";

import { useWorkspace } from '@/features/workspace-core';
import { Button } from "@/shared/shadcn-ui/button";
import { Badge } from "@/shared/shadcn-ui/badge";
import { AlertCircle, Plus, ArrowRight, ShieldAlert, DollarSign, PenTool, MessageSquare, CornerUpLeft } from "lucide-react";
import { toast } from "@/shared/utility-hooks/use-toast";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/shadcn-ui/dialog";
import { Label } from "@/shared/shadcn-ui/label";
import { Input } from "@/shared/shadcn-ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/shadcn-ui/select";
import { useAuth } from "@/shared/app-providers/auth-provider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/shared/shadcn-ui/sheet";
import { type WorkspaceIssue } from "@/shared/types";
import { format } from "date-fns";
import { ScrollArea } from "@/shared/shadcn-ui/scroll-area";
import { Textarea } from "@/shared/shadcn-ui/textarea";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function WorkspaceIssues() {
  const { workspace, logAuditEvent, protocol, createIssue, addCommentToIssue } = useWorkspace();
  const { state: authState } = useAuth();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: "", type: "technical" as const, priority: "high" as const });
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

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="w-4 h-4 text-amber-500" />;
      case 'technical': return <PenTool className="w-4 h-4 text-primary" />;
      default: return <AlertCircle className="w-4 h-4 text-accent" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-accent" /> B-Track: Anomaly & Conflict Governance
          </h3>
          <Badge variant="outline" className="text-[8px] h-4 border-accent/20 bg-accent/5 text-accent">
            PROTOCOL: {protocol || "STANDARD"}
          </Badge>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-2 font-bold uppercase text-[9px] border-accent/20 text-accent" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-3 h-3" /> Submit Issue
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {issues?.map(issue => (
          <div key={issue.id} className="p-4 bg-card/40 border-l-4 border-l-accent border border-border/60 rounded-r-2xl flex items-center justify-between cursor-pointer hover:bg-muted/30" onClick={() => setSelectedIssue(issue)}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                {getIssueIcon(issue.type)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{issue.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[8px] border-accent/20 text-accent uppercase">{issue.type}</Badge>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Status: {issue.issueState}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Sheet open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
        <SheetContent className="sm:max-w-xl flex flex-col p-0 border-l-border/60">
          {selectedIssue && (
            <>
              <SheetHeader className="p-6 border-b border-border/60 bg-muted/20">
                <SheetTitle className="text-xl font-headline">{selectedIssue.title}</SheetTitle>
                <div className="text-sm text-muted-foreground flex items-center gap-4 pt-2">
                  <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent uppercase font-bold">{selectedIssue.priority}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">Created: {selectedIssue.createdAt ? format(selectedIssue.createdAt.seconds * 1000, 'PPP') : '...'}</span>
                </div>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {(selectedIssue.comments || []).length > 0 ? (
                    selectedIssue.comments?.map(comment => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-1 border border-primary/20">{comment.author[0]}</div>
                        <div className="flex-1 p-4 rounded-2xl bg-muted/40 border border-border/40">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold">{comment.author}</span>
                            <time className="text-[10px] text-muted-foreground font-mono">{comment.createdAt ? format(comment.createdAt.seconds * 1000, 'p') : '...'}</time>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                     <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                        <MessageSquare className="w-8 h-8 opacity-20" />
                        <span className="text-xs font-bold uppercase">No discussion yet.</span>
                     </div>
                  )}
                </div>
              </ScrollArea>
              <SheetFooter className="p-4 bg-background border-t border-border/60">
                <div className="flex items-start gap-3 w-full">
                  <Textarea 
                    placeholder="Type your comment here..." 
                    className="flex-1 rounded-xl bg-muted/50 border-border/50 focus-visible:ring-accent"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button size="icon" className="h-10 w-10 rounded-xl bg-accent hover:bg-accent/90" onClick={handleAddComment} disabled={!newComment.trim()}>
                    <CornerUpLeft className="w-4 h-4" />
                  </Button>
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
