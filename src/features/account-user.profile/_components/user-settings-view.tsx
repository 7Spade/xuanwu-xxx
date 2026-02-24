"use client"

import { UserSettings } from "./user-settings"
import { useI18n } from "@/shared/app-providers/i18n-provider"
import { PageHeader } from "@/shared/ui/page-header"

export function UserSettingsView() {
  const { t } = useI18n()

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12 duration-500 animate-in fade-in">
      <PageHeader 
        title={t('settings.userSettingsTitle')}
        description={t('settings.userSettingsDescription')}
      />
      <UserSettings />
    </div>
  )
}
