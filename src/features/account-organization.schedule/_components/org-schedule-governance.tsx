'use client';

/**
 * account-organization.schedule — _components/org-schedule-governance.tsx
 *
 * Org HR governance panel for reviewing and acting on pending OrgScheduleProposals.
 *
 * Per logic-overview.v3.md:
 *   ORGANIZATION_SCHEDULE — org governance reads pending proposals and assigns members.
 *   Invariant #14: skill validation via projection.org-eligible-member-view happens inside
 *     approveOrgScheduleProposal (not in this component).
 *   Invariant A5: ScheduleAssignRejected is published by approveOrgScheduleProposal when
 *     skill validation fails.
 */

import { useState, useCallback, useMemo } from 'react';
import { useApp } from '@/shared/app-providers/app-context';
import { usePendingScheduleProposals } from '../_hooks/use-org-schedule';
import { approveOrgScheduleProposal, cancelOrgScheduleProposal } from '../_schedule';
import { toast } from '@/shared/utility-hooks/use-toast';
import type { OrgScheduleProposal } from '../_schedule';
import type { SkillRequirement } from '@/shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/shadcn-ui/card';
import { ScrollArea } from '@/shared/shadcn-ui/scroll-area';
import { Button } from '@/shared/shadcn-ui/button';
import { Badge } from '@/shared/shadcn-ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/shadcn-ui/select';
import { CheckCircle, XCircle, Users } from 'lucide-react';

interface ProposalRowProps {
  proposal: OrgScheduleProposal;
  orgMembers: Array<{ id: string; name: string }>;
  approvedBy: string;
  onApproved: () => void;
  onCancelled: () => void;
}

function ProposalRow({
  proposal,
  orgMembers,
  approvedBy,
  onApproved,
  onCancelled,
}: ProposalRowProps) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = useCallback(async () => {
    if (!selectedMemberId) return;
    setLoading(true);
    try {
      const result = await approveOrgScheduleProposal(
        proposal.scheduleItemId,
        selectedMemberId,
        approvedBy,
        {
          workspaceId: proposal.workspaceId,
          orgId: proposal.orgId,
          title: proposal.title,
          startDate: proposal.startDate,
          endDate: proposal.endDate,
        },
        proposal.skillRequirements
      );
      if (result.outcome === 'confirmed') {
        toast({ title: '排程已指派', description: `「${proposal.title}」成員指派成功。` });
        onApproved();
      } else {
        toast({
          variant: 'destructive',
          title: '指派失敗',
          description: result.reason,
        });
      }
    } catch {
      toast({ variant: 'destructive', title: '操作失敗', description: '請稍後再試。' });
    } finally {
      setLoading(false);
    }
  }, [selectedMemberId, proposal, approvedBy, onApproved]);

  const handleCancel = useCallback(async () => {
    setLoading(true);
    try {
      await cancelOrgScheduleProposal(proposal.scheduleItemId);
      toast({ title: '提案已取消', description: `「${proposal.title}」已由 HR 撤回。` });
      onCancelled();
    } catch {
      toast({ variant: 'destructive', title: '操作失敗', description: '請稍後再試。' });
    } finally {
      setLoading(false);
    }
  }, [proposal.scheduleItemId, proposal.title, onCancelled]);

  return (
    <div className="space-y-3 rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{proposal.title}</p>
          <p className="text-xs text-muted-foreground">
            {proposal.startDate} – {proposal.endDate}
          </p>
          <p className="text-xs text-muted-foreground">提案人：{proposal.proposedBy}</p>
        </div>
        <Badge variant="outline" className="shrink-0 text-[9px] uppercase tracking-widest">
          待指派
        </Badge>
      </div>

      {proposal.skillRequirements && proposal.skillRequirements.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {proposal.skillRequirements.map((req: SkillRequirement) => (
            <Badge key={req.tagSlug} variant="secondary" className="text-[10px]">
              {req.tagSlug} ≥ {req.minimumTier} × {req.quantity}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
          <SelectTrigger className="h-8 flex-1 text-xs">
            <Users className="mr-1 size-3 shrink-0 text-muted-foreground" />
            <SelectValue placeholder="選擇指派成員" />
          </SelectTrigger>
          <SelectContent>
            {orgMembers.map((m: { id: string; name: string }) => (
              <SelectItem key={m.id} value={m.id} className="text-xs">
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 shrink-0 text-green-600 hover:text-green-700"
          disabled={!selectedMemberId || loading}
          onClick={handleApprove}
          title="核准指派"
        >
          <CheckCircle className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-8 shrink-0 text-destructive hover:text-destructive/80"
          disabled={loading}
          onClick={handleCancel}
          title="取消提案"
        >
          <XCircle className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Org HR governance panel.
 * Reads pending OrgScheduleProposals and allows HR to assign members or cancel proposals.
 * Only visible/useful when the active account is an organization.
 */
export function OrgScheduleGovernance() {
  const { state: appState } = useApp();
  const { activeAccount, accounts } = appState;

  const orgId = activeAccount?.accountType === 'organization' ? activeAccount.id : null;
  const { proposals, loading } = usePendingScheduleProposals(orgId);

  const orgMembers = useMemo(() => {
    if (!orgId) return [];
    const org = accounts[orgId];
    return (org?.members ?? []).map((m: { id: string; name: string }) => ({ id: m.id, name: m.name }));
  }, [orgId, accounts]);

  const assignedBy = activeAccount?.id ?? 'system';

  // Re-fetch is handled automatically by the real-time subscription in usePendingScheduleProposals.
  const handleChange = useCallback(() => {
    // No-op: the onSnapshot subscription in usePendingScheduleProposals will
    // automatically update the proposals list after Firestore writes complete.
  }, []);

  if (!orgId) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        組織層級的 HR 排程僅在組織帳號下可用。
      </p>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="border-b">
        <CardTitle className="text-sm font-bold uppercase tracking-widest">
          HR 排程治理 — 待核准提案 ({proposals.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="space-y-3 p-4">
            {loading && (
              <p className="py-8 text-center text-xs italic text-muted-foreground">載入中…</p>
            )}
            {!loading && proposals.length === 0 && (
              <p className="py-8 text-center text-xs italic text-muted-foreground">
                目前無待核准提案。
              </p>
            )}
            {proposals.map((proposal: OrgScheduleProposal) => (
              <ProposalRow
                key={proposal.scheduleItemId}
                proposal={proposal}
                orgMembers={orgMembers}
                approvedBy={assignedBy}
                onApproved={handleChange}
                onCancelled={handleChange}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
