"use client";

import {type ReactNode} from 'react';
import type React from 'react';
import { createContext, useReducer, useEffect } from 'react';
import { useFirebase } from "@/shared/app-providers/firebase-provider";
import { collection, query, where, onSnapshot, type QuerySnapshot, orderBy, limit } from "firebase/firestore";
import { type Workspace, type DailyLog, type AuditLog, type PartnerInvite, type ScheduleItem } from '@/shared/types';
import { useApp } from '../_hooks/use-app';
import { snapshotToRecord } from '@/shared/infra/firestore/firestore.utils';

// State and Action Types
interface AccountState {
  workspaces: Record<string, Workspace>;
  dailyLogs: Record<string, DailyLog>;
  auditLogs: Record<string, AuditLog>;
  invites: Record<string, PartnerInvite>;
  schedule_items: Record<string, ScheduleItem>;
}

type Action =
  | { type: 'SET_WORKSPACES'; payload: QuerySnapshot }
  | { type: 'SET_DAILY_LOGS'; payload: QuerySnapshot }
  | { type: 'SET_AUDIT_LOGS'; payload: QuerySnapshot }
  | { type: 'SET_INVITES'; payload: QuerySnapshot }
  | { type: 'SET_SCHEDULE_ITEMS'; payload: QuerySnapshot }
  | { type: 'RESET_STATE' };

// Initial State
const initialState: AccountState = {
  workspaces: {},
  dailyLogs: {},
  auditLogs: {},
  invites: {},
  schedule_items: {},
};

// Reducer
const accountReducer = (state: AccountState, action: Action): AccountState => {
  switch (action.type) {
    case 'RESET_STATE':
        return initialState;

    case 'SET_WORKSPACES': {
        if (!action.payload?.docs) return { ...state, workspaces: {} };
        const newWorkspaces = snapshotToRecord<Workspace>(action.payload);
        // Preserve subcollections from old state when workspace list is updated
        // This is important because subcollection listeners are in WorkspaceProvider now
        const updatedWorkspaces = { ...state.workspaces };
        Object.keys(newWorkspaces).forEach(id => {
            updatedWorkspaces[id] = {
                ...(state.workspaces[id] || {}), // Keep existing sub-collection data
                ...newWorkspaces[id], // Overwrite with fresh top-level data
            };
        });
        // Also handle deletions
        Object.keys(state.workspaces).forEach(id => {
          if (!newWorkspaces[id]) {
            delete updatedWorkspaces[id];
          }
        })
        return { ...state, workspaces: updatedWorkspaces };
    }
    
    case 'SET_DAILY_LOGS':
        if (!action.payload?.docs) return state;
        return { ...state, dailyLogs: snapshotToRecord(action.payload) };

    case 'SET_AUDIT_LOGS':
        if (!action.payload?.docs) return state;
        return { ...state, auditLogs: snapshotToRecord(action.payload) };
        
    case 'SET_INVITES':
        if (!action.payload?.docs) return state;
        return { ...state, invites: snapshotToRecord(action.payload) };
    
    case 'SET_SCHEDULE_ITEMS':
        if (!action.payload?.docs) return { ...state, schedule_items: {} };
        return { ...state, schedule_items: snapshotToRecord<ScheduleItem>(action.payload) };

    default:
      return state;
  }
};


// Context
export const AccountContext = createContext<{ state: AccountState; dispatch: React.Dispatch<Action> } | null>(null);

// Provider
export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const { db } = useFirebase();
    const { state: appState } = useApp();
    const { activeAccount } = appState;
    const [state, dispatch] = useReducer(accountReducer, initialState);

    useEffect(() => {
        if (!activeAccount?.id || !db) {
            dispatch({ type: 'RESET_STATE' })
            return
        };

        const unsubs: (() => void)[] = []

        // 1. Listen to top-level collections for the active account
        if (activeAccount.accountType === 'organization') {
            const dailyLogsQuery = query(collection(db, "accounts", activeAccount.id, "dailyLogs"), orderBy("recordedAt", "desc"), limit(50))
            unsubs.push(onSnapshot(dailyLogsQuery, (snap) => dispatch({ type: 'SET_DAILY_LOGS', payload: snap })))

            const auditLogsQuery = query(collection(db, "accounts", activeAccount.id, "auditLogs"), orderBy("recordedAt", "desc"), limit(50))
            unsubs.push(onSnapshot(auditLogsQuery, (snap) => dispatch({ type: 'SET_AUDIT_LOGS', payload: snap })))
            
            const invitesQuery = query(collection(db, "accounts", activeAccount.id, "invites"), orderBy("invitedAt", "desc"))
            unsubs.push(onSnapshot(invitesQuery, (snap) => dispatch({ type: 'SET_INVITES', payload: snap })))

            const scheduleQuery = query(collection(db, "accounts", activeAccount.id, "schedule_items"), orderBy("createdAt", "desc"))
            unsubs.push(onSnapshot(scheduleQuery, (snap) => dispatch({ type: 'SET_SCHEDULE_ITEMS', payload: snap })))
        }
        
        const wsQuery = query(collection(db, "workspaces"), where("dimensionId", "==", activeAccount.id))
        unsubs.push(onSnapshot(wsQuery, (snap) => dispatch({ type: 'SET_WORKSPACES', payload: snap })))
        
        return () => {
            unsubs.forEach(unsub => unsub())
        }

    }, [activeAccount, db])

    return (
        <AccountContext.Provider value={{ state, dispatch }}>
        {children}
        </AccountContext.Provider>
    );
};
