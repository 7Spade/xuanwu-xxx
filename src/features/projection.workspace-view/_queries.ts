/**
 * projection.workspace-view — _queries.ts
 *
 * Read-side queries for the workspace projection view.
 */

import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { WorkspaceViewRecord } from './_projector';

export async function getWorkspaceView(workspaceId: string): Promise<WorkspaceViewRecord | null> {
  return getDocument<WorkspaceViewRecord>(`workspaceView/${workspaceId}`);
}

export async function getWorkspaceCapabilities(workspaceId: string): Promise<string[]> {
  const view = await getWorkspaceView(workspaceId);
  return view?.capabilities ?? [];
}
