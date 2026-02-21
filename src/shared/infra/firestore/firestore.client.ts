/**
 * @fileoverview Firestore Client Initializer.
 * This file is responsible for exporting the initialized Firestore instance.
 */
import { getFirestore, type Firestore } from 'firebase/firestore';
import { app } from '../app.client';

const db: Firestore = getFirestore(app);

export { db };
