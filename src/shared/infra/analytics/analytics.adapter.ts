/**
 * @fileoverview Firebase Analytics Adapter.
 * This file contains functions for logging custom events to Firebase Analytics,
 * allowing for detailed tracking of user behavior and application performance.
 */
import { analytics } from './analytics.client';
import { logEvent } from 'firebase/analytics';

/**
 * Logs a custom event to Firebase Analytics.
 * @param eventName The name of the event to log.
 * @param eventParams Optional parameters to associate with the event.
 */
export const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  } else {
    console.log(`Analytics not initialized. Event not logged: ${eventName}`, eventParams);
  }
};
