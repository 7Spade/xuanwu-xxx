// Firebase repositories - all data access functions
export * from "./firestore/repositories";

// Firebase facades - high-level business operations
export { uploadDailyPhoto } from "./storage/storage.facade";

// Firebase clients - for use in providers and initialization
export { app as firebaseApp } from "./app.client";
export { auth } from "./auth/auth.client";
export { db } from "./firestore/firestore.client";
export { storage } from "./storage/storage.client";

