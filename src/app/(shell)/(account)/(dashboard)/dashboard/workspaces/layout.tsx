// [職責] Workspaces layout — provides @modal slot for dialog interception
import type { ReactNode } from "react"

export default function WorkspacesLayout({
  children,
  modal,
}: {
  children: ReactNode
  modal: ReactNode
}) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
