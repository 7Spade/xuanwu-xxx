"use client";

import { createContext, useContext, type ReactNode } from 'react';
import { type FirebaseApp } from 'firebase/app';
import { type Firestore } from 'firebase/firestore';
import { type Auth } from 'firebase/auth';
import { type FirebaseStorage } from 'firebase/storage';
import { app } from '@/shared/infra/app.client';
import { db } from '@/shared/infra/firestore/firestore.client';
import { auth } from '@/shared/infra/auth/auth.client';
import { storage } from '@/shared/infra/storage/storage.client';

interface FirebaseContextType {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export function FirebaseClientProvider({ children }: { children: ReactNode; }) {
  const value = { app, db, auth, storage };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error("useFirebase must be used within FirebaseClientProvider");
  return context;
};
