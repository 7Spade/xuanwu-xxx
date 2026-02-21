/**
 * @fileoverview Firestore Data Converter.
 * Provides a generic FirestoreDataConverter for robust type safety between
 * the application's domain models and Firestore's data structure.
 * It automatically handles `id` field exclusion/inclusion.
 */
import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type WithFieldValue,
} from 'firebase/firestore';

export const createConverter = <T extends { id: string }>(): FirestoreDataConverter<T> => ({
  /**
   * Converts a domain object to a Firestore-compatible document data.
   * The `id` field is stripped from the object before sending it to Firestore,
   * as the ID is stored in the document path, not within the document itself.
   */
  toFirestore(modelObject: WithFieldValue<T>): DocumentData {
    const { id: _id, ...data } = modelObject;
    return data;
  },

  /**
   * Converts a Firestore document snapshot into a domain object.
   * The document's ID is automatically included in the resulting object.
   */
  fromFirestore(
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ): T {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
    } as T;
  },
});
