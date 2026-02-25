"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/shadcn-ui/button";
import { Label } from "@/shared/shadcn-ui/label";
import { Input } from "@/shared/shadcn-ui/input";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/shared/app-providers/i18n-provider";
import { toast } from "@/shared/utility-hooks/use-toast";
import { useOrganizationManagement } from "../_hooks/use-organization-management";
import { useApp } from "@/shared/app-providers/app-context";

interface AccountNewFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AccountNewForm({ onSuccess, onCancel }: AccountNewFormProps) {
  const { t } = useI18n();
  const { createOrganization } = useOrganizationManagement();
  const { state: appState, dispatch } = useApp();
  const { accounts } = appState;

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingOrganizationId, setPendingOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    if (pendingOrganizationId && accounts[pendingOrganizationId]) {
      const organization = accounts[pendingOrganizationId];
      dispatch({ type: "SET_ACTIVE_ACCOUNT", payload: { ...organization, accountType: "organization" } });
      setPendingOrganizationId(null);
      onSuccess();
    }
  }, [pendingOrganizationId, accounts, dispatch, onSuccess]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      const newOrganizationId = await createOrganization(name.trim());
      setPendingOrganizationId(newOrganizationId);
      toast({ title: t("dimension.newDimensionCreated") });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast({ variant: "destructive", title: t("dimension.failedToCreate"), description: msg });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {t("dimension.dimensionName")}
        </Label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleCreate()}
          placeholder={t("dimension.dimensionNamePlaceholder")}
          className="h-12 rounded-xl"
        />
      </div>
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="rounded-xl"
          disabled={isLoading}
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleCreate}
          className="rounded-xl px-8 shadow-lg shadow-primary/20"
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {t("common.creating")}
            </>
          ) : (
            t("dimension.createDimension")
          )}
        </Button>
      </div>
    </div>
  );
}
