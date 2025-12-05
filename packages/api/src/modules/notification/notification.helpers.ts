import prisma from '@yayago-app/db';
import type { NotificationCategory, NotificationType, NotificationPriority } from '@yayago-app/validators';

// ============ INTERNAL: Create notification record ============

async function createNotification(params: {
  category: NotificationCategory;
  type: NotificationType;
  priority?: NotificationPriority;
  userId?: string;
  organizationId?: string;
  targetRole?: string;
  targetOrgRole?: string;
  bookingId?: string;
  listingId?: string;
  reviewId?: string;
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  actorId?: string;
  groupKey?: string;
  expiresAt?: Date;
}) {
  return prisma.notification.create({
    data: {
      category: params.category,
      type: params.type,
      priority: params.priority || 'MEDIUM',
      userId: params.userId,
      organizationId: params.organizationId,
      targetRole: params.targetRole,
      targetOrgRole: params.targetOrgRole,
      bookingId: params.bookingId,
      listingId: params.listingId,
      reviewId: params.reviewId,
      title: params.title,
      body: params.body,
      imageUrl: params.imageUrl,
      actionUrl: params.actionUrl,
      actionLabel: params.actionLabel,
      metadata: params.metadata,
      actorId: params.actorId,
      groupKey: params.groupKey,
      expiresAt: params.expiresAt,
    },
  });
}

// ============ BOOKING NOTIFICATIONS ============

export const BookingNotifications = {
  /**
   * Notify host about new booking request
   */
  async created(params: {
    bookingId: string;
    hostUserId: string;
    renterName: string;
    listingTitle: string;
    listingId: string;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    currency: string;
    actorId?: string;
  }) {
    return createNotification({
      category: 'BOOKING',
      type: 'BOOKING_CREATED',
      priority: 'HIGH',
      userId: params.hostUserId,
      bookingId: params.bookingId,
      listingId: params.listingId,
      title: 'New Booking Request',
      body: `${params.renterName} wants to book "${params.listingTitle}"`,
      actionUrl: `/bookings/${params.bookingId}`,
      actionLabel: 'View Request',
      metadata: {
        renterName: params.renterName,
        startDate: params.startDate,
        endDate: params.endDate,
        totalPrice: params.totalPrice,
        currency: params.currency,
      },
      actorId: params.actorId,
      groupKey: `booking:${params.bookingId}`,
    });
  },

  /**
   * Notify renter that booking was approved
   */
  async approved(params: {
    bookingId: string;
    renterUserId: string;
    listingTitle: string;
    listingId: string;
    startDate: Date;
    actorId?: string;
  }) {
    return createNotification({
      category: 'BOOKING',
      type: 'BOOKING_APPROVED',
      priority: 'HIGH',
      userId: params.renterUserId,
      bookingId: params.bookingId,
      listingId: params.listingId,
      title: 'Booking Approved!',
      body: `Your booking for "${params.listingTitle}" has been approved`,
      actionUrl: `/bookings/${params.bookingId}`,
      actionLabel: 'View Booking',
      metadata: { startDate: params.startDate },
      actorId: params.actorId,
      groupKey: `booking:${params.bookingId}`,
    });
  },

  /**
   * Notify renter that booking was rejected
   */
  async rejected(params: {
    bookingId: string;
    renterUserId: string;
    listingTitle: string;
    listingId: string;
    reason?: string;
    actorId?: string;
  }) {
    return createNotification({
      category: 'BOOKING',
      type: 'BOOKING_REJECTED',
      priority: 'HIGH',
      userId: params.renterUserId,
      bookingId: params.bookingId,
      listingId: params.listingId,
      title: 'Booking Not Approved',
      body: `Your booking for "${params.listingTitle}" was not approved${params.reason ? `: ${params.reason}` : ''}`,
      actionUrl: `/bookings/${params.bookingId}`,
      actionLabel: 'View Details',
      metadata: { reason: params.reason },
      actorId: params.actorId,
      groupKey: `booking:${params.bookingId}`,
    });
  },

  /**
   * Notify about booking cancellation
   */
  async cancelled(params: {
    bookingId: string;
    notifyUserId: string;
    listingTitle: string;
    listingId: string;
    cancelledBy: 'user' | 'host';
    reason?: string;
    actorId?: string;
  }) {
    return createNotification({
      category: 'BOOKING',
      type: params.cancelledBy === 'user' ? 'BOOKING_CANCELLED_BY_USER' : 'BOOKING_CANCELLED_BY_HOST',
      priority: 'HIGH',
      userId: params.notifyUserId,
      bookingId: params.bookingId,
      listingId: params.listingId,
      title: 'Booking Cancelled',
      body: `Booking for "${params.listingTitle}" has been cancelled`,
      actionUrl: `/bookings/${params.bookingId}`,
      actionLabel: 'View Details',
      metadata: { cancelledBy: params.cancelledBy, reason: params.reason },
      actorId: params.actorId,
      groupKey: `booking:${params.bookingId}`,
    });
  },

  /**
   * Notify that trip has started
   */
  async started(params: {
    bookingId: string;
    userId: string;
    listingTitle: string;
    listingId: string;
    endDate: Date;
  }) {
    return createNotification({
      category: 'BOOKING',
      type: 'BOOKING_STARTED',
      priority: 'MEDIUM',
      userId: params.userId,
      bookingId: params.bookingId,
      listingId: params.listingId,
      title: 'Your Trip Has Started',
      body: `Enjoy your rental of "${params.listingTitle}"!`,
      actionUrl: `/bookings/${params.bookingId}`,
      actionLabel: 'View Trip',
      metadata: { endDate: params.endDate },
      groupKey: `booking:${params.bookingId}`,
    });
  },

  /**
   * Notify that trip is completed
   */
  async completed(params: {
    bookingId: string;
    userId: string;
    listingTitle: string;
    listingId: string;
  }) {
    return createNotification({
      category: 'BOOKING',
      type: 'BOOKING_COMPLETED',
      priority: 'MEDIUM',
      userId: params.userId,
      bookingId: params.bookingId,
      listingId: params.listingId,
      title: 'Trip Completed',
      body: `Your rental of "${params.listingTitle}" is complete. How was your experience?`,
      actionUrl: `/bookings/${params.bookingId}/review`,
      actionLabel: 'Leave Review',
      groupKey: `booking:${params.bookingId}`,
    });
  },

  /**
   * Send upcoming trip reminder
   */
  async reminder(params: {
    bookingId: string;
    userId: string;
    listingTitle: string;
    listingId: string;
    startDate: Date;
    hoursUntil: number;
  }) {
    return createNotification({
      category: 'BOOKING',
      type: 'BOOKING_REMINDER',
      priority: 'MEDIUM',
      userId: params.userId,
      bookingId: params.bookingId,
      listingId: params.listingId,
      title: 'Upcoming Trip Reminder',
      body: `Your rental of "${params.listingTitle}" starts in ${params.hoursUntil} hours`,
      actionUrl: `/bookings/${params.bookingId}`,
      actionLabel: 'View Details',
      metadata: { startDate: params.startDate, hoursUntil: params.hoursUntil },
      groupKey: `booking:${params.bookingId}`,
    });
  },

  /**
   * Notify about overdue return
   */
  async overdue(params: {
    bookingId: string;
    hostUserId: string;
    renterName: string;
    listingTitle: string;
    listingId: string;
    hoursOverdue: number;
  }) {
    return createNotification({
      category: 'BOOKING',
      type: 'BOOKING_OVERDUE',
      priority: 'URGENT',
      userId: params.hostUserId,
      bookingId: params.bookingId,
      listingId: params.listingId,
      title: 'Vehicle Return Overdue',
      body: `${params.renterName} is ${params.hoursOverdue}h overdue returning "${params.listingTitle}"`,
      actionUrl: `/bookings/${params.bookingId}`,
      actionLabel: 'Contact Renter',
      metadata: { hoursOverdue: params.hoursOverdue, renterName: params.renterName },
      groupKey: `booking:${params.bookingId}`,
    });
  },
};

// ============ REVIEW NOTIFICATIONS ============

export const ReviewNotifications = {
  /**
   * Notify host about new review
   */
  async received(params: {
    reviewId: string;
    hostUserId: string;
    renterName: string;
    listingTitle: string;
    listingId: string;
    rating: number;
    actorId?: string;
  }) {
    return createNotification({
      category: 'REVIEW',
      type: 'REVIEW_RECEIVED',
      priority: params.rating <= 2 ? 'HIGH' : 'MEDIUM',
      userId: params.hostUserId,
      reviewId: params.reviewId,
      listingId: params.listingId,
      title: 'New Review Received',
      body: `${params.renterName} left a ${params.rating}-star review for "${params.listingTitle}"`,
      actionUrl: `/listings/${params.listingId}/reviews`,
      actionLabel: 'View Review',
      metadata: { rating: params.rating, renterName: params.renterName },
      actorId: params.actorId,
      groupKey: `review:${params.reviewId}`,
    });
  },

  /**
   * Remind user to leave a review
   */
  async reminder(params: {
    bookingId: string;
    userId: string;
    listingTitle: string;
    listingId: string;
  }) {
    return createNotification({
      category: 'REVIEW',
      type: 'REVIEW_REMINDER',
      priority: 'LOW',
      userId: params.userId,
      bookingId: params.bookingId,
      listingId: params.listingId,
      title: 'Share Your Experience',
      body: `How was your rental of "${params.listingTitle}"? Leave a review!`,
      actionUrl: `/bookings/${params.bookingId}/review`,
      actionLabel: 'Write Review',
      groupKey: `booking:${params.bookingId}`,
    });
  },
};

// ============ LISTING NOTIFICATIONS ============

export const ListingNotifications = {
  /**
   * Notify that listing was approved
   */
  async approved(params: {
    listingId: string;
    userId: string;
    listingTitle: string;
    organizationId?: string;
  }) {
    return createNotification({
      category: 'LISTING',
      type: 'LISTING_APPROVED',
      priority: 'HIGH',
      userId: params.userId,
      organizationId: params.organizationId,
      listingId: params.listingId,
      title: 'Listing Approved!',
      body: `Your listing "${params.listingTitle}" is now live and accepting bookings`,
      actionUrl: `/listings/${params.listingId}`,
      actionLabel: 'View Listing',
      groupKey: `listing:${params.listingId}`,
    });
  },

  /**
   * Notify that listing was rejected
   */
  async rejected(params: {
    listingId: string;
    userId: string;
    listingTitle: string;
    reason?: string;
    organizationId?: string;
  }) {
    return createNotification({
      category: 'LISTING',
      type: 'LISTING_REJECTED',
      priority: 'HIGH',
      userId: params.userId,
      organizationId: params.organizationId,
      listingId: params.listingId,
      title: 'Listing Needs Updates',
      body: `Your listing "${params.listingTitle}" requires changes${params.reason ? `: ${params.reason}` : ''}`,
      actionUrl: `/listings/${params.listingId}/edit`,
      actionLabel: 'Edit Listing',
      metadata: { reason: params.reason },
      groupKey: `listing:${params.listingId}`,
    });
  },

  /**
   * Notify about views milestone
   */
  async viewsMilestone(params: {
    listingId: string;
    userId: string;
    listingTitle: string;
    viewCount: number;
    organizationId?: string;
  }) {
    return createNotification({
      category: 'LISTING',
      type: 'LISTING_VIEWS_MILESTONE',
      priority: 'LOW',
      userId: params.userId,
      organizationId: params.organizationId,
      listingId: params.listingId,
      title: 'Listing Milestone!',
      body: `"${params.listingTitle}" has reached ${params.viewCount} views!`,
      actionUrl: `/listings/${params.listingId}/analytics`,
      actionLabel: 'View Stats',
      metadata: { viewCount: params.viewCount },
      groupKey: `listing:${params.listingId}`,
    });
  },
};

// ============ ORGANIZATION NOTIFICATIONS ============

export const OrganizationNotifications = {
  /**
   * Notify about new member
   */
  async memberJoined(params: {
    organizationId: string;
    memberName: string;
    memberRole: string;
    actorId?: string;
  }) {
    return createNotification({
      category: 'ORGANIZATION',
      type: 'ORG_MEMBER_JOINED',
      priority: 'MEDIUM',
      organizationId: params.organizationId,
      targetOrgRole: 'owner',
      title: 'New Team Member',
      body: `${params.memberName} has joined as ${params.memberRole}`,
      actionUrl: '/organization/members',
      actionLabel: 'View Team',
      metadata: { memberName: params.memberName, role: params.memberRole },
      actorId: params.actorId,
      groupKey: `org:${params.organizationId}:members`,
    });
  },

  /**
   * Notify user about invitation
   */
  async invitationReceived(params: {
    userId: string;
    organizationName: string;
    organizationId: string;
    role: string;
    actorId?: string;
  }) {
    return createNotification({
      category: 'ORGANIZATION',
      type: 'ORG_INVITATION_RECEIVED',
      priority: 'HIGH',
      userId: params.userId,
      organizationId: params.organizationId,
      title: 'Team Invitation',
      body: `You've been invited to join "${params.organizationName}" as ${params.role}`,
      actionUrl: '/invitations',
      actionLabel: 'View Invitation',
      metadata: { organizationName: params.organizationName, role: params.role },
      actorId: params.actorId,
      groupKey: `org:${params.organizationId}:invite`,
    });
  },

  /**
   * Notify about organization status change
   */
  async statusChanged(params: {
    organizationId: string;
    newStatus: string;
    reason?: string;
  }) {
    const statusMessages: Record<string, { title: string; body: string; priority: NotificationPriority }> = {
      APPROVED: { title: 'Organization Approved!', body: 'Congratulations! Your organization has been approved. You can now select a plan and start listing vehicles.', priority: 'HIGH' },
      REJECTED: { title: 'Organization Needs Updates', body: `Your organization application needs changes${params.reason ? `: ${params.reason}` : ''}`, priority: 'HIGH' },
      SUSPENDED: { title: 'Organization Suspended', body: `Your organization has been suspended${params.reason ? `: ${params.reason}` : ''}`, priority: 'URGENT' },
    };

    const message = statusMessages[params.newStatus] || {
      title: 'Organization Status Updated',
      body: `Your organization status changed to ${params.newStatus}`,
      priority: 'MEDIUM' as NotificationPriority,
    };

    return createNotification({
      category: 'ORGANIZATION',
      type: 'ORG_STATUS_CHANGED',
      priority: message.priority,
      organizationId: params.organizationId,
      targetOrgRole: 'owner',
      title: message.title,
      body: message.body,
      actionUrl: '/organization',
      actionLabel: 'View Details',
      metadata: { newStatus: params.newStatus, reason: params.reason },
      groupKey: `org:${params.organizationId}:status`,
    });
  },

  /**
   * Notify admins about new organization application
   */
  async applicationSubmitted(params: {
    organizationId: string;
    organizationName: string;
    ownerName: string;
    ownerEmail: string;
  }) {
    // Notify all admins about new application
    return createNotification({
      category: 'ORGANIZATION',
      type: 'ORG_APPLICATION_SUBMITTED',
      priority: 'HIGH',
      targetRole: 'admin', // Notify all admins
      title: 'New Partner Application',
      body: `"${params.organizationName}" submitted an application to become a partner`,
      actionUrl: `/organizations/${params.organizationId}`,
      actionLabel: 'Review Application',
      metadata: {
        organizationId: params.organizationId,
        organizationName: params.organizationName,
        ownerName: params.ownerName,
        ownerEmail: params.ownerEmail,
      },
      groupKey: 'admin:org-applications',
    });
  },
};

// ============ FINANCIAL NOTIFICATIONS ============

export const FinancialNotifications = {
  /**
   * Notify about payment received
   */
  async paymentReceived(params: {
    organizationId: string;
    bookingId: string;
    amount: number;
    currency: string;
    renterName: string;
  }) {
    return createNotification({
      category: 'FINANCIAL',
      type: 'PAYMENT_RECEIVED',
      priority: 'MEDIUM',
      organizationId: params.organizationId,
      targetOrgRole: 'owner',
      bookingId: params.bookingId,
      title: 'Payment Received',
      body: `${params.currency} ${params.amount.toFixed(2)} received from ${params.renterName}`,
      actionUrl: `/bookings/${params.bookingId}`,
      actionLabel: 'View Booking',
      metadata: { amount: params.amount, currency: params.currency, renterName: params.renterName },
      groupKey: `booking:${params.bookingId}:payment`,
    });
  },

  /**
   * Notify about payout
   */
  async payoutProcessed(params: {
    organizationId: string;
    amount: number;
    currency: string;
  }) {
    return createNotification({
      category: 'FINANCIAL',
      type: 'PAYOUT_PROCESSED',
      priority: 'MEDIUM',
      organizationId: params.organizationId,
      targetOrgRole: 'owner',
      title: 'Payout Sent',
      body: `${params.currency} ${params.amount.toFixed(2)} has been sent to your bank account`,
      actionUrl: '/finance/payouts',
      actionLabel: 'View Payouts',
      metadata: { amount: params.amount, currency: params.currency },
      groupKey: `org:${params.organizationId}:payout`,
    });
  },

  /**
   * Notify about subscription expiring
   */
  async subscriptionExpiring(params: {
    organizationId: string;
    planName: string;
    expiresAt: Date;
    daysUntil: number;
  }) {
    return createNotification({
      category: 'FINANCIAL',
      type: 'SUBSCRIPTION_EXPIRING',
      priority: params.daysUntil <= 3 ? 'HIGH' : 'MEDIUM',
      organizationId: params.organizationId,
      targetOrgRole: 'owner',
      title: 'Subscription Expiring Soon',
      body: `Your "${params.planName}" plan expires in ${params.daysUntil} days`,
      actionUrl: '/organization/subscription',
      actionLabel: 'Renew Now',
      metadata: { planName: params.planName, expiresAt: params.expiresAt, daysUntil: params.daysUntil },
      groupKey: `org:${params.organizationId}:subscription`,
    });
  },
};

// ============ FAVORITE NOTIFICATIONS ============

export const FavoriteNotifications = {
  /**
   * Notify about price drop on favorited listing
   */
  async priceDrop(params: {
    userId: string;
    listingId: string;
    listingTitle: string;
    oldPrice: number;
    newPrice: number;
    currency: string;
  }) {
    const discount = Math.round(((params.oldPrice - params.newPrice) / params.oldPrice) * 100);
    return createNotification({
      category: 'FAVORITE',
      type: 'FAVORITE_PRICE_DROP',
      priority: 'MEDIUM',
      userId: params.userId,
      listingId: params.listingId,
      title: 'Price Drop!',
      body: `"${params.listingTitle}" is now ${discount}% cheaper!`,
      actionUrl: `/listings/${params.listingId}`,
      actionLabel: 'View Listing',
      metadata: { oldPrice: params.oldPrice, newPrice: params.newPrice, currency: params.currency, discount },
      groupKey: `listing:${params.listingId}:price`,
    });
  },
};

// ============ VERIFICATION NOTIFICATIONS ============

export const VerificationNotifications = {
  /**
   * Notify about verification status
   */
  async approved(params: { userId: string }) {
    return createNotification({
      category: 'VERIFICATION',
      type: 'VERIFICATION_APPROVED',
      priority: 'HIGH',
      userId: params.userId,
      title: 'Verification Approved!',
      body: 'Your identity has been verified. You can now book vehicles.',
      actionUrl: '/account',
      actionLabel: 'View Account',
    });
  },

  async rejected(params: { userId: string; reason?: string }) {
    return createNotification({
      category: 'VERIFICATION',
      type: 'VERIFICATION_REJECTED',
      priority: 'HIGH',
      userId: params.userId,
      title: 'Verification Not Approved',
      body: `Your verification was not approved${params.reason ? `: ${params.reason}` : '. Please try again.'}`,
      actionUrl: '/account/verification',
      actionLabel: 'Try Again',
      metadata: { reason: params.reason },
    });
  },
};

// ============ SYSTEM NOTIFICATIONS ============

export const SystemNotifications = {
  /**
   * Send system announcement to all users or specific role
   */
  async announcement(params: {
    title: string;
    body: string;
    targetRole?: string;
    actionUrl?: string;
    actionLabel?: string;
  }) {
    return createNotification({
      category: 'SYSTEM',
      type: 'SYSTEM_ANNOUNCEMENT',
      priority: 'MEDIUM',
      targetRole: params.targetRole,
      title: params.title,
      body: params.body,
      actionUrl: params.actionUrl,
      actionLabel: params.actionLabel,
    });
  },

  /**
   * Notify about scheduled maintenance
   */
  async maintenance(params: {
    scheduledAt: Date;
    durationMinutes: number;
    targetRole?: string;
  }) {
    return createNotification({
      category: 'SYSTEM',
      type: 'SYSTEM_MAINTENANCE',
      priority: 'HIGH',
      targetRole: params.targetRole,
      title: 'Scheduled Maintenance',
      body: `Maintenance scheduled for ${params.scheduledAt.toLocaleDateString()} (${params.durationMinutes} minutes)`,
      metadata: { scheduledAt: params.scheduledAt, durationMinutes: params.durationMinutes },
    });
  },
};

// ============ SECURITY NOTIFICATIONS ============

export const SecurityNotifications = {
  /**
   * Notify about new login
   */
  async newLogin(params: {
    userId: string;
    deviceName?: string;
    ipAddress?: string;
    location?: string;
  }) {
    return createNotification({
      category: 'SECURITY',
      type: 'SECURITY_NEW_LOGIN',
      priority: 'MEDIUM',
      userId: params.userId,
      title: 'New Sign-in Detected',
      body: `New sign-in from ${params.deviceName || 'unknown device'}${params.location ? ` in ${params.location}` : ''}`,
      actionUrl: '/account/security',
      actionLabel: 'Review Activity',
      metadata: { deviceName: params.deviceName, ipAddress: params.ipAddress, location: params.location },
    });
  },

  /**
   * Notify about password change
   */
  async passwordChanged(params: { userId: string }) {
    return createNotification({
      category: 'SECURITY',
      type: 'SECURITY_PASSWORD_CHANGED',
      priority: 'HIGH',
      userId: params.userId,
      title: 'Password Changed',
      body: 'Your password was successfully changed. If this wasn\'t you, contact support immediately.',
      actionUrl: '/account/security',
      actionLabel: 'Review Security',
    });
  },
};

// ============ EXPORT ALL ============

export const NotificationHelpers = {
  booking: BookingNotifications,
  review: ReviewNotifications,
  listing: ListingNotifications,
  organization: OrganizationNotifications,
  financial: FinancialNotifications,
  favorite: FavoriteNotifications,
  verification: VerificationNotifications,
  system: SystemNotifications,
  security: SecurityNotifications,
};

