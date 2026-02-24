
"use client";

import type React from 'react';
import { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { type Workspace, type AuditLog, type WorkspaceTask, type WorkspaceRole, type Capability, type WorkspaceLifecycleState, type ScheduleItem } from '@/shared/types';
import { WorkspaceEventBus , WorkspaceEventContext, registerWorkspaceFunnel, registerOrganizationFunnel, type WorkspaceEventName } from '@/features/workspace-core.event-bus';
import { registerNotificationRouter } from '@/features/account-governance.notification-router';
import { registerOrgPolicyCache, runTransaction } from '@/features/workspace-application';
import { serverTimestamp, type FieldValue, type Firestore } from 'firebase/firestore';
import { useAccount } from '../_hooks/use-account';
import { useFirebase } from '@/shared/app-providers/firebase-provider';
import { addDocument } from '@/shared/infra/firestore/firestore.write.adapter';
import { useApp } from '../_hooks/use-app';
import { Loader2 } from 'lucide-react';
import { 
  createTask as createTaskAction,
  updateTask as updateTaskAction,
  deleteTask as deleteTaskAction,
  getWorkspaceTask as getWorkspaceTaskAction,
} from '@/features/workspace-business.tasks'
import {
  authorizeWorkspaceTeam as authorizeWorkspaceTeamAction,
  revokeWorkspaceTeam as revokeWorkspaceTeamAction,
  grantIndividualWorkspaceAccess as grantIndividualWorkspaceAccessAction,
  revokeIndividualWorkspaceAccess as revokeIndividualWorkspaceAccessAction,
  mountCapabilities as mountCapabilitiesAction,
  unmountCapability as unmountCapabilityAction,
  updateWorkspaceSettings as updateWorkspaceSettingsAction,
  deleteWorkspace as deleteWorkspaceAction,
} from '../_actions'
import {
  createIssue as createIssueAction,
  addCommentToIssue as addCommentToIssueAction,
  resolveIssue as resolveIssueAction,
} from '@/features/workspace-business.issues'
import {
  createScheduleItem as createScheduleItemAction,
} from '@/features/workspace-business.schedule'


interface WorkspaceContextType {
  workspace: Workspace;
  localAuditLogs: AuditLog[];
  logAuditEvent: (action: string, detail: string, type: 'create' | 'update' | 'delete') => Promise<void>;
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
  createIssue: (title: string, type: 'technical' | 'financial', priority: 'high' | 'medium', sourceTaskId?: string) => Promise<void>;
  addCommentToIssue: (issueId: string, author: string, content: string) => Promise<void>;
  /** Resolves a B-track issue via the Transaction Runner + Outbox pipeline. */
  resolveIssue: (issueId: string, issueTitle: string, resolvedBy: string, sourceTaskId?: string) => Promise<void>;
  // Schedule Management
  createScheduleItem: (itemData: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ workspaceId, children }: { workspaceId: string, children: React.ReactNode }) {
  const { state: accountState } = useAccount();
  const { state: appState } = useApp();
  const { db } = useFirebase();
  const { workspaces, auditLogs } = accountState;
  const { activeAccount } = appState;
  const workspace = workspaces[workspaceId];

  const eventBus = useMemo(() => new WorkspaceEventBus(), [workspaceId]);

  // Register Event Funnel — routes events from both buses to the Projection Layer
  // Also register Notification Router (FCM Layer 2) and Org Policy Cache
  useEffect(() => {
    const unsubWorkspace = registerWorkspaceFunnel(eventBus);
    const unsubOrg = registerOrganizationFunnel();
    const { unsubscribe: unsubNotif } = registerNotificationRouter();
    const unsubPolicy = registerOrgPolicyCache();
    return () => {
      unsubWorkspace();
      unsubOrg();
      unsubNotif();
      unsubPolicy();
    };
  }, [eventBus]);

  const localAuditLogs = useMemo(() => {
    if (!auditLogs || !workspaceId) return [];
    return Object.values(auditLogs).filter(log => log.workspaceId === workspaceId);
  }, [auditLogs, workspaceId]);
  
  const logAuditEvent = useCallback(async (action: string, detail: string, type: 'create' | 'update' | 'delete') => {
    if (!activeAccount || activeAccount.accountType !== 'organization' || !db) return;
    const eventData: Omit<AuditLog, 'id' | 'recordedAt'> & { recordedAt: FieldValue } = {
      actor: activeAccount.name,
      action,
      target: detail,
      type,
      recordedAt: serverTimestamp(),
      accountId: activeAccount.id,
      workspaceId,
    };
    await addDocument(`accounts/${activeAccount.id}/auditLogs`, eventData);
  }, [activeAccount, db, workspaceId]);

  const createTask = useCallback(async (task: Omit<WorkspaceTask, 'id' | 'createdAt' | 'updatedAt'>) => createTaskAction(workspaceId, task), [workspaceId]);
  const updateTask = useCallback(async (taskId: string, updates: Partial<WorkspaceTask>) => {
    await updateTaskAction(workspaceId, taskId, updates);
    // Schedule trigger chain: task assignment change → workspace:tasks:assigned → W_B_SCHEDULE.
    // Only publish when a non-empty assigneeId is provided (assignment, not un-assignment).
    if (updates.assigneeId) {
      // Fetch task data from workspace-business.tasks BC boundary (not from workspace aggregate).
      const taskData = await getWorkspaceTaskAction(workspaceId, taskId);
      eventBus.publish('workspace:tasks:assigned', {
        taskId,
        taskName: taskData?.name ?? taskId,
        assigneeId: updates.assigneeId,
        workspaceId,
        sourceIntentId: taskData?.sourceIntentId,
      });
    }
  }, [workspaceId, eventBus]);
  const deleteTask = useCallback(async (taskId: string) => deleteTaskAction(workspaceId, taskId), [workspaceId]);
  
  const authorizeWorkspaceTeam = useCallback(async (teamId: string) => authorizeWorkspaceTeamAction(workspaceId, teamId), [workspaceId]);
  const revokeWorkspaceTeam = useCallback(async (teamId: string) => revokeWorkspaceTeamAction(workspaceId, teamId), [workspaceId]);
  const grantIndividualWorkspaceAccess = useCallback(async (userId: string, role: WorkspaceRole, protocol?: string) => grantIndividualWorkspaceAccessAction(workspaceId, userId, role, protocol), [workspaceId]);
  const revokeIndividualWorkspaceAccess = useCallback(async (grantId: string) => revokeIndividualWorkspaceAccessAction(workspaceId, grantId), [workspaceId]);
  
  const mountCapabilities = useCallback(async (capabilities: Capability[]) => mountCapabilitiesAction(workspaceId, capabilities), [workspaceId]);
  const unmountCapability = useCallback(async (capability: Capability) => unmountCapabilityAction(workspaceId, capability), [workspaceId]);
  
  const updateWorkspaceSettings = useCallback(async (settings: { name: string; visibility: 'visible' | 'hidden'; lifecycleState: WorkspaceLifecycleState }) => updateWorkspaceSettingsAction(workspaceId, settings), [workspaceId]);
  const deleteWorkspace = useCallback(async () => deleteWorkspaceAction(workspaceId), [workspaceId]);

  const createIssue = useCallback(async (title: string, type: 'technical' | 'financial', priority: 'high' | 'medium', sourceTaskId?: string) => createIssueAction(workspaceId, title, type, priority, sourceTaskId), [workspaceId]);
  const addCommentToIssue = useCallback(async (issueId: string, author: string, content: string) => addCommentToIssueAction(workspaceId, issueId, author, content), [workspaceId]);
  // Outbox-encapsulated resolve: Firestore write + event collection happen inside
  // Transaction Runner; events are flushed to the Event Bus only after the write commits.
  const resolveIssue = useCallback(async (issueId: string, issueTitle: string, resolvedBy: string, sourceTaskId?: string) => {
    const { events } = await runTransaction(workspaceId, resolvedBy, async (ctx) => {
      await resolveIssueAction(workspaceId, issueId);
      ctx.outbox.collect('workspace:issues:resolved', { issueId, issueTitle, resolvedBy, sourceTaskId });
    });
    for (const event of events) {
      eventBus.publish(event.type as WorkspaceEventName, event.payload as never);
    }
  }, [workspaceId, eventBus]);

  const createScheduleItem = useCallback(async (itemData: Omit<ScheduleItem, 'id' | 'createdAt'>) => createScheduleItemAction(itemData), []);


  if (!workspace || !db) {
    return (
      <div className="flex size-full flex-col items-center justify-center space-y-4 bg-background p-20">
        <div className="animate-bounce text-4xl">🐢</div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <Loader2 className="size-3 animate-spin" /> Entering logical space...
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
    resolveIssue,
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
