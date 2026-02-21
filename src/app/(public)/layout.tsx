// [職責] Auth layout — provides @modal slot for dialog interception (reset-password)
import type { ReactNode } from "react"

export default function AuthLayout({
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
