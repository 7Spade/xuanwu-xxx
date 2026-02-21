"use client"

import { useMemo } from "react"
import { useSelectedLayoutSegment } from "next/navigation"
import Link from "next/link"
import { useWorkspace } from "@/features/workspace"
import { useApp } from "@/react-hooks/state-hooks/use-app"
import type { Capability } from "@/shared/types"

// =================================================================
// == Capability Registry — maps capability IDs to labels
// =================================================================
const CAPABILITY_REGISTRY = {
  // Core
  capabilities: { label: "Capabilities" },
  // Governance
  members: { label: "Members" },
  // Business (mountable)
  tasks: { label: "Tasks" },
  qa: { label: "QA" },
  acceptance: { label: "Acceptance" },
  finance: { label: "Finance" },
  issues: { label: "Issues" },
  files: { label: "Files" },
  daily: { label: "Daily" },
  schedule: { label: "Schedule" },
  "document-parser": { label: "Document Parser" },
  // Projection
  audit: { label: "Audit" },
}

// =================================================================
// == Layer Boundaries — permanent tabs that are never dynamically mounted
// =================================================================

// Layer 1 — Core: Workspace lifecycle & capability management
const CORE_CAPABILITY = { id: "capabilities", name: "Capabilities" }

// Layer 2 — Governance: Access control, roles & permissions
const GOVERNANCE_CAPABILITY_IDS = new Set(["members"])
const GOVERNANCE_CAPABILITIES = [{ id: "members", name: "Members" }]

// Layer 4 — Projection: Read models & event stream (always visible, never mountable)
const PROJECTION_CAPABILITY_IDS = new Set(["audit"])
const PROJECTION_CAPABILITIES = [{ id: "audit", name: "Audit" }]

// All non-Business IDs (used to filter the dynamic Business capability list)
const PERMANENT_CAPABILITY_IDS = new Set([
  ...Array.from(GOVERNANCE_CAPABILITY_IDS),
  ...Array.from(PROJECTION_CAPABILITY_IDS),
  CORE_CAPABILITY.id,
])

interface WorkspaceNavTabsProps {
  workspaceId: string
}

export function WorkspaceNavTabs({ workspaceId }: WorkspaceNavTabsProps) {
  const { workspace } = useWorkspace()
  const { state } = useApp()
  const { activeAccount } = state
  const activeCapability = useSelectedLayoutSegment("plugin-tab")

  // Show governance tabs (Members) only for org-owned workspaces.
  // We avoid hiding them unless we can definitively confirm a personal workspace
  // (i.e., dimensionId matches the active user's own account ID).
  const showGovernanceTabs = useMemo(
    () =>
      !(
        activeAccount?.accountType === "user" &&
        workspace.dimensionId === activeAccount.id
      ),
    [workspace.dimensionId, activeAccount]
  )

  const mountedCapabilities = useMemo(() => {
    // Layer 3 — Business: dynamic capabilities mounted per workspace, excluding permanent layers.
    const businessCapabilities = (workspace.capabilities || [])
      .filter((capability: Capability) => !PERMANENT_CAPABILITY_IDS.has(capability.id))
      .map((capability: Capability) => ({
        id: capability.id,
        name: capability.name,
      }))

    // Layer 2 — Governance: only relevant for org-owned workspaces.
    const governanceCapabilities = showGovernanceTabs ? GOVERNANCE_CAPABILITIES : []

    // Tab order: Core → Governance → Business → Projection
    return [CORE_CAPABILITY, ...governanceCapabilities, ...businessCapabilities, ...PROJECTION_CAPABILITIES]
  }, [workspace.capabilities, showGovernanceTabs])

  return (
    <div className="bg-muted/40 p-1 border border-border/50 rounded-xl w-full flex overflow-x-auto no-scrollbar">
      {mountedCapabilities.map((cap: { id: string; name: string }) => {
        const detail = CAPABILITY_REGISTRY[cap.id as keyof typeof CAPABILITY_REGISTRY]
        const isActive = activeCapability === cap.id
        
        return detail ? (
          <Link
            key={cap.id}
            href={`/dashboard/workspaces/${workspaceId}/${cap.id}`}
            className={`text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg whitespace-nowrap inline-flex items-center justify-center h-9 transition-colors ${
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            }`}
          >
            {detail.label}
          </Link>
        ) : null
      })}
    </div>
  )
}
