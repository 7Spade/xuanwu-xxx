/**
 * @fileoverview Workspace Core — Event Store Repository.
 *
 * Append-only domain event log for workspace aggregates.
 * Stored at: workspaces/{workspaceId}/events/{eventId}
 *
 * Per logic-overview.v3.md invariant #9:
 * If this event store exists, Projections MUST be fully rebuildable from events.
 * This slice is append-only — no delete or update operations.
 */

import {
  serverTimestamp,
  collection,
  query,
  orderBy,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../firestore.client';
import { addDocument } from '../firestore.write.adapter';
import { getDocuments } from '../firestore.read.adapter';
import { createConverter } from '../firestore.converter';

export interface StoredWorkspaceEvent {
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  aggregateId: string; // workspaceId
  occurredAt: Timestamp;
  correlationId?: string;
  causedBy?: string; // userId who triggered the command
}

/**
 * Appends a domain event to the workspace event store (append-only).
 */
export const appendDomainEvent = async (
  workspaceId: string,
  event: Omit<StoredWorkspaceEvent, 'id' | 'occurredAt'>
): Promise<string> => {
  const ref = await addDocument(`workspaces/${workspaceId}/events`, {
    ...event,
    occurredAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Retrieves all domain events for a workspace (ordered by occurredAt).
 * Used for event replay and audit.
 */
export const getDomainEvents = async (
  workspaceId: string
): Promise<StoredWorkspaceEvent[]> => {
  const converter = createConverter<StoredWorkspaceEvent>();
  const colRef = collection(db, `workspaces/${workspaceId}/events`).withConverter(converter);
  const q = query(colRef, orderBy('occurredAt', 'asc'));
  return getDocuments(q);
};
