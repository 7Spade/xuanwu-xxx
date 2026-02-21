/**
 * @fileoverview Firebase Cloud Messaging (FCM) Client Initializer.
 * This file is responsible for initializing the FCM service and handling
 * background message processing and token registration.
 * It ensures Messaging is only initialized on the client side.
 */
import { getMessaging, type Messaging } from 'firebase/messaging';
import { app } from '../app.client';

let messaging: Messaging | null = null;

// Ensure Messaging is only initialized in the browser and is supported.
if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.error('Firebase Messaging is not supported in this browser.', err);
  }
}

export { messaging };
