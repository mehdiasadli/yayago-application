import prisma from '@yayago-app/db';
import { ORPCError } from '@orpc/server';
import type {
  GetNotificationInputType,
  NotificationOutputType,
  MarkNotificationReadInputType,
  MarkNotificationReadOutputType,
  MarkAllNotificationsReadInputType,
  MarkAllNotificationsReadOutputType,
  ArchiveNotificationInputType,
  ArchiveNotificationOutputType,
  DeleteNotificationInputType,
  DeleteNotificationOutputType,
  ListNotificationsInputType,
  ListNotificationsOutputType,
  ListOrgNotificationsInputType,
  ListOrgNotificationsOutputType,
  ListAllNotificationsInputType,
  ListAllNotificationsOutputType,
  GetNotificationStatsOutputType,
  GetUnreadCountOutputType,
  GetNotificationPreferencesOutputType,
  UpdateNotificationPreferencesInputType,
  UpdateNotificationPreferencesOutputType,
  RegisterPushSubscriptionInputType,
  RegisterPushSubscriptionOutputType,
  UnregisterPushSubscriptionInputType,
  UnregisterPushSubscriptionOutputType,
  ListPushSubscriptionsOutputType,
  SendBroadcastInputType,
  SendBroadcastOutputType,
  NotificationCategory,
  NotificationPriority,
} from '@yayago-app/validators';

// Re-export helpers for use in other services
export { NotificationHelpers } from './notification.helpers';

// ============ HELPER: Get user's organization ============
async function getPartnerOrganizationId(userId: string): Promise<string> {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organization: {
        status: 'ACTIVE',
        deletedAt: null,
      },
    },
    select: { organizationId: true },
  });

  if (!member) {
    throw new ORPCError('FORBIDDEN', {
      message: 'No active organization membership found',
    });
  }

  return member.organizationId;
}

// ============ HELPER: Transform notification to output ============
function transformNotification(notification: any): NotificationOutputType {
  return {
    id: notification.id,
    createdAt: notification.createdAt,
    expiresAt: notification.expiresAt,
    category: notification.category,
    type: notification.type,
    priority: notification.priority,
    title: notification.title,
    body: notification.body,
    imageUrl: notification.imageUrl,
    actionUrl: notification.actionUrl,
    actionLabel: notification.actionLabel,
    isRead: notification.isRead,
    readAt: notification.readAt,
    isArchived: notification.isArchived,
    bookingId: notification.bookingId,
    listingId: notification.listingId,
    reviewId: notification.reviewId,
    organizationId: notification.organizationId,
    metadata: notification.metadata as Record<string, any> | null,
    actor: notification.actor
      ? {
          id: notification.actor.id,
          name: notification.actor.name || 'Unknown',
          image: notification.actor.image,
        }
      : null,
    groupKey: notification.groupKey,
  };
}

export class NotificationService {
  // ============ GET SINGLE NOTIFICATION ============
  static async getNotification(input: GetNotificationInputType, userId: string): Promise<NotificationOutputType> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: input.notificationId,
        userId,
      },
      include: {
        actor: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!notification) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Notification not found',
      });
    }

    return transformNotification(notification);
  }

  // ============ MARK AS READ ============
  static async markAsRead(
    input: MarkNotificationReadInputType,
    userId: string
  ): Promise<MarkNotificationReadOutputType> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: input.notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Notification not found',
      });
    }

    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      id: updated.id,
      isRead: updated.isRead,
      readAt: updated.readAt,
    };
  }

  // ============ MARK ALL AS READ ============
  static async markAllAsRead(
    input: MarkAllNotificationsReadInputType,
    userId: string
  ): Promise<MarkAllNotificationsReadOutputType> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        ...(input.category && { category: input.category }),
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }

  // ============ ARCHIVE NOTIFICATION ============
  static async archiveNotification(
    input: ArchiveNotificationInputType,
    userId: string
  ): Promise<ArchiveNotificationOutputType> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: input.notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Notification not found',
      });
    }

    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      isArchived: updated.isArchived,
      archivedAt: updated.archivedAt,
    };
  }

  // ============ DELETE NOTIFICATION ============
  static async deleteNotification(
    input: DeleteNotificationInputType,
    userId: string
  ): Promise<DeleteNotificationOutputType> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: input.notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Notification not found',
      });
    }

    await prisma.notification.delete({
      where: { id: notification.id },
    });

    return {
      id: notification.id,
      deleted: true,
    };
  }

  // ============ LIST USER NOTIFICATIONS ============
  static async listNotifications(
    input: ListNotificationsInputType,
    userId: string
  ): Promise<ListNotificationsOutputType> {
    const { page, take, category, type, isRead, isArchived, priority } = input;

    const where = {
      userId,
      ...(category && { category }),
      ...(type && { type }),
      ...(isRead !== undefined && { isRead }),
      ...(isArchived !== undefined && { isArchived }),
      ...(priority && { priority }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, name: true, image: true },
          },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      items: notifications.map(transformNotification),
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ LIST ORGANIZATION NOTIFICATIONS ============
  static async listOrgNotifications(
    input: ListOrgNotificationsInputType,
    userId: string
  ): Promise<ListOrgNotificationsOutputType> {
    const organizationId = await getPartnerOrganizationId(userId);
    const { page, take, category, type, isRead, isArchived } = input;

    const where = {
      organizationId,
      ...(category && { category }),
      ...(type && { type }),
      ...(isRead !== undefined && { isRead }),
      ...(isArchived !== undefined && { isArchived }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, name: true, image: true },
          },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      items: notifications.map(transformNotification),
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ LIST ALL NOTIFICATIONS (Admin) ============
  static async listAllNotifications(input: ListAllNotificationsInputType): Promise<ListAllNotificationsOutputType> {
    const { page, take, userId, organizationId, category, type, priority, dateFrom, dateTo } = input;

    const where = {
      ...(userId && { userId }),
      ...(organizationId && { organizationId }),
      ...(category && { category }),
      ...(type && { type }),
      ...(priority && { priority }),
      ...(dateFrom && { createdAt: { gte: dateFrom } }),
      ...(dateTo && { createdAt: { lte: dateTo } }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, name: true, image: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
          organization: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      items: notifications.map((n) => ({
        ...transformNotification(n),
        user: n.user
          ? {
              id: n.user.id,
              name: n.user.name || 'Unknown',
              email: n.user.email || '',
            }
          : null,
        organization: n.organization
          ? {
              id: n.organization.id,
              name: n.organization.name,
              slug: n.organization.slug,
            }
          : null,
      })),
      pagination: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // ============ GET NOTIFICATION STATS ============
  static async getStats(userId: string): Promise<GetNotificationStatsOutputType> {
    const [total, unread, byCategory, byPriority] = await Promise.all([
      prisma.notification.count({ where: { userId, isArchived: false } }),
      prisma.notification.count({ where: { userId, isRead: false, isArchived: false } }),
      prisma.notification.groupBy({
        by: ['category'],
        where: { userId, isArchived: false },
        _count: { category: true },
      }),
      prisma.notification.groupBy({
        by: ['priority'],
        where: { userId, isArchived: false },
        _count: { priority: true },
      }),
    ]);

    const categoryMap: Record<NotificationCategory, number> = {
      BOOKING: 0,
      LISTING: 0,
      REVIEW: 0,
      ORGANIZATION: 0,
      FINANCIAL: 0,
      FAVORITE: 0,
      VERIFICATION: 0,
      SYSTEM: 0,
      PROMOTIONAL: 0,
      SECURITY: 0,
    };

    byCategory.forEach((c) => {
      categoryMap[c.category as NotificationCategory] = c._count.category;
    });

    const priorityMap: Record<NotificationPriority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    };

    byPriority.forEach((p) => {
      priorityMap[p.priority as NotificationPriority] = p._count.priority;
    });

    return {
      total,
      unread,
      byCategory: categoryMap,
      byPriority: priorityMap,
    };
  }

  // ============ GET UNREAD COUNT ============
  static async getUnreadCount(userId: string): Promise<GetUnreadCountOutputType> {
    const [count, byCategory] = await Promise.all([
      prisma.notification.count({
        where: { userId, isRead: false, isArchived: false },
      }),
      prisma.notification.groupBy({
        by: ['category'],
        where: { userId, isRead: false, isArchived: false },
        _count: { category: true },
      }),
    ]);

    const categoryMap: Record<NotificationCategory, number> = {
      BOOKING: 0,
      LISTING: 0,
      REVIEW: 0,
      ORGANIZATION: 0,
      FINANCIAL: 0,
      FAVORITE: 0,
      VERIFICATION: 0,
      SYSTEM: 0,
      PROMOTIONAL: 0,
      SECURITY: 0,
    };

    byCategory.forEach((c) => {
      categoryMap[c.category as NotificationCategory] = c._count.category;
    });

    return {
      count,
      byCategory: categoryMap,
    };
  }

  // ============ NOTIFICATION PREFERENCES ============

  static async getPreferences(userId: string): Promise<GetNotificationPreferencesOutputType> {
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if not exists
    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return {
      id: prefs.id,
      userId: prefs.userId,
      createdAt: prefs.createdAt,
      updatedAt: prefs.updatedAt,
      bookingEnabled: prefs.bookingEnabled,
      listingEnabled: prefs.listingEnabled,
      reviewEnabled: prefs.reviewEnabled,
      organizationEnabled: prefs.organizationEnabled,
      financialEnabled: prefs.financialEnabled,
      favoriteEnabled: prefs.favoriteEnabled,
      verificationEnabled: prefs.verificationEnabled,
      systemEnabled: prefs.systemEnabled,
      promotionalEnabled: prefs.promotionalEnabled,
      securityEnabled: prefs.securityEnabled,
      emailForHigh: prefs.emailForHigh,
      emailForMedium: prefs.emailForMedium,
      emailForLow: prefs.emailForLow,
      pushForHigh: prefs.pushForHigh,
      pushForMedium: prefs.pushForMedium,
      pushForLow: prefs.pushForLow,
      smsForHigh: prefs.smsForHigh,
      smsForMedium: prefs.smsForMedium,
      smsForLow: prefs.smsForLow,
      quietHoursEnabled: prefs.quietHoursEnabled,
      quietHoursStart: prefs.quietHoursStart || undefined,
      quietHoursEnd: prefs.quietHoursEnd || undefined,
      quietHoursTimezone: prefs.quietHoursTimezone || undefined,
      emailDigestEnabled: prefs.emailDigestEnabled,
      emailDigestFrequency: (prefs.emailDigestFrequency as 'daily' | 'weekly') || undefined,
    };
  }

  static async updatePreferences(
    input: UpdateNotificationPreferencesInputType,
    userId: string
  ): Promise<UpdateNotificationPreferencesOutputType> {
    const prefs = await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...input,
      },
      update: input,
    });

    return {
      id: prefs.id,
      userId: prefs.userId,
      createdAt: prefs.createdAt,
      updatedAt: prefs.updatedAt,
      bookingEnabled: prefs.bookingEnabled,
      listingEnabled: prefs.listingEnabled,
      reviewEnabled: prefs.reviewEnabled,
      organizationEnabled: prefs.organizationEnabled,
      financialEnabled: prefs.financialEnabled,
      favoriteEnabled: prefs.favoriteEnabled,
      verificationEnabled: prefs.verificationEnabled,
      systemEnabled: prefs.systemEnabled,
      promotionalEnabled: prefs.promotionalEnabled,
      securityEnabled: prefs.securityEnabled,
      emailForHigh: prefs.emailForHigh,
      emailForMedium: prefs.emailForMedium,
      emailForLow: prefs.emailForLow,
      pushForHigh: prefs.pushForHigh,
      pushForMedium: prefs.pushForMedium,
      pushForLow: prefs.pushForLow,
      smsForHigh: prefs.smsForHigh,
      smsForMedium: prefs.smsForMedium,
      smsForLow: prefs.smsForLow,
      quietHoursEnabled: prefs.quietHoursEnabled,
      quietHoursStart: prefs.quietHoursStart || undefined,
      quietHoursEnd: prefs.quietHoursEnd || undefined,
      quietHoursTimezone: prefs.quietHoursTimezone || undefined,
      emailDigestEnabled: prefs.emailDigestEnabled,
      emailDigestFrequency: (prefs.emailDigestFrequency as 'daily' | 'weekly') || undefined,
    };
  }

  // ============ PUSH SUBSCRIPTIONS ============

  static async registerPushSubscription(
    input: RegisterPushSubscriptionInputType,
    userId: string
  ): Promise<RegisterPushSubscriptionOutputType> {
    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findFirst({
      where: {
        userId,
        endpoint: input.endpoint,
      },
    });

    if (existing) {
      // Update existing subscription
      const updated = await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          p256dhKey: input.p256dhKey,
          authKey: input.authKey,
          deviceType: input.deviceType,
          deviceName: input.deviceName,
          isActive: true,
        },
      });
      return { id: updated.id, createdAt: updated.createdAt };
    }

    // Create new subscription
    const subscription = await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: input.endpoint,
        p256dhKey: input.p256dhKey,
        authKey: input.authKey,
        deviceType: input.deviceType,
        deviceName: input.deviceName,
      },
    });

    return { id: subscription.id, createdAt: subscription.createdAt };
  }

  static async unregisterPushSubscription(
    input: UnregisterPushSubscriptionInputType,
    userId: string
  ): Promise<UnregisterPushSubscriptionOutputType> {
    const result = await prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint: input.endpoint,
      },
    });

    return { deleted: result.count > 0 };
  }

  static async listPushSubscriptions(userId: string): Promise<ListPushSubscriptionsOutputType> {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions.map((s) => ({
      id: s.id,
      endpoint: s.endpoint,
      deviceType: s.deviceType,
      deviceName: s.deviceName,
      isActive: s.isActive,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  // ============ ADMIN: SEND BROADCAST ============

  static async sendBroadcast(input: SendBroadcastInputType): Promise<SendBroadcastOutputType> {
    const { title, body, actionUrl, actionLabel, targetRole, targetOrganizationId, priority, category, type, sendAt } =
      input;

    // If scheduled for later, store as pending (would need a job queue in production)
    if (sendAt && sendAt > new Date()) {
      // In a real implementation, this would be stored in a job queue
      // For now, we'll create the notification anyway
    }

    // Build targeting criteria
    let targetUsers: { id: string }[] = [];

    if (targetOrganizationId) {
      // Target all members of a specific organization
      const members = await prisma.member.findMany({
        where: { organizationId: targetOrganizationId },
        select: { userId: true },
      });
      targetUsers = members.map((m) => ({ id: m.userId }));
    } else if (targetRole && targetRole !== 'all') {
      // Target users by role
      if (targetRole === 'partner') {
        // Partners are users who have organization memberships
        const members = await prisma.member.findMany({
          select: { userId: true },
          distinct: ['userId'],
        });
        targetUsers = members.map((m) => ({ id: m.userId }));
      } else {
        // Target by user role (admin, moderator, user)
        targetUsers = await prisma.user.findMany({
          where: { role: targetRole as any, deletedAt: null },
          select: { id: true },
        });
      }
    } else {
      // Target all users
      targetUsers = await prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true },
      });
    }

    // Create notifications for all target users
    const notifications = await prisma.notification.createMany({
      data: targetUsers.map((user) => ({
        category,
        type,
        priority,
        userId: user.id,
        title,
        body,
        actionUrl,
        actionLabel,
      })),
    });

    return {
      notificationCount: notifications.count,
      scheduledFor: sendAt && sendAt > new Date() ? sendAt : null,
    };
  }
}
