/**
 * shared-kernel.authority-snapshot
 *
 * Shared Kernel contract — must be explicitly implemented by:
 *   - projection.workspace-scope-guard (invariant #7, #8)
 *   - projection.account-view         (invariant #8)
 *
 * Per logic-overview.v3.md:
 * %% Shared Kernel 區塊的虛線表示「契約遵循（implements contract）」而非跨 BC 讀寫依賴
 */

export interface AuthoritySnapshot {
  /** Subject (accountId / userId) this snapshot is for */
  subjectId: string;
  /** Roles held by this subject in the current context */
  roles: string[];
  /** Scoped permissions derived from roles */
  permissions: string[];
  /** ISO 8601 timestamp of when this snapshot was last computed */
  snapshotAt: string;
  /** Version of the read model this snapshot was built from */
  readModelVersion: number;
}

/** Marker interface — projection slices must implement this */
export interface ImplementsAuthoritySnapshotContract {
  readonly implementsAuthoritySnapshot: true;
}
