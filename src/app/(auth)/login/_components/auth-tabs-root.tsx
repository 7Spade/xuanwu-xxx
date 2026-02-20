
"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Ghost, Loader2 } from "lucide-react";
import { useI18n } from "@/shared/context/i18n-context";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";

interface AuthTabsRootProps {
  isLoading: boolean;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  handleAuth: (type: 'login' | 'register') => void;
  handleAnonymous: () => void;
  openResetDialog: () => void;
}

/**
 * AuthTabsRoot - Responsibility: Manages the main authentication card, including tabs for login/register and the anonymous access option.
 */
export function AuthTabsRoot({
  isLoading,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  handleAuth,
  handleAnonymous,
  openResetDialog,
}: AuthTabsRootProps) {
  const { t } = useI18n();

  return (
    <>
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md border-border/40 shadow-2xl bg-card/50 backdrop-blur-xl z-10 rounded-[3rem] overflow-hidden">
        <CardHeader className="pt-12 pb-6 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center relative group">
            <span className="text-6xl group-hover:scale-110 transition-transform duration-500 block cursor-default select-none">🐢</span>
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-10" />
          </div>
        </CardHeader>

        <CardContent className="px-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/30 mb-8 rounded-2xl h-12 p-1">
              <TabsTrigger value="login" className="text-[11px] uppercase font-black rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="register" className="text-[11px] uppercase font-black rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">{t('auth.register')}</TabsTrigger>
            </TabsList>

            <div className="h-[300px] flex flex-col">
              <TabsContent value="login" className="space-y-4 m-0 animate-in fade-in slide-in-from-left-2 duration-300 flex-1 flex flex-col">
                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  handleLogin={() => handleAuth('login')}
                  isLoading={isLoading}
                  onForgotPassword={openResetDialog}
                />
              </TabsContent>

              <TabsContent value="register" className="space-y-4 m-0 animate-in fade-in slide-in-from-right-2 duration-300 flex-1 flex flex-col">
                <RegisterForm
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  handleRegister={() => handleAuth('register')}
                  isLoading={isLoading}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-6 pt-10 pb-12 px-8 border-t border-border/10 bg-muted/5">
          <Button variant="ghost" className="w-full gap-3 text-muted-foreground hover:text-primary transition-all text-xs font-black uppercase py-7 rounded-2xl border border-dashed border-border/40 hover:border-primary/20" onClick={handleAnonymous} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Ghost className="w-4 h-4" />}
            {t('auth.guestAccess')}
          </Button>
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/30 font-bold uppercase tracking-[0.2em] select-none">
            <span>{t('auth.byLoggingIn')}</span>
            <span className="flex items-center gap-1.5 text-muted-foreground/50"><span className="text-xs">🐢</span> {t('auth.dimensionSecurityProtocol')}</span>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
