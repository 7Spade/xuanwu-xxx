
/**
 * Account Layout — Pass-through layout for (dashboard) and (workspaces) route groups.
 *
 * AccountProvider is provided by the parent (shell)/layout.tsx so that it wraps
 * both the @sidebar slot and the page children. This layout is intentionally
 * transparent — it exists only to group routes under the (account) segment.
 */

import type { ReactNode } from "react";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
