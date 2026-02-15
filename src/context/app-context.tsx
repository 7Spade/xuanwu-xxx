"use client";

import React, { createContext, useReducer, useEffect, ReactNode, useMemo } from 'react';
import { useFirebase } from "@/context/firebase-context";
import { collection, query, where, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { Organization, CapabilitySpec, Notification, SwitchableAccount, User } from '@/types/domain';
import { useAuth } from './auth-context';

// State and Action Types
interface AppState {
  organizations: Record<string, Organization>;
  activeAccount: SwitchableAccount | null;
  notifications: Notification[];
  capabilitySpecs: CapabilitySpec[];
  scheduleTaskRequest: { taskName: string; workspaceId: string } | null;
}

type Action =
  | { type: 'SET_ORGANIZATIONS'; payload: { snapshot: QuerySnapshot, user: User } }
  | { type: 'SET_ACTIVE_ACCOUNT'; payload: SwitchableAccount | null }
  | { type: 'RESET_STATE' }
  | { type: 'ADD_NOTIFICATION', payload: Omit<Notification, 'id' | 'timestamp' | 'read'> }
  | { type: 'MARK_NOTIFICATION_READ', payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'REQUEST_SCHEDULE_TASK'; payload: { taskName: string; workspaceId: string; } }
  | { type: 'CLEAR_SCHEDULE_TASK_REQUEST' };


// Initial State
const initialState: AppState = {
  organizations: {},
  activeAccount: null,
  notifications: [],
  capabilitySpecs: [
    { id: 'capabilities', name: 'Capabilities', type: 'ui', status: 'stable', description: 'Manage the atomic capabilities mounted to this workspace.' },
    { id: 'members', name: 'Members', type: 'governance', status: 'stable', description: 'Manages granular, grant-based authorization for teams and individuals.' },
    { id: 'audit', name: 'Audit', type: 'monitoring', status: 'stable', description: 'Provides a real-time event stream for all significant state changes.' },
    { id: 'tasks', name: 'Tasks', type: 'ui', status: 'stable', description: 'Track concrete action items within the workspace node.' },
    { id: 'qa', name: 'QA', type: 'ui', status: 'stable', description: 'Governance unit for verifying the quality of atomic data execution.' },
    { id: 'acceptance', name: 'Acceptance', type: 'ui', status: 'stable', description: 'Accept workspace deliverables and terminate A-Track resonance.' },
    { id: 'finance', name: 'Finance', type: 'ui', status: 'beta', description: 'Track dimension budgets and post-acceptance fund disbursement.' },
    { id: 'issues', name: 'Issues', type: 'ui', status: 'stable', description: 'Governance module for handling technical conflicts and B-Track anomalies.' },
    { id: 'daily', name: 'Daily', type: 'ui', status: 'stable', description: 'A minimalist activity wall for technical collaboration within the space.' },
    { id: 'files', name: 'Files', type: 'data', status: 'stable', description: 'Manage document sovereignty and technical assets within the dimension.' },
    { id: 'schedule', name: 'Schedule', type: 'ui', status: 'stable', description: 'View and manage the adoption timeline for the workspace.' },
    { id: 'document-parser', name: 'Document Parser', type: 'ui', status: 'beta', description: 'Intelligently parse and extract data from documents like invoices and quotes.' },
  ],
  scheduleTaskRequest: null,
};

// Reducer
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_ACTIVE_ACCOUNT':
      if (state.activeAccount?.id === action.payload?.id) return state;
      // When account switches, only reset account-specific data.
      // Here, we just set the new account. The AccountProvider will handle data fetching.
      return { ...state, activeAccount: action.payload };
    
    case 'RESET_STATE':
      return initialState;

    case 'SET_ORGANIZATIONS': {
      const { snapshot, user } = action.payload;
      if (!snapshot?.docs) return state;

      const newOrgs = snapshotToRecord<Organization>(snapshot);
      const orgAccounts = Object.values(newOrgs).map(o => ({ id: o.id, name: o.name, type: 'organization' } as SwitchableAccount));
      const personalAccount: SwitchableAccount = { id: user.id, name: `${user.name} (Personal)`, type: 'user' };
      
      let newActiveAccount = state.activeAccount;
      const availableAccountIds = [personalAccount.id, ...orgAccounts.map(o => o.id)];
      if (!newActiveAccount || !availableAccountIds.includes(newActiveAccount.id)) {
        newActiveAccount = personalAccount;
      }
      
      return { ...state, organizations: newOrgs, activeAccount: newActiveAccount };
    }
      
    case 'ADD_NOTIFICATION':
      const newNotification = { 
        ...action.payload, 
        id: Math.random().toString(36).substring(2, 9), 
        timestamp: Date.now(), 
        read: false 
      };
      return { 
        ...state, 
        notifications: [newNotification, ...state.notifications].slice(0, 50) // Limit to 50 notifications
      };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
        
    case 'REQUEST_SCHEDULE_TASK':
      return { ...state, scheduleTaskRequest: action.payload };
    
    case 'CLEAR_SCHEDULE_TASK_REQUEST':
      return { ...state, scheduleTaskRequest: null };

    default:
      return state;
  }
};

function snapshotToRecord<T extends { id: string }>(snap: QuerySnapshot): Record<string, T> {
  const record: Record<string, T> = {};
  if (snap && typeof snap.forEach === 'function') {
    snap.forEach(doc => {
      record[doc.id] = { id: doc.id, ...doc.data() } as T;
    });
  }
  return record;
}


// Context
export const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

// Provider
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { db } = useFirebase();
  const { state: authState } = useAuth();
  const { user, authInitialized } = authState;
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    if (!authInitialized) return;

    let unsubscribe: (() => void) | null = null;

    if (user?.id && db) {
      const orgQuery = query(collection(db, "organizations"), where("memberIds", "array-contains", user.id));
      unsubscribe = onSnapshot(orgQuery, (snap) => dispatch({ type: 'SET_ORGANIZATIONS', payload: { snapshot: snap, user } }));
    } else {
      dispatch({ type: 'RESET_STATE' });
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [authInitialized, user, db]);


  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
