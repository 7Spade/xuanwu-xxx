// [職責] Intercepting route — renders ResetPasswordForm as Dialog overlay from within login page
// Client nav: modal overlay; direct URL: falls through to (auth)/reset-password/page.tsx
"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/shadcn-ui/dialog"
import { useI18n } from "@/shared/app-providers/i18n-provider"
import { ResetPasswordForm } from "@/features/identity-account.auth"

function ResetPasswordModalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="max-w-sm rounded-[2.5rem] border-none p-10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-headline text-2xl">
            🐢 {t("auth.resetPassword")}
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <ResetPasswordForm
            defaultEmail={searchParams.get("email") ?? ""}
            onSuccess={() => router.back()}
            onCancel={() => router.back()}
          />
        </div>
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
