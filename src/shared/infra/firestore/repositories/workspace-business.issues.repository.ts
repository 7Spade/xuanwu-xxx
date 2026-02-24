/**
 * @fileoverview Workspace Business — Issues Repository.
 *
 * All Firestore read and write operations for the `issues` sub-collection
 * under a workspace. Stored at: workspaces/{workspaceId}/issues/{issueId}
 * Corresponds to the `workspace-business.issues` feature slice.
 */

import {
  serverTimestamp,
  arrayUnion,
  collection,
  query,
  orderBy,
  type FieldValue,
} from 'firebase/firestore';
import { db } from '../firestore.client';
import {
  updateDocument,
  addDocument,
} from '../firestore.write.adapter';
import { getDocuments } from '../firestore.read.adapter';
import { createConverter } from '../firestore.converter';
import type { WorkspaceIssue, IssueComment } from '@/shared/types';

/**
 * Creates a new issue in a workspace (e.g., when a task is rejected).
 * @param sourceTaskId - Optional SourcePointer to the A-track task that created this issue.
 *                       Used by the Discrete Recovery Principle: when the issue is resolved,
 *                       the A-track task is automatically unblocked via IssueResolved event.
 */
export const createIssue = async (
  workspaceId: string,
  title: string,
  type: 'technical' | 'financial',
  priority: 'high' | 'medium',
  sourceTaskId?: string
): Promise<void> => {
  const issueData: Omit<WorkspaceIssue, 'id' | 'createdAt'> & { createdAt: FieldValue } = {
    title,
    type,
    priority,
    issueState: 'open',
    ...(sourceTaskId !== undefined ? { sourceTaskId } : {}),
    createdAt: serverTimestamp(),
    comments: [],
  };
  await addDocument(`workspaces/${workspaceId}/issues`, issueData);
};

/**
 * Adds a comment to a specific issue.
 */
export const addCommentToIssue = async (
  workspaceId: string,
  issueId: string,
  author: string,
  content: string
): Promise<void> => {
  const newComment: Omit<IssueComment, 'createdAt'> & { createdAt: FieldValue } = {
    id: `comment-${Math.random().toString(36).substring(2, 11)}`,
    author,
    content,
    createdAt: serverTimestamp(),
  };

  await updateDocument(`workspaces/${workspaceId}/issues/${issueId}`, {
    comments: arrayUnion(newComment),
  });
};

/**
 * Marks an issue as resolved (closes the B-track item).
 * Publishes `workspace:issues:resolved` via the event bus after calling this.
 */
export const resolveIssue = async (
  workspaceId: string,
  issueId: string
): Promise<void> => {
  await updateDocument(`workspaces/${workspaceId}/issues/${issueId}`, {
    issueState: 'closed',
  });
};

export const getWorkspaceIssues = async (
  workspaceId: string
): Promise<WorkspaceIssue[]> => {
  const converter = createConverter<WorkspaceIssue>();
  const colRef = collection(
    db,
    `workspaces/${workspaceId}/issues`
  ).withConverter(converter);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return getDocuments(q);
};
