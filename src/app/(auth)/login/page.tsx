
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/ui/use-toast";
import { authAdapter } from "@/infra/firebase/auth/auth.adapter";
import { useI18n } from "@/context/i18n-context";
import { AuthBackground } from "./_components/auth-background";
import { AuthTabsRoot } from "./_components/auth-tabs-root";
import { ResetPasswordDialog } from "./_components/reset-password-dialog";

/**
 * LoginPage - Digital Sovereignty Gateway (Container Component)
 *
 * Responsibility: This is the main "smart" component for the login page.
 * It manages all state and business logic, and then delegates rendering
 * to "dumb" child components.
 */
export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();

  // State management for all auth-related forms
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Business logic for authentication actions
  const handleAuth = async (type: 'login' | 'register') => {
    setIsLoading(true);
    try {
      if (type === 'login') {
        await authAdapter.signInWithEmailAndPassword(email, password);
      } else {
        if (!name) throw new Error(t('auth.pleaseSetDisplayName'));
        const { user: u } = await authAdapter.createUserWithEmailAndPassword(email, password);
        await authAdapter.updateProfile(u, { displayName: name });
      }
      toast({ title: t('auth.identityResonanceSuccessful') });
      router.push("/dashboard");
    } catch (e: any) {
      toast({ variant: "destructive", title: t('auth.authenticationFailed'), description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await authAdapter.signInAnonymously();
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!resetEmail) return;
    try {
      await authAdapter.sendPasswordResetEmail(resetEmail);
      setIsResetOpen(false);
      toast({ title: t('auth.resetProtocolSent') });
    } catch (e: any) {
      toast({ variant: "destructive", title: t('auth.resetFailed'), description: e.message });
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background px-4 overflow-hidden">
      <AuthBackground />
      <AuthTabsRoot
        isLoading={isLoading}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        name={name}
        setName={setName}
        handleAuth={handleAuth}
        handleAnonymous={handleAnonymous}
        openResetDialog={() => {
          setResetEmail(email); // Pre-fill with current email
          setIsResetOpen(true);
        }}
      />
      <ResetPasswordDialog
        isOpen={isResetOpen}
        onOpenChange={setIsResetOpen}
        email={resetEmail}
        setEmail={setResetEmail}
        handleSendResetEmail={handleSendResetEmail}
      />
    </div>
  );
}
