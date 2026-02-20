"use client"

import { UserSettings } from "./user-settings"
import { useI18n } from "@/shared/app-providers/i18n-provider"
import { PageHeader } from "@/shared/shadcn-ui/page-header"

export function UserSettingsView() {
  const { t } = useI18n()

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      <PageHeader 
        title={t('settings.userSettingsTitle')}
        description={t('settings.userSettingsDescription')}
      />
      <UserSettings />
    </div>
  )
}
