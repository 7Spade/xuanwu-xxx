
"use client";

import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/app/_components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/app/_components/ui/input-group";
import { Mail } from "lucide-react";
import { useI18n } from "@/context/i18n-context";

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
      <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-sm">
        <DialogHeader><DialogTitle className="font-headline text-2xl flex items-center gap-3">🐢 {t('auth.resetPassword')}</DialogTitle></DialogHeader>
        <div className="py-6">
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('auth.email')}</Label>
            <InputGroup className="rounded-2xl bg-muted/20 border-none h-12">
              <InputGroupAddon className="pl-4">
                <Mail className="w-4 h-4 text-muted-foreground/30" />
              </InputGroupAddon>
              <InputGroupInput id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} className="font-medium" required />
            </InputGroup>
          </div>
        </div>
        <DialogFooter className="sm:justify-center gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-black text-xs uppercase px-6">{t('common.cancel')}</Button>
          <Button onClick={handleSendResetEmail} className="rounded-xl font-black text-xs uppercase px-8 shadow-lg shadow-primary/20">{t('auth.sendEmail')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
