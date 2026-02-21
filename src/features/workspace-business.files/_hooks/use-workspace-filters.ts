// [職責] 封裝搜尋與過濾邏輯
"use client";

import { useMemo, useDeferredValue } from "react";
import type { Workspace } from "@/shared/types";

export function useWorkspaceFilters(
  workspaces: Workspace[],
  searchQuery: string
) {
  const deferredSearch = useDeferredValue(searchQuery);
  const searchValue = deferredSearch.toLowerCase();

  const filteredWorkspaces = useMemo(
    () =>
      workspaces.filter((w) => w.name.toLowerCase().includes(searchValue)),
    [workspaces, searchValue]
  );

  return filteredWorkspaces;
}
