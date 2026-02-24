'use server';

/**
 * account-user.wallet — _actions.ts
 *
 * Server actions for user wallet balance management.
 *
 * Per logic-overview.v3.md (A1):
 *   USER_WALLET_AGGREGATE — strong consistency balance invariant.
 *   Balance must never go negative.
 *
 * Architecture:
 *   Wallet balance is stored inline on accounts/{userId}.wallet.balance.
 *   Detailed transaction history will go in accounts/{userId}/walletTransactions (future).
 *
 * Invariant #1: This BC only writes its own aggregate (user account document).
 */

import { collection, doc, runTransaction, serverTimestamp, type Transaction } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';

export interface WalletTransaction {
  id?: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  referenceId?: string;
  occurredAt: ReturnType<typeof serverTimestamp>;
}

export interface TopUpInput {
  accountId: string;
  amount: number;
  reason: string;
  referenceId?: string;
}

export interface DebitInput {
  accountId: string;
  amount: number;
  reason: string;
  referenceId?: string;
}

/**
 * Credits the wallet balance.
 * Uses a Firestore transaction to ensure atomic read-modify-write.
 * Appends a ledger entry to the walletTransactions sub-collection.
 */
export async function creditWallet(input: TopUpInput): Promise<void> {
  if (input.amount <= 0) {
    throw new Error(`credit amount must be positive (got ${input.amount})`);
  }

  const accountRef = doc(db, 'accounts', input.accountId);
  const txRef = doc(collection(db, `accounts/${input.accountId}/walletTransactions`));

  await runTransaction(db, async (tx: Transaction) => {
    const snap = await tx.get(accountRef);
    if (!snap.exists()) throw new Error(`Account ${input.accountId} not found`);

    const current: number = (snap.data()?.wallet?.balance as number) ?? 0;
    const next = current + input.amount;

    tx.update(accountRef, { 'wallet.balance': next });
    tx.set(txRef, {
      accountId: input.accountId,
      type: 'credit',
      amount: input.amount,
      reason: input.reason,
      referenceId: input.referenceId ?? null,
      occurredAt: serverTimestamp(),
    });
  });
}

/**
 * Debits the wallet balance.
 * Enforces non-negative balance invariant.
 */
export async function debitWallet(input: DebitInput): Promise<void> {
  if (input.amount <= 0) {
    throw new Error(`debit amount must be positive (got ${input.amount})`);
  }

  const accountRef = doc(db, 'accounts', input.accountId);
  const txRef = doc(collection(db, `accounts/${input.accountId}/walletTransactions`));

  await runTransaction(db, async (tx: Transaction) => {
    const snap = await tx.get(accountRef);
    if (!snap.exists()) throw new Error(`Account ${input.accountId} not found`);

    const current: number = (snap.data()?.wallet?.balance as number) ?? 0;
    if (current < input.amount) {
      throw new Error(`Insufficient balance: ${current} < ${input.amount}`);
    }
    const next = current - input.amount;

    tx.update(accountRef, { 'wallet.balance': next });
    tx.set(txRef, {
      accountId: input.accountId,
      type: 'debit',
      amount: input.amount,
      reason: input.reason,
      referenceId: input.referenceId ?? null,
      occurredAt: serverTimestamp(),
    });
  });
}
