'use client';

/**
 * account-user.wallet — _hooks/use-wallet.ts
 *
 * React hook for subscribing to a user's wallet balance.
 */

import { useState, useEffect } from 'react';
import { subscribeToWalletBalance, subscribeToWalletTransactions } from '../_queries';
import type { Wallet } from '@/shared/types';
import type { WalletTransactionRecord } from '../_queries';

export function useWallet(accountId: string | null) {
  const [wallet, setWallet] = useState<Wallet>({ balance: 0 });
  const [transactions, setTransactions] = useState<WalletTransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) {
      setWallet({ balance: 0 });
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let balanceReady = false;
    let txReady = false;

    const checkReady = () => {
      if (balanceReady && txReady) setLoading(false);
    };

    const unsubBalance = subscribeToWalletBalance(accountId, (w) => {
      setWallet(w);
      balanceReady = true;
      checkReady();
    });

    const unsubTx = subscribeToWalletTransactions(accountId, 20, (txs) => {
      setTransactions(txs);
      txReady = true;
      checkReady();
    });

    return () => {
      unsubBalance();
      unsubTx();
    };
  }, [accountId]);

  return { wallet, transactions, loading };
}
