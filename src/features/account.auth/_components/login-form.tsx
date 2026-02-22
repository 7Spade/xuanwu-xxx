
"use client";

import { Button } from "@/shared/shadcn-ui/button";
import { Label } from "@/shared/shadcn-ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/shadcn-ui/input-group";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useI18n } from "@/shared/app-providers/i18n-provider";

interface LoginFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  handleLogin: () => void;
  isLoading: boolean;
  onForgotPassword: () => void;
}

/**
 * LoginForm - Responsibility: Renders the input fields and button for user login.
 */
export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  isLoading,
  onForgotPassword,
}: LoginFormProps) {
  const { t } = useI18n();

  return (
    <form className="flex flex-1 flex-col space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <Label htmlFor="l-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('auth.contactEndpoint')}</Label>
        </div>
        <InputGroup className="h-12 rounded-2xl border-none bg-muted/20">
          <InputGroupAddon className="pl-4">
            <Mail className="size-4 text-muted-foreground/30" />
          </InputGroupAddon>
          <InputGroupInput id="l-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} className="font-medium" required />
        </InputGroup>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <Label htmlFor="l-pass" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('auth.securityKey')}</Label>
          <Button variant="ghost" size="sm" type="button" onClick={onForgotPassword} className="h-auto p-0 text-[10px] font-black uppercase text-primary/60 transition-colors hover:bg-transparent hover:text-primary">{t('auth.forgotPassword')}</Button>
        </div>
        <InputGroup className="h-12 rounded-2xl border-none bg-muted/20">
          <InputGroupAddon className="pl-4">
            <Lock className="size-4 text-muted-foreground/30" />
          </InputGroupAddon>
          <InputGroupInput id="l-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password')} className="font-medium" required />
        </InputGroup>
      </div>
      <div className="h-[80px]" /> {/* Spacer */}
      <Button type="submit" className="mt-auto h-14 w-full rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : t('auth.enterDimension')}
      </Button>
    </form>
  );
}
