// [職責] 提供輕量的 Workspace 事件匯流排 Context，
// 允許 feature 元件直接 publish/subscribe 而無需注入整個 WorkspaceContext。
"use client"

import { createContext, useContext } from "react"
import type {
  PublishFn,
  SubscribeFn,
} from "./_events"

export interface WorkspaceEventContextType {
  publish: PublishFn
  subscribe: SubscribeFn
}

export const WorkspaceEventContext =
  createContext<WorkspaceEventContextType | null>(null)

/**
 * useWorkspaceEvents — access the workspace event bus (publish + subscribe)
 * without importing the full WorkspaceContext.
 * Must be called within a WorkspaceProvider tree.
 */
export function useWorkspaceEvents(): WorkspaceEventContextType {
  const ctx = useContext(WorkspaceEventContext)
  if (!ctx) {
    throw new Error("useWorkspaceEvents must be used within WorkspaceProvider")
  }
  return ctx
}
