import prisma from '@yayago-app/db';
import type { Session, User } from 'better-auth';

export async function getCustomSession(user: User, session: Session) {
  const organization = await prisma.organization.findFirst({
    where: {
      deletedAt: null,
      members: {
        some: {
          user: {
            id: user.id,
            deletedAt: null,
          },
        },
      },
    },
    select: {
      slug: true,
      name: true,
      id: true,
      status: true,
      rejectionReason: true,
      banReason: true,
      members: {
        where: {
          userId: user.id,
        },
        select: {
          role: true,
        },
      },
      subscriptions: {
        where: {
          status: { in: ['active', 'trialing'] },
        },
        orderBy: { periodEnd: 'desc' },
        take: 1,
        select: {
          id: true,
          plan: true,
          status: true,
          trialEnd: true,
          periodEnd: true,
          maxListings: true,
          maxFeaturedListings: true,
          maxMembers: true,
          maxImagesPerListing: true,
          maxVideosPerListing: true,
          hasAnalytics: true,
        },
      },
    },
  });

  // Extract member info from organization
  const member = organization?.members?.[0] || null;
  const subscription = organization?.subscriptions?.[0] || null;

  return {
    user,
    session,
    organization: organization
      ? {
          id: organization.id,
          slug: organization.slug,
          name: organization.name,
          status: organization.status,
          rejectionReason: organization.rejectionReason,
          banReason: organization.banReason,
        }
      : null,
    member: member
      ? {
          role: member.role,
        }
      : null,
    subscription: subscription
      ? {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          trialEnd: subscription.trialEnd,
          periodEnd: subscription.periodEnd,
          maxListings: subscription.maxListings,
          maxFeaturedListings: subscription.maxFeaturedListings,
          maxMembers: subscription.maxMembers,
          maxImagesPerListing: subscription.maxImagesPerListing,
          maxVideosPerListing: subscription.maxVideosPerListing,
          hasAnalytics: subscription.hasAnalytics,
        }
      : null,
  };
}
