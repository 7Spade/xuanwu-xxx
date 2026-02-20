"use client"

import { ReactNode } from "react"
import { UserSettings } from "@/app/dashboard/_components/settings"
import { useI18n } from "@/shared/context/i18n-context"


interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  badge?: ReactNode
}

function PageHeader({ title, description, children, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="space-y-1">
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className="text-4xl font-bold tracking-tight font-headline">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  )
}

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
