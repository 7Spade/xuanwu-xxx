/**
 * @fileoverview Read Repository.
 *
 * Server-side (one-time) read functions for all domain aggregates.
 * Uses the Firestore read adapter (getDocument / getDocuments) with typed queries.
 *
 * NOTE: `"use server"` will be added once Firebase Admin SDK migration is complete
 * (see actions/GEMINI.md rule #8). Until then these run in both client and server contexts.
 */

import {
  collection,
  query,
  orderBy,
  limit as firestoreLimit,
  where,
  doc,
  getDoc,
} from "firebase/firestore"
import { db } from "../firestore.client"
import { getDocuments } from "../firestore.read.adapter"
import { createConverter } from "../firestore.converter"
import type {
  AuditLog,
  DailyLog,
  WorkspaceTask,
  WorkspaceIssue,
  WorkspaceFile,
  WorkspaceGrant,
  ScheduleItem,
  Workspace,
} from "@/types/domain"

// =================================================================
// == Account Aggregate Reads
// =================================================================

/**
 * Fetches audit logs for an account, optionally filtered by workspace.
 * @param accountId The ID of the organization account.
 * @param workspaceId Optional workspace ID to filter logs.
 * @param limitCount Maximum number of logs to return (default: 50).
 */
export const getAuditLogs = async (
  accountId: string,
  workspaceId?: string,
  limitCount = 50
): Promise<AuditLog[]> => {
  const converter = createConverter<AuditLog>()
  const colRef = collection(db, `accounts/${accountId}/auditLogs`).withConverter(
    converter
  )
  const constraints = workspaceId
    ? [where("workspaceId", "==", workspaceId), orderBy("recordedAt", "desc"), firestoreLimit(limitCount)]
    : [orderBy("recordedAt", "desc"), firestoreLimit(limitCount)]
  const q = query(colRef, ...constraints)
  return getDocuments(q)
}

/**
 * Fetches daily log entries for an account.
 * @param accountId The ID of the organization account.
 * @param limitCount Maximum number of logs to return (default: 30).
 */
export const getDailyLogs = async (
  accountId: string,
  limitCount = 30
): Promise<DailyLog[]> => {
  const converter = createConverter<DailyLog>()
  const colRef = collection(db, `accounts/${accountId}/dailyLogs`).withConverter(
    converter
  )
  const q = query(colRef, orderBy("recordedAt", "desc"), firestoreLimit(limitCount))
  return getDocuments(q)
}

/**
 * Fetches schedule items for an account, optionally filtered by workspace.
 * @param accountId The ID of the organization account.
 * @param workspaceId Optional workspace ID to filter items.
 */
export const getScheduleItems = async (
  accountId: string,
  workspaceId?: string
): Promise<ScheduleItem[]> => {
  const converter = createConverter<ScheduleItem>()
  const colRef = collection(
    db,
    `accounts/${accountId}/schedule_items`
  ).withConverter(converter)
  const constraints = workspaceId
    ? [where("workspaceId", "==", workspaceId), orderBy("startDate", "asc")]
    : [orderBy("startDate", "asc")]
  const q = query(colRef, ...constraints)
  return getDocuments(q)
}

// =================================================================
// == Workspace Aggregate Reads
// =================================================================

/**
 * Fetches all tasks for a workspace.
 * @param workspaceId The ID of the workspace.
 */
export const getWorkspaceTasks = async (
  workspaceId: string
): Promise<WorkspaceTask[]> => {
  const converter = createConverter<WorkspaceTask>()
  const colRef = collection(
    db,
    `workspaces/${workspaceId}/tasks`
  ).withConverter(converter)
  const q = query(colRef, orderBy("createdAt", "desc"))
  return getDocuments(q)
}

/**
 * Fetches all issues for a workspace.
 * @param workspaceId The ID of the workspace.
 */
export const getWorkspaceIssues = async (
  workspaceId: string
): Promise<WorkspaceIssue[]> => {
  const converter = createConverter<WorkspaceIssue>()
  const colRef = collection(
    db,
    `workspaces/${workspaceId}/issues`
  ).withConverter(converter)
  const q = query(colRef, orderBy("createdAt", "desc"))
  return getDocuments(q)
}

/**
 * Fetches the file manifest for a workspace.
 * Files are stored as a map on the workspace document.
 * @param workspaceId The ID of the workspace.
 */
export const getWorkspaceFiles = async (
  workspaceId: string
): Promise<WorkspaceFile[]> => {
  const wsRef = doc(db, "workspaces", workspaceId)
  const snap = await getDoc(wsRef)
  if (!snap.exists()) return []
  const data = snap.data() as Workspace
  return Object.values(data.files ?? {})
}

/**
 * Fetches the access grants for a workspace.
 * Grants are stored as an array on the workspace document.
 * @param workspaceId The ID of the workspace.
 */
export const getWorkspaceGrants = async (
  workspaceId: string
): Promise<WorkspaceGrant[]> => {
  const wsRef = doc(db, "workspaces", workspaceId)
  const snap = await getDoc(wsRef)
  if (!snap.exists()) return []
  const data = snap.data() as Workspace
  return data.grants ?? []
}
