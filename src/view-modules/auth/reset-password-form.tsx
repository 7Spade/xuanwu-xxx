"use client";

import { useState } from "react";
import { Button } from "@/shared/shadcn-ui/button";
import { Label } from "@/shared/shadcn-ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/shadcn-ui/input-group";
import { Mail } from "lucide-react";
import { useI18n } from "@/shared/app-providers/i18n-provider";
import { toast } from "@/shared/utility-hooks/use-toast";
import { sendPasswordResetEmail } from "@/server-commands/auth";

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
        <InputGroup className="rounded-2xl bg-muted/20 border-none h-12">
          <InputGroupAddon className="pl-4">
            <Mail className="w-4 h-4 text-muted-foreground/30" />
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
      <div className="flex gap-3 justify-center">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="rounded-xl font-black text-xs uppercase px-6"
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSend}
          className="rounded-xl font-black text-xs uppercase px-8 shadow-lg shadow-primary/20"
        >
          {t("auth.sendEmail")}
        </Button>
      </div>
    </div>
  );
}
