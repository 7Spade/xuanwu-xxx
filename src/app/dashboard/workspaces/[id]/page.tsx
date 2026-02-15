// [職責] 詳情頁入口：僅負責渲染核心內容。
"use client";

import { WorkspaceTabs } from "./_components/workspace-tabs";

/**
 * WorkspaceDetailPage - The entry point for a specific workspace.
 * Its SOLE RESPONSIBILITY is to render the core content (WorkspaceTabs).
 * The WorkspaceProvider is now handled by the parent layout.
 */
export default function WorkspaceDetailPage() {
  return <WorkspaceTabs />;
}
