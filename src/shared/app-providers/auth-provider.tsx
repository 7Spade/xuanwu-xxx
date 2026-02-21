"use client";

import {type ReactNode} from 'react';
import type React from 'react';
import { createContext, useReducer, useContext, useEffect } from 'react';
import { type User as FirebaseUser } from "firebase/auth";
import { authAdapter } from '@/shared/infra/auth/auth.adapter';
import { type Account } from '@/shared/types';

interface AuthState {
  user: Account | null;
  authInitialized: boolean;
}

type Action =
  | { type: 'SET_AUTH_STATE'; payload: { user: Account | null, initialized: boolean } }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<Account> };

const authReducer = (state: AuthState, action: Action): AuthState => {
  switch (action.type) {
    case 'SET_AUTH_STATE':
      return { ...state, user: action.payload.user, authInitialized: action.payload.initialized };
    case 'UPDATE_USER_PROFILE':
      if (!state.user) return state;
      // This action only updates the client-side state. The actual update happens in the adapter.
      // We also need to trigger the Firebase SDK update.
      if (authAdapter.getCurrentUser()) {
          authAdapter.updateProfile(authAdapter.getCurrentUser()!, { displayName: action.payload.name });
      }
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  authInitialized: false,
};

const AuthContext = createContext<{ 
  state: AuthState; 
  dispatch: React.Dispatch<Action>;
  logout: () => Promise<void>;
} | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const unsubscribe = authAdapter.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        dispatch({
          type: 'SET_AUTH_STATE',
          payload: {
            user: { 
              id: firebaseUser.uid, 
              name: firebaseUser.displayName || 'Dimension Member', 
              email: firebaseUser.email || '',
              accountType: 'user',
            },
            initialized: true,
          }
        });
      } else {
        dispatch({ type: 'SET_AUTH_STATE', payload: { user: null, initialized: true } });
      }
    });
    return () => unsubscribe();
  }, []);
  
  const logout = async () => {
    await authAdapter.signOut();
  };

  return (
    <AuthContext.Provider value={{ state, dispatch, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
