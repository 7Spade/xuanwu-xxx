/**
 * @fileoverview Projection Registry Repository.
 *
 * Tracks event stream offsets and read model versions for all projections.
 * Stored at: projectionMeta/{projectionName}
 *
 * Per logic-overview.v3.md:
 * - PROJECTION_VERSION: event stream offset ↔ read model version table
 * - READ_MODEL_REGISTRY: provides read-model version correspondence
 */

import {
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '../firestore.client';

export interface ProjectionVersionRecord {
  projectionName: string;
  lastEventOffset: number;
  readModelVersion: string;
  updatedAt: Timestamp;
}

/**
 * Retrieves the current version record for a projection.
 */
export const getProjectionVersion = async (
  projectionName: string
): Promise<ProjectionVersionRecord | null> => {
  const ref = doc(db, 'projectionMeta', projectionName);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return {
    projectionName,
    ...(snap.data() as Omit<ProjectionVersionRecord, 'projectionName'>),
  };
};

/**
 * Creates or updates the version record for a projection.
 * Called by the Event Funnel after each event is processed.
 */
export const upsertProjectionVersion = async (
  projectionName: string,
  lastEventOffset: number,
  readModelVersion: string
): Promise<void> => {
  const ref = doc(db, 'projectionMeta', projectionName);
  await setDoc(
    ref,
    {
      lastEventOffset,
      readModelVersion,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
