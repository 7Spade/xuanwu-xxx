// [職責] Intercepting route — renders ResetPasswordDialog as overlay from within login page
// Client nav: modal overlay; direct URL: falls through to (auth)/reset-password/page.tsx
"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/shadcn-ui/dialog"
import { Button } from "@/shared/shadcn-ui/button"
import { Label } from "@/shared/shadcn-ui/label"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/shadcn-ui/input-group"
import { Mail } from "lucide-react"
import { useI18n } from "@/shared/app-providers/i18n-provider"
import { toast } from "@/shared/utility-hooks/use-toast"
import { sendPasswordResetEmail } from "@/server-commands/auth"

function ResetPasswordModalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const [email, setEmail] = useState(searchParams.get("email") ?? "")

  const handleSend = async () => {
    if (!email) return
    try {
      await sendPasswordResetEmail(email)
      router.back()
      toast({ title: t("auth.resetProtocolSent") })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      toast({ variant: "destructive", title: t("auth.resetFailed"), description: msg })
    }
  }

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-3">
            🐢 {t("auth.resetPassword")}
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="space-y-2">
            <Label
              htmlFor="reset-email"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60"
            >
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
        </div>
        <DialogFooter className="sm:justify-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ResetPasswordModalPage() {
  return (
    <Suspense>
      <ResetPasswordModalContent />
    </Suspense>
  )
}
