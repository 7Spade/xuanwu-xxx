/**
 * account-user.wallet — _queries.ts
 *
 * Read queries for user wallet balance and transaction history.
 */

import { doc, collection, query, orderBy, limit, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { Account, Wallet } from '@/shared/types';

/**
 * Fetches the wallet balance for a user account.
 */
export async function getWalletBalance(accountId: string): Promise<number> {
  const account = await getDocument<Account>(`accounts/${accountId}`);
  return account?.wallet?.balance ?? 0;
}

/**
 * Subscribes to real-time wallet balance updates for a user.
 */
export function subscribeToWalletBalance(
  accountId: string,
  onUpdate: (wallet: Wallet) => void
): Unsubscribe {
  const docRef = doc(db, 'accounts', accountId);
  return onSnapshot(docRef, (snap) => {
    const data = snap.data();
    onUpdate((data?.wallet as Wallet | undefined) ?? { balance: 0 });
  });
}

export interface WalletTransactionRecord {
  id: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  referenceId?: string | null;
  occurredAt: { toMillis: () => number } | null;
}

/**
 * Fetches recent wallet transaction history.
 */
export function subscribeToWalletTransactions(
  accountId: string,
  maxCount: number,
  onUpdate: (txs: WalletTransactionRecord[]) => void
): Unsubscribe {
  const ref = collection(db, `accounts/${accountId}/walletTransactions`);
  const q = query(ref, orderBy('occurredAt', 'desc'), limit(maxCount));

  return onSnapshot(q, (snap) => {
    const txs: WalletTransactionRecord[] = snap.docs.map((d) => ({
      id: d.id,
      accountId: d.data().accountId as string,
      type: d.data().type as 'credit' | 'debit',
      amount: d.data().amount as number,
      reason: d.data().reason as string,
      referenceId: (d.data().referenceId as string | null) ?? null,
      occurredAt: d.data().occurredAt as { toMillis: () => number } | null,
    }));
    onUpdate(txs);
  });
}
