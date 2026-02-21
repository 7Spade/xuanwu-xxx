
/**
 * Account Layout — Shared account context for all authenticated routes.
 *
 * Responsibility: Provides AccountProvider to both (dashboard) and (workspace) groups.
 * Auth guard and SidebarProvider live in the parent (shell)/layout.tsx.
 *
 * This layout is transparent (no visual structure) — it only injects data context.
 */

import type { ReactNode } from "react";
import { AccountProvider } from "@/features/account";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountProvider>{children}</AccountProvider>;
}
