"use client";

import { useState } from "react";
import { Button } from "@/shared/shadcn-ui/button";
import { Label } from "@/shared/shadcn-ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/shadcn-ui/input-group";
import { Mail } from "lucide-react";
import { useI18n } from "@/shared/app-providers/i18n-provider";
import { toast } from "@/shared/utility-hooks/use-toast";
import { sendPasswordResetEmail } from "../_actions";

interface ResetPasswordFormProps {
  defaultEmail?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ResetPasswordForm({ defaultEmail = "", onSuccess, onCancel }: ResetPasswordFormProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState(defaultEmail);

  const handleSend = async () => {
    if (!email) return;
    try {
      await sendPasswordResetEmail(email);
      toast({ title: t("auth.resetProtocolSent") });
      onSuccess();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast({ variant: "destructive", title: t("auth.resetFailed"), description: msg });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="reset-email"
          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60"
        >
          {t("auth.email")}
        </Label>
        <InputGroup className="h-12 rounded-2xl border-none bg-muted/20">
          <InputGroupAddon className="pl-4">
            <Mail className="size-4 text-muted-foreground/30" />
          </InputGroupAddon>
          <InputGroupInput
            id="reset-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t("auth.email")}
            className="font-medium"
            required
          />
        </InputGroup>
      </div>
      <div className="flex justify-center gap-3">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="rounded-xl px-6 text-xs font-black uppercase"
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSend}
          className="rounded-xl px-8 text-xs font-black uppercase shadow-lg shadow-primary/20"
        >
          {t("auth.sendEmail")}
        </Button>
      </div>
    </div>
  );
}
