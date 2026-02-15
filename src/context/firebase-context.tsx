"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';
import { app } from '@/infra/firebase/app.client';
import { db } from '@/infra/firebase/firestore/firestore.client';
import { auth } from '@/infra/firebase/auth/auth.client';
import { storage } from '@/infra/firebase/storage/storage.client';

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
