/**
 * @fileoverview Firestore Write Adapter.
 * This file contains all write operations for Firestore, such as addDoc,
 * setDoc, updateDoc, and deleteDoc, ensuring a clear separation of concerns.
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  type WithFieldValue,
  type DocumentData,
  type FirestoreDataConverter,
} from 'firebase/firestore';
import { db } from './firestore.client';

/**
 * Adds a new document to a collection with a Firestore-generated ID.
 * @param path The path to the collection.
 * @param data The data for the new document.
 * @param converter An optional FirestoreDataConverter for type safety.
 * @returns A promise that resolves to the new document's reference.
 */
export const addDocument = <T>(
  path: string,
  data: WithFieldValue<T>,
  converter?: FirestoreDataConverter<T>
) => {
  if (converter) {
    const collRef = collection(db, path).withConverter(converter);
    return addDoc(collRef, data);
  }

  return addDoc(collection(db, path), data as WithFieldValue<DocumentData>);
};

/**
 * Creates or overwrites a single document with a specific ID.
 * @param path The full path to the document (e.g., 'collection/docId').
 * @param data The data to set in the document.
 * @param converter An optional FirestoreDataConverter for type safety.
 * @returns A promise that resolves when the write is complete.
 */
export const setDocument = <T>(
  path: string,
  data: WithFieldValue<T>,
  converter?: FirestoreDataConverter<T>
) => {
  if (converter) {
    const docRef = doc(db, path).withConverter(converter);
    return setDoc(docRef, data);
  }

  return setDoc(doc(db, path), data as WithFieldValue<DocumentData>);
};

/**
 * Updates fields in a document without overwriting the entire document.
 * @param path The full path to the document.
 * @param data An object containing the fields and values to update.
 * @returns A promise that resolves when the write is complete.
 */
export const updateDocument = (path: string, data: DocumentData) => {
  const docRef = doc(db, path);
  return updateDoc(docRef, data);
};

/**
 * Deletes a single document.
 * @param path The full path to the document to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteDocument = (path: string) => {
  const docRef = doc(db, path);
  return deleteDoc(docRef);
};