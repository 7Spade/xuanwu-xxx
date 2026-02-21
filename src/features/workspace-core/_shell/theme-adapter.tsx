
"use client";

import { useEffect, useState, useRef } from "react";
import { useApp } from "@/features/workspace-core";
import { hexToHsl } from "@/shared/lib";
import { Skeleton } from "@/shared/shadcn-ui/skeleton";

interface ThemeAdapterProps {
    children: React.ReactNode;
}

export function ThemeAdapter({ children }: ThemeAdapterProps) {
  const { state: appState } = useApp();
  const { accounts, activeAccount } = appState;

  const activeOrg = activeAccount?.accountType === 'organization' ? accounts[activeAccount.id] : null;

  const [isAdapting, setIsAdapting] = useState(false);
  const adaptingId = useRef<string | null>(null);

  useEffect(() => {
    async function adaptTheme() {
      if (!activeOrg || activeOrg.theme || adaptingId.current === activeOrg.id) return;

      adaptingId.current = activeOrg.id;
      setIsAdapting(true);
      
      try {
        // This is a placeholder for a real AI call.
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Theme adaptation failed:", error);
      } finally {
        setIsAdapting(false);
        adaptingId.current = null;
      }
    }

    adaptTheme();
  }, [activeAccount, activeOrg]);

  useEffect(() => {
    const root = document.documentElement;
    if (activeOrg?.theme) {
      root.style.setProperty('--primary', hexToHsl(activeOrg.theme.primary));
      root.style.setProperty('--background', hexToHsl(activeOrg.theme.background));
      root.style.setProperty('--accent', hexToHsl(activeOrg.theme.accent));
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--background');
      root.style.removeProperty('--accent');
    }
  }, [activeOrg?.theme]);
  
  if (isAdapting) {
    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
            <Skeleton className="h-14 w-[300px] rounded-2xl" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Skeleton className="h-[160px] w-full rounded-2xl" />
                <Skeleton className="h-[160px] w-full rounded-2xl" />
                <Skeleton className="h-[160px] w-full rounded-2xl" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    );
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
