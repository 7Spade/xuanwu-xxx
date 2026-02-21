/**
 * @fileoverview Firebase Authentication Adapter.
 * This file contains all functions related to Firebase Authentication services,
 * serving as a single point of interaction for the UI layer with auth logic.
 */
import { auth } from './auth.client';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';

// By exporting the functions directly, we create a clean, testable adapter.
export const authAdapter = {
  signInWithEmailAndPassword: (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass),
  createUserWithEmailAndPassword: (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass),
  sendPasswordResetEmail: (email: string) => sendPasswordResetEmail(auth, email),
  signInAnonymously: () => signInAnonymously(auth),
  updateProfile: (user: FirebaseUser, profile: { displayName?: string, photoURL?: string }) => updateProfile(user, profile),
  signOut: () => signOut(auth),
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => onAuthStateChanged(auth, callback),
  getCurrentUser: () => auth.currentUser,
};
