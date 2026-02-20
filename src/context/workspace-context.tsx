
"use client";

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { Workspace, AuditLog, WorkspaceTask, WorkspaceRole, Capability, WorkspaceLifecycleState, ScheduleItem, Location } from '@/types/domain';
import { useLogger } from '@/hooks/infra/use-logger';
import { WorkspaceEventBus } from '@/features/workspace/event-bus/workspace-event-bus';
import { Firestore } from 'firebase/firestore';
import { useApp } from '@/hooks/state/use-app';
import { useAccount } from '@/hooks/state/use-account';
import { useFirebase } from '@/shared/context/firebase-context';
import { Loader2 } from 'lucide-react';
import { 
  createTask as createTaskAction,
  updateTask as updateTaskAction,
  deleteTask as deleteTaskAction,
} from '@/server-commands/task'
import {
  authorizeWorkspaceTeam as authorizeWorkspaceTeamAction,
  revokeWorkspaceTeam as revokeWorkspaceTeamAction,
  grantIndividualWorkspaceAccess as grantIndividualWorkspaceAccessAction,
  revokeIndividualWorkspaceAccess as revokeIndividualWorkspaceAccessAction,
  mountCapabilities as mountCapabilitiesAction,
  unmountCapability as unmountCapabilityAction,
  updateWorkspaceSettings as updateWorkspaceSettingsAction,
  deleteWorkspace as deleteWorkspaceAction,
} from '@/server-commands/workspace'
import {
  createIssue as createIssueAction,
  addCommentToIssue as addCommentToIssueAction,
} from '@/server-commands/issue'
import { WorkspaceEventContext } from "@/context/workspace-event-context"
import {
  createScheduleItem as createScheduleItemAction,
} from '@/server-commands/schedule'


interface WorkspaceContextType {
  workspace: Workspace;
  localAuditLogs: AuditLog[];
  logAuditEvent: (action: string, detail: string, type: 'create' | 'update' | 'delete') => void;
  eventBus: WorkspaceEventBus;
  protocol: string;
  scope: string[];
  db: Firestore;
  // Task specific actions
  createTask: (task: Omit<WorkspaceTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTask: (taskId: string, updates: Partial<WorkspaceTask>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  // Member management actions
  authorizeWorkspaceTeam: (teamId: string) => Promise<void>;
  revokeWorkspaceTeam: (teamId: string) => Promise<void>;
  grantIndividualWorkspaceAccess: (userId: string, role: WorkspaceRole, protocol?: string) => Promise<void>;
  revokeIndividualWorkspaceAccess: (grantId: string) => Promise<void>;
  // Capability management
  mountCapabilities: (capabilities: Capability[]) => Promise<void>;
  unmountCapability: (capability: Capability) => Promise<void>;
  // Workspace settings
  updateWorkspaceSettings: (settings: { name: string; visibility: 'visible' | 'hidden'; lifecycleState: WorkspaceLifecycleState }) => Promise<void>;
  deleteWorkspace: () => Promise<void>;
  // Issue Management
  createIssue: (title: string, type: 'technical' | 'financial', priority: 'high' | 'medium') => Promise<void>;
  addCommentToIssue: (issueId: string, author: string, content: string) => Promise<void>;
  // Schedule Management
  createScheduleItem: (itemData: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ workspaceId, children }: { workspaceId: string, children: React.ReactNode }) {
  const { state: accountState } = useAccount();
  const { db } = useFirebase();
  const { workspaces, auditLogs } = accountState;
  const workspace = workspaces[workspaceId];

  const { logAudit } = useLogger(workspaceId, workspace?.name);
  const eventBus = useMemo(() => new WorkspaceEventBus(), [workspaceId]);

  const localAuditLogs = useMemo(() => {
    if (!auditLogs || !workspaceId) return [];
    return Object.values(auditLogs).filter(log => log.workspaceId === workspaceId);
  }, [auditLogs, workspaceId]);
  
  const logAuditEvent = useCallback((action: string, detail: string, type: 'create' | 'update' | 'delete') => {
    logAudit(action, detail, type);
  }, [logAudit]);

  const createTask = useCallback(async (task: Omit<WorkspaceTask, 'id' | 'createdAt' | 'updatedAt'>) => createTaskAction(workspaceId, task), [workspaceId]);
  const updateTask = useCallback(async (taskId: string, updates: Partial<WorkspaceTask>) => updateTaskAction(workspaceId, taskId, updates), [workspaceId]);
  const deleteTask = useCallback(async (taskId: string) => deleteTaskAction(workspaceId, taskId), [workspaceId]);
  
  const authorizeWorkspaceTeam = useCallback(async (teamId: string) => authorizeWorkspaceTeamAction(workspaceId, teamId), [workspaceId]);
  const revokeWorkspaceTeam = useCallback(async (teamId: string) => revokeWorkspaceTeamAction(workspaceId, teamId), [workspaceId]);
  const grantIndividualWorkspaceAccess = useCallback(async (userId: string, role: WorkspaceRole, protocol?: string) => grantIndividualWorkspaceAccessAction(workspaceId, userId, role, protocol), [workspaceId]);
  const revokeIndividualWorkspaceAccess = useCallback(async (grantId: string) => revokeIndividualWorkspaceAccessAction(workspaceId, grantId), [workspaceId]);
  
  const mountCapabilities = useCallback(async (capabilities: Capability[]) => mountCapabilitiesAction(workspaceId, capabilities), [workspaceId]);
  const unmountCapability = useCallback(async (capability: Capability) => unmountCapabilityAction(workspaceId, capability), [workspaceId]);
  
  const updateWorkspaceSettings = useCallback(async (settings: { name: string; visibility: 'visible' | 'hidden'; lifecycleState: WorkspaceLifecycleState }) => updateWorkspaceSettingsAction(workspaceId, settings), [workspaceId]);
  const deleteWorkspace = useCallback(async () => deleteWorkspaceAction(workspaceId), [workspaceId]);

  const createIssue = useCallback(async (title: string, type: 'technical' | 'financial', priority: 'high' | 'medium') => createIssueAction(workspaceId, title, type, priority), [workspaceId]);
  const addCommentToIssue = useCallback(async (issueId: string, author: string, content: string) => addCommentToIssueAction(workspaceId, issueId, author, content), [workspaceId]);

  const createScheduleItem = useCallback(async (itemData: Omit<ScheduleItem, 'id' | 'createdAt'>) => createScheduleItemAction(itemData), []);


  if (!workspace || !db) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4 bg-background p-20">
        <div className="text-4xl animate-bounce">🐢</div>
        <div className="flex items-center gap-2 text-muted-foreground font-black uppercase text-[10px] tracking-widest">
          <Loader2 className="w-3 h-3 animate-spin" /> Entering logical space...
        </div>
      </div>
    );
  }

  const value: WorkspaceContextType = {
    workspace,
    localAuditLogs,
    logAuditEvent,
    eventBus,
    protocol: workspace.protocol || 'Default',
    scope: workspace.scope || [],
    db,
    createTask,
    updateTask,
    deleteTask,
    authorizeWorkspaceTeam,
    revokeWorkspaceTeam,
    grantIndividualWorkspaceAccess,
    revokeIndividualWorkspaceAccess,
    mountCapabilities,
    unmountCapability,
    updateWorkspaceSettings,
    deleteWorkspace,
    createIssue,
    addCommentToIssue,
    createScheduleItem,
  };

    return (
    <WorkspaceEventContext.Provider value={{ publish: eventBus.publish, subscribe: eventBus.subscribe }}>
      <WorkspaceContext.Provider value={value}>
        {children}
      </WorkspaceContext.Provider>
    </WorkspaceEventContext.Provider>
  );
}


export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return context;
}
