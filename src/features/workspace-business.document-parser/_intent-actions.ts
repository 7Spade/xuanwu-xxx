/**
 * @fileoverview intent-actions.ts — Firestore CRUD for ParsingIntent (Digital Twin).
 * @description Called from the document-parser client component to persist parse results
 * before they are dispatched to the workspace event bus.
 * No 'use server' — runs in the browser with the authenticated user's Firestore context.
 */

import {
  createParsingIntent as createParsingIntentFacade,
  updateParsingIntentStatus as updateParsingIntentStatusFacade,
} from '@/shared/infra/firestore/firestore.facade'
import type { ParsedLineItem } from '@/shared/types'

export async function saveParsingIntent(
  workspaceId: string,
  sourceFileName: string,
  lineItems: ParsedLineItem[],
  sourceFileDownloadURL?: string
): Promise<string> {
  return createParsingIntentFacade(workspaceId, {
    workspaceId,
    sourceFileName,
    sourceFileDownloadURL,
    intentVersion: 1,
    lineItems,
    status: 'pending',
  })
}

export async function markParsingIntentImported(
  workspaceId: string,
  intentId: string
): Promise<void> {
  return updateParsingIntentStatusFacade(workspaceId, intentId, 'imported')
}
