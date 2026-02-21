// Canonical route: full-page schedule proposal form for direct URL access.
// When navigated to within the workspace layout, the @modal slot intercepts.
"use client"

import { ScheduleProposalContent } from "@/view-modules/workspaces/plugins/schedule/_plugin-components/schedule-proposal-content"

export default function ScheduleProposalPage() {
  return <ScheduleProposalContent fullPage />
}
