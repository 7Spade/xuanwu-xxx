
"use client";

import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/ui/input-group";
import { Mail, User, Lock, Loader2 } from "lucide-react";
import { useI18n } from "@/shared/context/i18n-context";

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
    <>
      <div className="space-y-2">
        <Label htmlFor="r-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('auth.digitalDesignation')}</Label>
        <InputGroup className="rounded-2xl bg-muted/20 border-none h-12">
          <InputGroupAddon className="pl-4">
            <User className="w-4 h-4 text-muted-foreground/30" />
          </InputGroupAddon>
          <InputGroupInput id="r-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.nickname')} className="font-medium" required />
        </InputGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor="r-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('auth.contactEndpoint')}</Label>
        <InputGroup className="rounded-2xl bg-muted/20 border-none h-12">
          <InputGroupAddon className="pl-4">
            <Mail className="w-4 h-4 text-muted-foreground/30" />
          </InputGroupAddon>
          <InputGroupInput id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} className="font-medium" required />
        </InputGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor="r-pass" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t('auth.setSecurityKey')}</Label>
        <InputGroup className="rounded-2xl bg-muted/20 border-none h-12">
          <InputGroupAddon className="pl-4">
            <Lock className="w-4 h-4 text-muted-foreground/30" />
          </InputGroupAddon>
          <InputGroupInput id="r-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password')} className="font-medium" required />
        </InputGroup>
      </div>
      <Button onClick={handleRegister} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-base shadow-xl shadow-primary/20 mt-auto" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : t('auth.registerSovereignty')}
      </Button>
    </>
  );
}
