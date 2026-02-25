// [職責] Org HR governance — review and assign pending OrgScheduleProposals
// Renders the account-organization.schedule governance panel.
// This route is only meaningful for organization accounts.
import { OrgScheduleGovernance } from '@/features/account-organization.schedule';

export default function OrgSchedulePage() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight">HR 排程治理</h1>
        <p className="text-sm text-muted-foreground">
          審核跨層提案並指派合適成員（技能驗證由系統自動執行）。
        </p>
      </div>
      <OrgScheduleGovernance />
    </div>
  );
}
