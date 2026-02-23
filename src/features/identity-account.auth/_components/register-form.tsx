
"use client";

import { Button } from "@/shared/shadcn-ui/button";
import { Label } from "@/shared/shadcn-ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/shadcn-ui/input-group";
import { Mail, User, Lock, Loader2 } from "lucide-react";
import { useI18n } from "@/shared/app-providers/i18n-provider";

interface RegisterFormProps {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  handleRegister: () => void;
  isLoading: boolean;
}

/**
 * RegisterForm - Responsibility: Renders the input fields and button for user registration.
 */
export function RegisterForm({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  handleRegister,
  isLoading,
}: RegisterFormProps) {
  const { t } = useI18n();

  return (
    <form className="flex flex-1 flex-col space-y-4" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
      <div className="space-y-2">
        <Label htmlFor="r-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('auth.digitalDesignation')}</Label>
        <InputGroup className="h-12 rounded-2xl border-none bg-muted/20">
          <InputGroupAddon className="pl-4">
            <User className="size-4 text-muted-foreground/30" />
          </InputGroupAddon>
          <InputGroupInput id="r-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.nickname')} className="font-medium" required />
        </InputGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor="r-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('auth.contactEndpoint')}</Label>
        <InputGroup className="h-12 rounded-2xl border-none bg-muted/20">
          <InputGroupAddon className="pl-4">
            <Mail className="size-4 text-muted-foreground/30" />
          </InputGroupAddon>
          <InputGroupInput id="r-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} className="font-medium" required />
        </InputGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor="r-pass" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('auth.setSecurityKey')}</Label>
        <InputGroup className="h-12 rounded-2xl border-none bg-muted/20">
          <InputGroupAddon className="pl-4">
            <Lock className="size-4 text-muted-foreground/30" />
          </InputGroupAddon>
          <InputGroupInput id="r-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password')} className="font-medium" required />
        </InputGroup>
      </div>
      <Button type="submit" className="mt-auto h-14 w-full rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : t('auth.registerSovereignty')}
      </Button>
    </form>
  );
}
