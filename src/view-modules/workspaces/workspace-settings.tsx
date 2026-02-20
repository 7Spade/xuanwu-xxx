// [職責] 空間設定對話框
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/shadcn-ui/dialog";
import { Button } from "@/shared/shadcn-ui/button";
import { Label } from "@/shared/shadcn-ui/label";
import { Input } from "@/shared/shadcn-ui/input";
import { Switch } from "@/shared/shadcn-ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/shadcn-ui/select";
import type { Workspace, WorkspaceLifecycleState, Address } from "@/domain-types/domain";

interface WorkspaceSettingsDialogProps {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: {
    name: string;
    visibility: "visible" | "hidden";
    lifecycleState: WorkspaceLifecycleState;
    address?: Address;
  }) => Promise<void>;
  loading: boolean;
}

export function WorkspaceSettingsDialog({
  workspace,
  open,
  onOpenChange,
  onSave,
  loading,
}: WorkspaceSettingsDialogProps) {
  const [name, setName] = useState(workspace.name);
  const [visibility, setVisibility] = useState(workspace.visibility);
  const [lifecycleState, setLifecycleState] = useState<WorkspaceLifecycleState>(
    workspace.lifecycleState
  );
  const [address, setAddress] = useState<Address>(workspace.address || {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    });

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setVisibility(workspace.visibility);
      setLifecycleState(workspace.lifecycleState);
      setAddress(workspace.address || { street: "", city: "", state: "", postalCode: "", country: "" });
    }
  }, [workspace]);

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave({ name, visibility, lifecycleState, address });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            Workspace Sovereignty Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60">
              Workspace Node Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60">
                Physical Address
            </Label>
            <div className="grid grid-cols-2 gap-4">
                <Input
                    placeholder="Country"
                    value={address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    className="rounded-xl h-11"
                />
                <Input
                    placeholder="State / Province"
                    value={address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="rounded-xl h-11"
                />
            </div>
            <Input
                placeholder="City"
                value={address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="rounded-xl h-11"
            />
            <Input
                placeholder="Street Address"
                value={address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="rounded-xl h-11"
            />
            <div className="grid grid-cols-2 gap-4">
                <Input
                    placeholder="Postal Code"
                    value={address.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    className="rounded-xl h-11"
                />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60">
              Current Lifecycle State
            </Label>
            <Select
              value={lifecycleState}
              onValueChange={(v: WorkspaceLifecycleState) =>
                setLifecycleState(v)
              }
            >
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preparatory">Preparatory</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="stopped">Stopped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/60">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold">Workspace Visibility</Label>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                {visibility === "visible"
                  ? "Publicly visible in dimension directory"
                  : "Hidden, visible only to authorized personnel"}
              </p>
            </div>
            <Switch
              checked={visibility === "visible"}
              onCheckedChange={(checked) =>
                setVisibility(checked ? "visible" : "hidden")
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
