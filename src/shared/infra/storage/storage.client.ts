/**
 * @fileoverview Cloud Storage Client Initializer.
 * This file is responsible for exporting the initialized Storage instance.
 */
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { app } from '../app.client';

const storage: FirebaseStorage = getStorage(app);

export { storage };
