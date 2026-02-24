'use client';

/**
 * account-organization.schedule — _hooks/use-org-schedule.ts
 *
 * React hook for subscribing to org schedule proposals.
 * Used by the org governance UI to display and act on pending proposals.
 *
 * Per logic-overview.v3.md:
 *   ORGANIZATION_SCHEDULE → (org governance reads pending proposals via this hook)
 */

import { useState, useEffect } from 'react';
import { subscribeToOrgScheduleProposals, subscribeToPendingProposals } from '../_queries';
import type { OrgScheduleProposal, OrgScheduleStatus } from '../_schedule';

/**
 * Subscribes to all org schedule proposals for the given orgId.
 * Optionally filter to a specific status.
 */
export function useOrgSchedule(
  orgId: string | null,
  opts?: { status?: OrgScheduleStatus }
) {
  const [proposals, setProposals] = useState<OrgScheduleProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const status = opts?.status;

  useEffect(() => {
    if (!orgId) {
      setProposals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToOrgScheduleProposals(orgId, (updated) => {
      setProposals(updated);
      setLoading(false);
    }, status ? { status } : undefined);

    return unsub;
  }, [orgId, status]);

  return { proposals, loading };
}

/**
 * Convenience hook that only returns pending proposals (status = 'proposed').
 * Used by the approval workflow in the org governance UI.
 */
export function usePendingScheduleProposals(orgId: string | null) {
  const [proposals, setProposals] = useState<OrgScheduleProposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) {
      setProposals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToPendingProposals(orgId, (updated) => {
      setProposals(updated);
      setLoading(false);
    });

    return unsub;
  }, [orgId]);

  return { proposals, loading };
}
