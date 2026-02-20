
"use client";

import { useWorkspace } from '@/react-providers/workspace-provider';
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
  FileScan
} from "lucide-react";
import { toast } from "@/shared/utility-hooks/use-toast";
import { useCallback, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/shadcn-ui/dialog";
import { Capability } from "@/domain-types/domain";
import { useApp } from "@/react-hooks/state-hooks/use-app";
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
      }
    }
  }, [logAuditEvent, capabilitySpecs, selectedCaps, mountCapabilities]);


  const handleRemoveCapability = useCallback(async (cap: Capability) => {
    try {
      await unmountCapability(cap);
      logAuditEvent("Unmounted Capability", cap.name, 'delete');
      toast({ title: "Capability Unmounted" });
    } catch (error: unknown) {
      console.error("Error unmounting capability:", error);
      toast({
        variant: "destructive",
        title: "Unmounting Failed",
        description: getErrorMessage(error, "You may not have the required permissions."),
      });
    }
  }, [logAuditEvent, unmountCapability]);

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
      case 'members': return <Users className="w-5 h-5" />;
      case 'audit': return <Activity className="w-5 h-5" />;
      case 'files': return <FileText className="w-5 h-5" />;
      case 'tasks': return <ListTodo className="w-5 h-5" />;
      case 'qa': return <ShieldCheck className="w-5 h-5" />;
      case 'acceptance': return <Trophy className="w-5 h-5" />;
      case 'finance': return <Landmark className="w-5 h-5" />;
      case 'issues': return <AlertCircle className="w-5 h-5" />;
      case 'daily': return <MessageSquare className="w-5 h-5" />;
      case 'schedule': return <Calendar className="w-5 h-5" />;
      case 'docu-import': return <FileScan className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  const getSpecIcon = (type: string) => {
    switch (type) {
      case 'governance': return <Users className="w-6 h-6" />;
      case 'monitoring': return <Activity className="w-6 h-6" />;
      case 'data': return <FileText className="w-6 h-6" />;
      case 'ui': return <Settings2 className="w-6 h-6" />;
      default: return <Box className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Box className="w-4 h-4" /> Mounted Atomic Capabilities
        </h3>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" /> Mount New Capability
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(workspace.capabilities || []).map((cap: any) => (
          <Card key={cap.id} className="border-border/60 hover:border-primary/40 transition-all group bg-card/40 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {getIcon(cap.id)}
                </div>
                <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 bg-background">
                  {cap.status === 'stable' ? 'PRODUCTION' : 'BETA'}
                </Badge>
              </div>
              <CardTitle className="text-lg font-headline group-hover:text-primary transition-colors">{cap.name}</CardTitle>
              <CardDescription className="text-[11px] mt-1 leading-relaxed">{cap.description}</CardDescription>
            </CardHeader>
            <CardFooter className="border-t border-border/10 flex justify-between items-center py-4 bg-muted/5">
              <span className="text-[9px] font-mono text-muted-foreground opacity-60">SPEC_ID: {cap.id.toUpperCase()}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                onClick={() => handleRemoveCapability(cap)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        {(workspace.capabilities || []).length === 0 && (
          <div className="col-span-full p-20 text-center border-2 border-dashed rounded-3xl opacity-20">
            <Box className="w-12 h-12 mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">No capabilities mounted in this space</p>
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) setSelectedCaps(new Set()); setIsAddOpen(open); }}>
        <DialogContent className="rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Mount Atomic Capability</DialogTitle>
            <DialogDescription className="flex items-center gap-2 pt-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              {ownerType === 'user' 
                ? "Showing core capabilities available for a Personal Workspace."
                : "Showing all available capabilities for an Organizational Workspace."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {availableSpecs.map((cap) => (
              <Label 
                key={cap.id} 
                htmlFor={`cap-${cap.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl border hover:border-primary cursor-pointer transition-colors"
              >
                <Checkbox id={`cap-${cap.id}`} onCheckedChange={() => toggleCapSelection(cap.id)} />
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  {getSpecIcon(cap.type)}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold uppercase">{cap.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-normal leading-tight">{cap.description}</p>
                </div>
              </Label>
            ))}
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
             <Button onClick={handleAddCapabilities} disabled={selectedCaps.size === 0}>Mount Selected ({selectedCaps.size})</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
