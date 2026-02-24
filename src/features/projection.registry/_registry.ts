/**
 * projection.registry — Event stream offset + read model version table.
 *
 * Per logic-overview.v3.md:
 * - EVENT_FUNNEL_INPUT →|更新事件串流偏移量| PROJECTION_VERSION
 * - PROJECTION_VERSION →|提供 read-model 對應版本| READ_MODEL_REGISTRY
 */

import {
  getProjectionVersion as getProjectionVersionRepo,
  upsertProjectionVersion as upsertProjectionVersionRepo,
  type ProjectionVersionRecord,
} from '@/shared/infra/firestore/firestore.facade';

export type { ProjectionVersionRecord };

/**
 * Retrieves the current event offset and version for a named projection.
 * Returns null if the projection has never been updated.
 */
export async function getProjectionVersion(
  projectionName: string
): Promise<ProjectionVersionRecord | null> {
  return getProjectionVersionRepo(projectionName);
}

/**
 * Updates the event offset and read model version for a named projection.
 * Called by EVENT_FUNNEL_INPUT after processing each event.
 */
export async function upsertProjectionVersion(
  projectionName: string,
  lastEventOffset: number,
  readModelVersion: string
): Promise<void> {
  return upsertProjectionVersionRepo(projectionName, lastEventOffset, readModelVersion);
}
