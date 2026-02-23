
"use client";

import { useWorkspace } from './workspace-provider';
import { useApp } from '../_hooks/use-app';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/shadcn-ui/card";
import { Badge } from "@/shared/shadcn-ui/badge";
import { Button } from "@/shared/shadcn-ui/button";
import { 
  Box, 
  Trash2, 
  FileText, 
  ListTodo, 
  ShieldCheck, 
  Trophy, 
  AlertCircle, 
  MessageSquare, 
  Layers, 
  Plus,
  Users,
  Settings2,
  Activity,
  Landmark,
  Info,
  Calendar,
  FileScan,
  Loader2,
} from "lucide-react";
import { toast } from "@/shared/utility-hooks/use-toast";
import { useCallback, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/shadcn-ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/shadcn-ui/alert-dialog";
import { type Capability } from "@/shared/types";
import { Checkbox } from "@/shared/shadcn-ui/checkbox";
import { Label } from "@/shared/shadcn-ui/label";

// Capabilities available for personal (user-owned) workspaces.
const PERSONAL_CAPABILITY_IDS = new Set([
  'tasks',
  'files',
  'daily',
  'issues',
  'schedule',
  'document-parser',
]);

// Capabilities that belong to permanent layers (Core, Governance, Projection) and
// must never appear in the mountable-capability picker.
const NON_MOUNTABLE_CAPABILITY_IDS = new Set([
  'capabilities', // Core
  'members',      // Governance
  'audit',        // Projection
]);

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/**
 * WorkspaceCapabilities - Manages mounted "atomic capabilities" for the workspace.
 * REFACTORED: Now derives the owner type at runtime based on the workspace's `dimensionId`.
 */
export function WorkspaceCapabilities() {
  const { workspace, logAuditEvent, mountCapabilities, unmountCapability } = useWorkspace();
  const { state } = useApp();
  const { capabilitySpecs, accounts } = state;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCaps, setSelectedCaps] = useState<Set<string>>(new Set());
  const [isMounting, setIsMounting] = useState(false);
  const [pendingUnmount, setPendingUnmount] = useState<Capability | null>(null);

  const ownerType = useMemo(() => 
    accounts[workspace.dimensionId]?.accountType ?? 'user',
    [accounts, workspace.dimensionId]
  );

  const mountedCapIds = useMemo(() => 
    (workspace?.capabilities || []).map((c: Capability) => c.id),
    [workspace?.capabilities]
  );
  
  const availableSpecs = useMemo(() => {
    let specs = capabilitySpecs;
    if (ownerType === 'user') {
      specs = specs.filter(spec => PERSONAL_CAPABILITY_IDS.has(spec.id));
    }
    // Exclude capabilities from permanent layers (Core, Governance, Projection) — these are not mountable.
    return specs.filter(spec => !NON_MOUNTABLE_CAPABILITY_IDS.has(spec.id) && !mountedCapIds.includes(spec.id));
  }, [capabilitySpecs, ownerType, mountedCapIds]);


  const handleAddCapabilities = useCallback(async () => {
    const templates = capabilitySpecs.filter(spec => selectedCaps.has(spec.id));
    
    if (templates.length > 0) {
      setIsMounting(true);
      try {
        await mountCapabilities(templates);
        templates.forEach(template => {
            logAuditEvent("Mounted Capability", template.name, 'create'); 
        });
        setIsAddOpen(false);
        setSelectedCaps(new Set());
        toast({ title: `${templates.length} capabilities have been mounted` });
      } catch (error: unknown) {
        console.error("Error mounting capabilities:", error);
        toast({
          variant: "destructive",
          title: "Mounting Failed",
          description: getErrorMessage(error, "You may not have the required permissions."),
        });
      } finally {
        setIsMounting(false);
      }
    }
  }, [logAuditEvent, capabilitySpecs, selectedCaps, mountCapabilities]);


  const handleConfirmUnmount = useCallback(async () => {
    if (!pendingUnmount) return;
    try {
      await unmountCapability(pendingUnmount);
      logAuditEvent("Unmounted Capability", pendingUnmount.name, 'delete');
      toast({ title: "Capability Unmounted" });
    } catch (error: unknown) {
      console.error("Error unmounting capability:", error);
      toast({
        variant: "destructive",
        title: "Unmounting Failed",
        description: getErrorMessage(error, "You may not have the required permissions."),
      });
    } finally {
      setPendingUnmount(null);
    }
  }, [logAuditEvent, unmountCapability, pendingUnmount]);

  const toggleCapSelection = (capId: string) => {
    setSelectedCaps(prev => {
        const next = new Set(prev);
        if (next.has(capId)) {
            next.delete(capId);
        } else {
            next.add(capId);
        }
        return next;
    });
  }

  const getIcon = (id: string) => {
    switch (id) {
      case 'members': return <Users className="size-5" />;
      case 'audit': return <Activity className="size-5" />;
      case 'files': return <FileText className="size-5" />;
      case 'tasks': return <ListTodo className="size-5" />;
      case 'quality-assurance': return <ShieldCheck className="size-5" />;
      case 'acceptance': return <Trophy className="size-5" />;
      case 'finance': return <Landmark className="size-5" />;
      case 'issues': return <AlertCircle className="size-5" />;
      case 'daily': return <MessageSquare className="size-5" />;
      case 'schedule': return <Calendar className="size-5" />;
      case 'docu-import': return <FileScan className="size-5" />;
      default: return <Layers className="size-5" />;
    }
  };

  const getSpecIcon = (type: string) => {
    switch (type) {
      case 'governance': return <Users className="size-6" />;
      case 'monitoring': return <Activity className="size-6" />;
      case 'data': return <FileText className="size-6" />;
      case 'ui': return <Settings2 className="size-6" />;
      default: return <Box className="size-6" />;
    }
  };

  return (
    <div className="space-y-6 duration-300 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Box className="size-4" /> Mounted Atomic Capabilities
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="size-3.5" /> Mount New Capability
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {(workspace.capabilities || []).map((cap: Capability) => (
          <Card key={cap.id} className="group overflow-hidden border-border/60 bg-card/40 backdrop-blur-sm transition-all hover:border-primary/40">
            <CardHeader className="pb-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-primary/5 p-2.5 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  {getIcon(cap.id)}
                </div>
                <Badge variant="outline" className="bg-background px-1.5 text-[9px] font-bold uppercase">
                  {cap.status === 'stable' ? 'PRODUCTION' : 'BETA'}
                </Badge>
              </div>
              <CardTitle className="font-headline text-lg transition-colors group-hover:text-primary">{cap.name}</CardTitle>
              <CardDescription className="mt-1 text-[11px] leading-relaxed">{cap.description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex items-center justify-between border-t border-border/10 bg-muted/5 py-4">
              <span className="font-mono text-[9px] text-muted-foreground opacity-60">SPEC_ID: {cap.id.toUpperCase()}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" 
                onClick={() => setPendingUnmount(cap)}
              >
                <Trash2 className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        {(workspace.capabilities || []).length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-16 text-center">
            <div className="rounded-2xl bg-muted/40 p-4">
              <Box className="size-10 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">No capabilities mounted yet</p>
              <p className="text-[11px] text-muted-foreground">Add your first capability to start using this workspace.</p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => setIsAddOpen(true)}>
              <Plus className="size-4" /> Mount Your First Capability
            </Button>
          </div>
        )}
      </div>

      {/* Mount Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) setSelectedCaps(new Set()); setIsAddOpen(open); }}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Mount Atomic Capability</DialogTitle>
            <DialogDescription className="flex items-center gap-2 pt-2">
              <Info className="size-4 text-muted-foreground" />
              {ownerType === 'user' 
                ? "Showing core capabilities available for a Personal Workspace."
                : "Showing all available capabilities for an Organizational Workspace."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto py-4 md:grid-cols-2">
            {availableSpecs.map((cap) => (
              <Label 
                key={cap.id} 
                htmlFor={`cap-${cap.id}`}
                className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors ${
                  selectedCaps.has(cap.id) ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
              >
                <Checkbox
                  id={`cap-${cap.id}`}
                  checked={selectedCaps.has(cap.id)}
                  onCheckedChange={() => toggleCapSelection(cap.id)}
                />
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  {getSpecIcon(cap.type)}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold uppercase">{cap.name}</p>
                  <p className="mt-0.5 whitespace-normal text-[10px] leading-tight text-muted-foreground">{cap.description}</p>
                </div>
              </Label>
            ))}
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isMounting}>Cancel</Button>
              <Button onClick={handleAddCapabilities} disabled={selectedCaps.size === 0 || isMounting}>
                <span aria-live="polite" aria-busy={isMounting ? "true" : "false"}>
                  {isMounting ? (
                    <><Loader2 className="mr-2 size-4 animate-spin" /> Mounting...</>
                  ) : (
                    `Mount Selected (${selectedCaps.size})`
                  )}
                </span>
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unmount Confirmation Dialog */}
      <AlertDialog open={!!pendingUnmount} onOpenChange={(open) => !open && setPendingUnmount(null)}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Unmount Capability</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unmount <span className="font-bold text-foreground">{pendingUnmount?.name}</span>?
              The tab and all associated data will no longer be accessible from this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleConfirmUnmount}>
              Unmount
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
