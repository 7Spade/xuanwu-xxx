/**
 * @fileoverview Firestore Read Adapter.
 * This file contains all read-only operations for Firestore, such as getDoc,
 * getDocs, and creating real-time listeners with onSnapshot.
 */

import {
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  type DocumentData,
  type Query,
  type Unsubscribe,
  type FirestoreDataConverter,
} from 'firebase/firestore';
import { db } from './firestore.client';

/**
 * Fetches a single document from Firestore.
 * @param path The full path to the document (e.g., 'collection/docId').
 * @param converter An optional FirestoreDataConverter for type safety.
 * @returns A promise that resolves to the document data or null if not found.
 */
export const getDocument = async <T>(
  path: string,
  converter?: FirestoreDataConverter<T>
): Promise<T | null> => {
  if (converter) {
    const docRef = doc(db, path).withConverter(converter);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  const docRef = doc(db, path);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as T) : null;
};

/**
 * Fetches multiple documents from a collection that match a query.
 * @param query The Firestore query to execute.
 * @returns A promise that resolves to an array of document data.
 */
export const getDocuments = async <T>(query: Query<T>): Promise<T[]> => {
  const querySnapshot = await getDocs(query);
  return querySnapshot.docs.map((doc) => doc.data());
};

/**
 * Creates a real-time subscription to a Firestore query.
 * @param query The Firestore query to listen to.
 * @param onUpdate A callback function that fires every time the query results change.
 * @returns An unsubscribe function to detach the listener.
 */
export const createSubscription = <T>(
  query: Query<T, DocumentData>,
  onUpdate: (data: T[]) => void
): Unsubscribe => {
  return onSnapshot(query, (querySnapshot) => {
    const data = querySnapshot.docs.map((doc) => doc.data());
    onUpdate(data);
  });
};
