// [職責] Workspaces layout — SidebarInset frame + @modal slot for the /workspaces/** URL space.
// SidebarProvider lives in the parent (shell)/layout.tsx. This layout provides the content inset.
import type { ReactNode } from "react"
import { SidebarInset } from "@/shared/shadcn-ui/sidebar"
import { ThemeAdapter } from "@/features/workspace-core"

export default function WorkspacesLayout({
  children,
  modal,
}: {
  children: ReactNode
  modal: ReactNode
}) {
  return (
    <SidebarInset>
      <ThemeAdapter>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </ThemeAdapter>
      {modal}
    </SidebarInset>
  )
}
