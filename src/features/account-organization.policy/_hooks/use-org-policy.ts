'use client';

/**
 * account-organization.policy — _hooks/use-org-policy.ts
 *
 * React hook for subscribing to organization policies.
 */

import { useState, useEffect } from 'react';
import { subscribeToOrgPolicies } from '../_queries';
import type { OrgPolicy } from '../_actions';

export function useOrgPolicy(orgId: string | null) {
  const [policies, setPolicies] = useState<OrgPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) {
      setPolicies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToOrgPolicies(orgId, (updated) => {
      setPolicies(updated);
      setLoading(false);
    });

    return unsub;
  }, [orgId]);

  return { policies, loading };
}
