/**
 * @fileoverview Firebase Analytics Client Initializer.
 * This file is responsible for initializing and exporting the Firebase Analytics instance,
 * making it available for use throughout the application for event logging.
 * It ensures Analytics is only initialized on the client side.
 */
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { app } from '../app.client';

let analytics: Analytics | null = null;

// Ensure Analytics is only initialized in the browser.
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
