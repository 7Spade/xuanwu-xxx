# Feature Slice: `account-user.wallet`

## Domain

User wallet — personal balance, transaction history, and payment operations for an individual user account.

## Responsibilities

- Display user wallet balance (`Account.wallet.balance`)
- Wallet top-up / transfer operations (future)
- Transaction history (`accounts/{userId}/walletTransactions` sub-collection, future)

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | Wallet mutations (topUp, transfer) |
| `_queries.ts` | Real-time balance subscription |
| `_components/` | `WalletCard`, `TransactionList` |
| `_hooks/` | `useWallet` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `Account`, `Wallet`
- `@/shared/infra/firestore/` — Firestore reads/writes
