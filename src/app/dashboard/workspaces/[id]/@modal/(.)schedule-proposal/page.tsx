// Intercepting route: renders ProposalDialog in the @modal slot when navigating
// to /dashboard/workspaces/[id]/schedule-proposal from within the workspace layout.
"use client"

import { ScheduleProposalContent } from "@/view-modules/workspaces/plugins/schedule/_plugin-components/schedule-proposal-content"

export default function ScheduleProposalModalPage() {
  return <ScheduleProposalContent />
}
