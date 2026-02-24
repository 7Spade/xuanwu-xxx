// account-user.notification — Personal push notification (FCM Layer 3)
// Receives routed notifications from account-governance.notification-router,
// filters content by account tag (internal/external), and pushes via FCM.
export { deliverNotification, type NotificationDeliveryInput, type DeliveryResult } from './_delivery'
export { subscribeToNotifications, markNotificationRead } from './_queries'
export { useUserNotifications } from './_hooks/use-user-notifications'
export { NotificationBadge } from './_components/notification-badge'
export { NotificationList } from './_components/notification-list'
