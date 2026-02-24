'use client';

/**
 * account-governance.policy — _hooks/use-account-policy.ts
 *
 * React hook for subscribing to account policies.
 */

import { useState, useEffect } from 'react';
import { subscribeToAccountPolicies } from '../_queries';
import type { AccountPolicy } from '../_actions';

export function useAccountPolicy(accountId: string | null) {
  const [policies, setPolicies] = useState<AccountPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) {
      setPolicies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToAccountPolicies(accountId, (updated) => {
      setPolicies(updated);
      setLoading(false);
    });

    return unsub;
  }, [accountId]);

  return { policies, loading };
}
