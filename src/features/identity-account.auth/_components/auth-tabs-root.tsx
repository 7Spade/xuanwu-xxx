
"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/shared/shadcn-ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn-ui/tabs";
import { Button } from "@/shared/shadcn-ui/button";
import { Ghost, Loader2 } from "lucide-react";
import { useI18n } from "@/shared/app-providers/i18n-provider";
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
      <div className="absolute right-4 top-4 z-20">
        <LanguageSwitcher />
      </div>
      <Card className="z-10 w-full max-w-md overflow-hidden rounded-[3rem] border-border/40 bg-card/50 shadow-2xl backdrop-blur-xl">
        <CardHeader className="flex flex-col items-center pb-6 pt-12">
          <div className="group relative flex size-28 items-center justify-center rounded-full border border-primary/10 bg-primary/5">
            <span className="block cursor-default select-none text-6xl transition-transform duration-500 group-hover:scale-110">🐢</span>
            <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary/20 opacity-10" />
          </div>
        </CardHeader>

        <CardContent className="px-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="mb-8 grid h-12 w-full grid-cols-2 rounded-2xl bg-muted/30 p-1">
              <TabsTrigger value="login" className="rounded-xl text-[11px] font-black uppercase transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl text-[11px] font-black uppercase transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('auth.register')}</TabsTrigger>
            </TabsList>

            <div className="flex h-[300px] flex-col">
              <TabsContent value="login" className="m-0 flex flex-1 flex-col space-y-4 duration-300 animate-in fade-in slide-in-from-left-2">
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

              <TabsContent value="register" className="m-0 flex flex-1 flex-col space-y-4 duration-300 animate-in fade-in slide-in-from-right-2">
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

        <CardFooter className="flex flex-col gap-6 border-t border-border/10 bg-muted/5 px-8 pb-12 pt-10">
          <Button variant="ghost" className="w-full gap-3 rounded-2xl border border-dashed border-border/40 py-7 text-xs font-black uppercase text-muted-foreground transition-all hover:border-primary/20 hover:text-primary" onClick={handleAnonymous} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Ghost className="size-4" />}
            {t('auth.guestAccess')}
          </Button>
          <div className="flex select-none items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
            <span>{t('auth.byLoggingIn')}</span>
            <span className="flex items-center gap-1.5 text-muted-foreground/50"><span className="text-xs">🐢</span> {t('auth.dimensionSecurityProtocol')}</span>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
