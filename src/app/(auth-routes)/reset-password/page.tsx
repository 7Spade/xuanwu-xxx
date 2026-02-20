// [職責] Canonical full-page reset-password — shown on direct URL access to /reset-password
"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/shared/shadcn-ui/button"
import { Label } from "@/shared/shadcn-ui/label"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/shadcn-ui/input-group"
import { Mail } from "lucide-react"
import { useI18n } from "@/shared/app-providers/i18n-provider"
import { toast } from "@/shared/utility-hooks/use-toast"
import { sendPasswordResetEmail } from "@/server-commands/auth"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const [email, setEmail] = useState(searchParams.get("email") ?? "")

  const handleSend = async () => {
    if (!email) return
    try {
      await sendPasswordResetEmail(email)
      toast({ title: t("auth.resetProtocolSent") })
      router.push("/login")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      toast({ variant: "destructive", title: t("auth.resetFailed"), description: msg })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🐢</div>
          <h1 className="font-headline text-2xl font-bold">{t("auth.resetPassword")}</h1>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            {t("auth.email")}
          </Label>
          <InputGroup className="rounded-2xl bg-muted/20 border-none h-12">
            <InputGroupAddon className="pl-4">
              <Mail className="w-4 h-4 text-muted-foreground/30" />
            </InputGroupAddon>
            <InputGroupInput
              id="reset-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t("auth.email")}
              className="font-medium"
              required
            />
          </InputGroup>
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/login")}
            className="rounded-xl font-black text-xs uppercase px-6"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSend}
            className="rounded-xl font-black text-xs uppercase px-8 shadow-lg shadow-primary/20"
          >
            {t("auth.sendEmail")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  )
}
