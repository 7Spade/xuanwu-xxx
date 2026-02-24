/**
 * @fileoverview workspace-business.document-parser — Real-time Firestore subscription.
 *
 * Provides a reactive subscription to the `parsingIntents` subcollection so that
 * the DocumentParser view can display a live history of all ParsingIntents
 * (Digital Twin 解析合約) without additional one-shot fetches.
 *
 * Path: workspaces/{workspaceId}/parsingIntents/{intentId}
 */

import { collection, query, orderBy, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import type { ParsingIntent } from '@/shared/types';

/**
 * Opens a real-time listener on the workspace parsingIntents subcollection.
 * @param workspaceId The workspace whose intents to subscribe to.
 * @param onUpdate    Callback receiving the latest intent array on every update.
 * @returns An unsubscribe function — call it on component unmount.
 */
export function subscribeToParsingIntents(
  workspaceId: string,
  onUpdate: (intents: ParsingIntent[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'workspaces', workspaceId, 'parsingIntents'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const intents = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }) as ParsingIntent);
    onUpdate(intents);
  });
}
