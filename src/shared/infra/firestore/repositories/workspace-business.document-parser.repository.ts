/**
 * @fileoverview Workspace Business — Document Parser Repository.
 *
 * All Firestore read and write operations for the `parsingIntents` sub-collection
 * under a workspace. Stored at: workspaces/{workspaceId}/parsingIntents/{intentId}
 * Corresponds to the `workspace-business.document-parser` feature slice.
 *
 * ParsingIntent is a Digital Twin (解析合約) produced by the document-parser.
 * Tasks reference it via `sourceIntentId` as an immutable SourcePointer.
 */

import {
  serverTimestamp,
  collection,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firestore.client';
import {
  updateDocument,
  addDocument,
} from '../firestore.write.adapter';
import { getDocuments } from '../firestore.read.adapter';
import { createConverter } from '../firestore.converter';
import type { ParsingIntent } from '@/shared/types';

export const createParsingIntent = async (
  workspaceId: string,
  intentData: Omit<ParsingIntent, 'id' | 'createdAt'>
): Promise<string> => {
  const ref = await addDocument(
    `workspaces/${workspaceId}/parsingIntents`,
    { ...intentData, createdAt: serverTimestamp() }
  );
  return ref.id;
};

export const updateParsingIntentStatus = async (
  workspaceId: string,
  intentId: string,
  status: 'imported' | 'failed'
): Promise<void> => {
  const updates: Record<string, unknown> = { status };
  if (status === 'imported') {
    updates.importedAt = serverTimestamp();
  }
  return updateDocument(
    `workspaces/${workspaceId}/parsingIntents/${intentId}`,
    updates
  );
};

export const getParsingIntents = async (
  workspaceId: string
): Promise<ParsingIntent[]> => {
  const converter = createConverter<ParsingIntent>();
  const colRef = collection(
    db,
    `workspaces/${workspaceId}/parsingIntents`
  ).withConverter(converter);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return getDocuments(q);
};
