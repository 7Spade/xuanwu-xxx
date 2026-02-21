
"use client";

import { Button } from "@/shared/shadcn-ui/button";
import { Label } from "@/shared/shadcn-ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/shadcn-ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/shadcn-ui/input-group";
import { Mail } from "lucide-react";
import { useI18n } from "@/shared/app-providers/i18n-provider";

interface ResetPasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  setEmail: (value: string) => void;
  handleSendResetEmail: () => void;
}

/**
 * ResetPasswordDialog - Responsibility: Encapsulates the UI and logic for the password reset modal.
 */
export function ResetPasswordDialog({
  isOpen,
  onOpenChange,
  email,
  setEmail,
  handleSendResetEmail
}: ResetPasswordDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-[2.5rem] border-none p-10 shadow-2xl">
        <DialogHeader><DialogTitle className="flex items-center gap-3 font-headline text-2xl">🐢 {t('auth.resetPassword')}</DialogTitle></DialogHeader>
        <div className="py-6">
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('auth.email')}</Label>
            <InputGroup className="h-12 rounded-2xl border-none bg-muted/20">
              <InputGroupAddon className="pl-4">
                <Mail className="size-4 text-muted-foreground/30" />
              </InputGroupAddon>
              <InputGroupInput id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} className="font-medium" required />
            </InputGroup>
          </div>
        </div>
        <DialogFooter className="gap-3 sm:justify-center">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl px-6 text-xs font-black uppercase">{t('common.cancel')}</Button>
          <Button onClick={handleSendResetEmail} className="rounded-xl px-8 text-xs font-black uppercase shadow-lg shadow-primary/20">{t('auth.sendEmail')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
