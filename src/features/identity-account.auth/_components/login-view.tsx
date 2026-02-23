// [職責] Wave 3 — Auth login page view (client island)
// Extracted from app/(auth)/login/page.tsx to follow the features/ view pattern.
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/shared/utility-hooks/use-toast"
import { completeRegistration , signIn, signInAnonymously } from "../_actions"
import { useI18n } from "@/shared/app-providers/i18n-provider"
import { AuthBackground } from "./auth-background"
import { AuthTabsRoot } from "./auth-tabs-root"

/**
 * LoginView — The "smart" auth container.
 * Manages all auth state and delegates rendering to _components/.
 * Reset password is handled by @modal/(.)reset-password intercepting route.
 * app/(auth)/login/page.tsx is now a thin RSC wrapper that renders this.
 */
export function LoginView() {
  const router = useRouter()
  const { t } = useI18n()

  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleAuth = async (type: "login" | "register") => {
    setIsLoading(true)
    try {
      if (type === "login") {
        await signIn(email, password)
      } else {
        if (!name) throw new Error(t("auth.pleaseSetDisplayName"))
        await completeRegistration(email, password, name)
      }
      toast({ title: t("auth.identityResonanceSuccessful") })
      router.push("/dashboard")
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An unknown error occurred."
      toast({ variant: "destructive", title: t("auth.authenticationFailed"), description: message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnonymous = async () => {
    setIsLoading(true)
    try {
      await signInAnonymously()
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
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
        openResetDialog={() =>
          router.push(`/reset-password${email ? `?email=${encodeURIComponent(email)}` : ""}`)
        }
      />
    </div>
  )
}
