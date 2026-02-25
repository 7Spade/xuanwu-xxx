/**
 * centralized-tag — _events.ts
 *
 * TagLifecycleEvent contract.
 *
 * Per logic-overview_v5.md (VS0 Tag Authority Center):
 *   CTA -->|"標籤異動廣播"| TAG_EVENTS
 *   TAG_EVENTS["TagLifecycleEvent\nTagCreated · TagUpdated\nTagDeprecated · TagDeleted\n→ Integration Event Router"]
 *
 * Invariant #17: CENTRALIZED_TAG_AGGREGATE manages tagSlug uniqueness and deletion rules;
 *   all consumers hold read-only tagSlug references.
 * Invariant T1: New slices needing tag semantics subscribe to TagLifecycleEvent only;
 *   they must not maintain their own tag master data.
 */

// =================================================================
// == Payload Interfaces
// =================================================================

export interface TagCreatedPayload {
  tagSlug: string;
  label: string;
  category: string;
  createdBy: string;
  createdAt: string;
}

export interface TagUpdatedPayload {
  tagSlug: string;
  label: string;
  category: string;
  updatedBy: string;
  updatedAt: string;
}

export interface TagDeprecatedPayload {
  tagSlug: string;
  /** Optional replacement tagSlug suggested to consumers. */
  replacedByTagSlug?: string;
  deprecatedBy: string;
  deprecatedAt: string;
}

export interface TagDeletedPayload {
  tagSlug: string;
  deletedBy: string;
  deletedAt: string;
}

// =================================================================
// == Event Key Map
// =================================================================

export interface TagLifecycleEventPayloadMap {
  'tag:created': TagCreatedPayload;
  'tag:updated': TagUpdatedPayload;
  'tag:deprecated': TagDeprecatedPayload;
  'tag:deleted': TagDeletedPayload;
}

export type TagLifecycleEventKey = keyof TagLifecycleEventPayloadMap;
