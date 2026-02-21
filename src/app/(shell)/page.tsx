
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/app-providers/auth-provider";
import { useI18n } from "@/shared/app-providers/i18n-provider";
import { Button } from "@/shared/shadcn-ui/button";

/**
 * Home - Responsibility: Serves as the landing page and entry point.
 */
export default function Home() {
  const { state } = useAuth();
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    if (state.user) {
      router.push("/dashboard");
    }
  }, [state.user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Button
        aria-label={t('common.enterOrgVerse')}
        variant="ghost"
        onClick={() => router.push("/login")}
        className="duration-[3000ms] size-auto animate-bounce p-0 text-7xl transition-transform hover:scale-110 hover:bg-transparent"
      >
        🐢
      </Button>
    </div>
  );
}
