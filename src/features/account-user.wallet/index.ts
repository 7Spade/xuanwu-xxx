/**
 * account-user.wallet — Public API
 *
 * User personal wallet — balance management with strong consistency.
 *
 * Per logic-overview.v3.md (A1): USER_WALLET_AGGREGATE — strong-consistency balance invariant.
 * Balance is stored inline on accounts/{userId}.wallet; transactions in sub-collection.
 */

export { creditWallet, debitWallet } from './_actions';
export type { WalletTransaction, TopUpInput, DebitInput } from './_actions';

export {
  getWalletBalance,
  subscribeToWalletBalance,
  subscribeToWalletTransactions,
} from './_queries';
export type { WalletTransactionRecord } from './_queries';

export { useWallet } from './_hooks/use-wallet';
