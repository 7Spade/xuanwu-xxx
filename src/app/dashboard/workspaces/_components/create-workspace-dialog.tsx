// [職責] 建立空間的彈窗 UI
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { handleCreateWorkspace } from "../_lib/workspace-actions";
import { useApp } from "@/hooks/state/use-app";
import { useI18n } from "@/context/i18n-context";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const {
    state: { activeAccount },
  } = useApp();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    setLoading(true);
    await handleCreateWorkspace(name, activeAccount, () => {
      setName("");
      onOpenChange(false);
    }, t);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {t("workspaces.createLogicalSpace")}
          </DialogTitle>
          <DialogDescription>
            {t("workspaces.createDescription").replace(
              "{name}",
              activeAccount?.name || ""
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">{t("workspaces.spaceName")}</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("workspaces.spaceNamePlaceholder")}
              className="rounded-xl h-11"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onCreate} className="rounded-xl shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? t('common.creating') : t("common.confirmCreation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
