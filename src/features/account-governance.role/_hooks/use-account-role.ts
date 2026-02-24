'use client';

/**
 * account-governance.role — _hooks/use-account-role.ts
 *
 * React hook for subscribing to an account's org roles.
 */

import { useState, useEffect } from 'react';
import { subscribeToAccountRoles } from '../_queries';
import type { AccountRoleRecord } from '../_actions';

export function useAccountRole(accountId: string | null) {
  const [roles, setRoles] = useState<AccountRoleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) {
      setRoles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToAccountRoles(accountId, (updated) => {
      setRoles(updated);
      setLoading(false);
    });

    return unsub;
  }, [accountId]);

  return { roles, loading };
}
