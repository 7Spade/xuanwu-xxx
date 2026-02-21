import type { QuerySnapshot } from "firebase/firestore"

/**
 * Converts a Firestore QuerySnapshot into a Record keyed by document ID.
 * Shared utility used by context reducers that process Firestore snapshots.
 */
export function snapshotToRecord<T extends { id: string }>(snap: QuerySnapshot): Record<string, T> {
  const record: Record<string, T> = {}
  if (snap && typeof snap.forEach === "function") {
    snap.forEach((doc) => {
      record[doc.id] = { id: doc.id, ...doc.data() } as T
    })
  }
  return record
}
