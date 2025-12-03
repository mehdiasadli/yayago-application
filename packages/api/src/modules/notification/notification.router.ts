import { procedures } from '../../procedures';
import { z } from 'zod';
import {
  GetNotificationInputSchema,
  NotificationOutputSchema,
  MarkNotificationReadInputSchema,
  MarkNotificationReadOutputSchema,
  MarkAllNotificationsReadInputSchema,
  MarkAllNotificationsReadOutputSchema,
  ArchiveNotificationInputSchema,
  ArchiveNotificationOutputSchema,
  DeleteNotificationInputSchema,
  DeleteNotificationOutputSchema,
  ListNotificationsInputSchema,
  ListNotificationsOutputSchema,
  ListOrgNotificationsInputSchema,
  ListOrgNotificationsOutputSchema,
  ListAllNotificationsInputSchema,
  ListAllNotificationsOutputSchema,
  GetNotificationStatsOutputSchema,
  GetUnreadCountOutputSchema,
  GetNotificationPreferencesOutputSchema,
  UpdateNotificationPreferencesInputSchema,
  UpdateNotificationPreferencesOutputSchema,
  RegisterPushSubscriptionInputSchema,
  RegisterPushSubscriptionOutputSchema,
  UnregisterPushSubscriptionInputSchema,
  UnregisterPushSubscriptionOutputSchema,
  ListPushSubscriptionsOutputSchema,
  SendBroadcastInputSchema,
  SendBroadcastOutputSchema,
} from '@yayago-app/validators';
import { NotificationService } from './notification.service';

export const notificationRouter = {
  // ============ USER NOTIFICATION ENDPOINTS ============

  // Get single notification
  get: procedures.protected
    .input(GetNotificationInputSchema)
    .output(NotificationOutputSchema)
    .handler(
      async ({ input, context: { session } }) => await NotificationService.getNotification(input, session.user.id)
    ),

  // List user's notifications
  list: procedures.protected
    .input(ListNotificationsInputSchema)
    .output(ListNotificationsOutputSchema)
    .handler(
      async ({ input, context: { session } }) => await NotificationService.listNotifications(input, session.user.id)
    ),

  // Mark single notification as read
  markAsRead: procedures.protected
    .input(MarkNotificationReadInputSchema)
    .output(MarkNotificationReadOutputSchema)
    .handler(async ({ input, context: { session } }) => await NotificationService.markAsRead(input, session.user.id)),

  // Mark all notifications as read
  markAllAsRead: procedures.protected
    .input(MarkAllNotificationsReadInputSchema)
    .output(MarkAllNotificationsReadOutputSchema)
    .handler(
      async ({ input, context: { session } }) => await NotificationService.markAllAsRead(input, session.user.id)
    ),

  // Archive notification
  archive: procedures.protected
    .input(ArchiveNotificationInputSchema)
    .output(ArchiveNotificationOutputSchema)
    .handler(
      async ({ input, context: { session } }) => await NotificationService.archiveNotification(input, session.user.id)
    ),

  // Delete notification
  delete: procedures.protected
    .input(DeleteNotificationInputSchema)
    .output(DeleteNotificationOutputSchema)
    .handler(
      async ({ input, context: { session } }) => await NotificationService.deleteNotification(input, session.user.id)
    ),

  // Get notification stats
  getStats: procedures.protected
    .input(z.object({}))
    .output(GetNotificationStatsOutputSchema)
    .handler(async ({ context: { session } }) => await NotificationService.getStats(session.user.id)),

  // Get unread count (lightweight)
  getUnreadCount: procedures.protected
    .input(z.object({}))
    .output(GetUnreadCountOutputSchema)
    .handler(async ({ context: { session } }) => await NotificationService.getUnreadCount(session.user.id)),

  // ============ NOTIFICATION PREFERENCES ============

  // Get preferences
  getPreferences: procedures.protected
    .input(z.object({}))
    .output(GetNotificationPreferencesOutputSchema)
    .handler(async ({ context: { session } }) => await NotificationService.getPreferences(session.user.id)),

  // Update preferences
  updatePreferences: procedures.protected
    .input(UpdateNotificationPreferencesInputSchema)
    .output(UpdateNotificationPreferencesOutputSchema)
    .handler(
      async ({ input, context: { session } }) => await NotificationService.updatePreferences(input, session.user.id)
    ),

  // ============ PUSH SUBSCRIPTIONS ============

  // Register push subscription
  registerPush: procedures.protected
    .input(RegisterPushSubscriptionInputSchema)
    .output(RegisterPushSubscriptionOutputSchema)
    .handler(
      async ({ input, context: { session } }) =>
        await NotificationService.registerPushSubscription(input, session.user.id)
    ),

  // Unregister push subscription
  unregisterPush: procedures.protected
    .input(UnregisterPushSubscriptionInputSchema)
    .output(UnregisterPushSubscriptionOutputSchema)
    .handler(
      async ({ input, context: { session } }) =>
        await NotificationService.unregisterPushSubscription(input, session.user.id)
    ),

  // List push subscriptions
  listPushSubscriptions: procedures.protected
    .input(z.object({}))
    .output(ListPushSubscriptionsOutputSchema)
    .handler(async ({ context: { session } }) => await NotificationService.listPushSubscriptions(session.user.id)),

  // ============ PARTNER ENDPOINTS ============

  // List organization notifications
  listOrgNotifications: procedures.protected
    .input(ListOrgNotificationsInputSchema)
    .output(ListOrgNotificationsOutputSchema)
    .handler(
      async ({ input, context: { session } }) => await NotificationService.listOrgNotifications(input, session.user.id)
    ),

  // ============ ADMIN ENDPOINTS ============

  // List all notifications (admin)
  listAll: procedures
    .withRoles('admin', 'moderator')
    .input(ListAllNotificationsInputSchema)
    .output(ListAllNotificationsOutputSchema)
    .handler(async ({ input }) => await NotificationService.listAllNotifications(input)),

  // Send broadcast notification (admin)
  sendBroadcast: procedures.admin
    .input(SendBroadcastInputSchema)
    .output(SendBroadcastOutputSchema)
    .handler(async ({ input }) => await NotificationService.sendBroadcast(input)),
};

export type NotificationRouter = typeof notificationRouter;

export default notificationRouter;
