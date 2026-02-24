"use client"

import { useMemo } from "react"
import { useSelectedLayoutSegment } from "next/navigation"
import Link from "next/link"
import { useWorkspace , useApp } from "@/features/workspace-core"
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
  'quality-assurance': { label: "QA" },
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
  const activeCapability = useSelectedLayoutSegment("businesstab")

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
    <div className="no-scrollbar flex w-full overflow-x-auto rounded-xl border border-border/50 bg-muted/40 p-1">
      {mountedCapabilities.map((cap: { id: string; name: string }) => {
        const detail = CAPABILITY_REGISTRY[cap.id as keyof typeof CAPABILITY_REGISTRY]
        const isActive = activeCapability === cap.id
        
        return detail ? (
          <Link
            key={cap.id}
            href={`/workspaces/${workspaceId}/${cap.id}`}
            className={`inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg px-4 text-[9px] font-bold uppercase tracking-widest transition-colors ${
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
