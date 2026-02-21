/**
 * @fileoverview Firebase Client Initializer.
 * This file is responsible for initializing the Firebase app singleton
 * and exporting the main app instance.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { firebaseConfig } from "./firebase.config";

// Singleton Pattern: Initialize Firebase only once.
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export { app };
