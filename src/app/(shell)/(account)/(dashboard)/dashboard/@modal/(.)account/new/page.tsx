// [職責] Intercepting route — renders AccountNewForm as Dialog overlay from within dashboard
// Client nav: modal overlay; direct URL: falls through to dashboard/account/new/page.tsx
"use client"

import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/shadcn-ui/dialog"
import { useI18n } from "@/shared/app-providers/i18n-provider"
import { AccountNewForm } from "@/features/account-organization.core"

export default function AccountNewModalPage() {
  const router = useRouter()
  const { t } = useI18n()

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {t("dimension.createTitle")}
          </DialogTitle>
          <DialogDescription>{t("dimension.createDescription")}</DialogDescription>
        </DialogHeader>
        <AccountNewForm
          onSuccess={() => router.back()}
          onCancel={() => router.back()}
        />
      </DialogContent>
    </Dialog>
  )
}
