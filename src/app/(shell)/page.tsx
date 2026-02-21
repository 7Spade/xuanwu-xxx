
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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Button
        aria-label={t('common.enterOrgVerse')}
        variant="ghost"
        onClick={() => router.push("/login")}
        className="text-7xl h-auto w-auto p-0 hover:bg-transparent animate-bounce duration-[3000ms] hover:scale-110 transition-transform"
      >
        🐢
      </Button>
    </div>
  );
}
