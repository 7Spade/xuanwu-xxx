
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/context/auth-context";
import { useI18n } from "@/shared/context/i18n-context";

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
      <button
        aria-label={t('common.enterOrgVerse')}
        onClick={() => router.push("/login")}
        className="text-7xl animate-bounce duration-[3000ms] hover:scale-110 transition-transform"
      >
        🐢
      </button>
    </div>
  );
}
