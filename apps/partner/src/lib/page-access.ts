import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authClient } from './auth-client';

export type MemberRole = 'owner' | 'admin' | 'manager' | 'member';

export interface PageAccessContext {
  session: any;
  organizationStatus: string;
  memberRole: MemberRole;
  subscription: {
    hasAnalytics: boolean;
    maxMembers: number;
    maxListings: number;
  } | null;
}

/**
 * Get the current page access context (session, organization, subscription)
 * Redirects to login if not authenticated or no organization
 */
export async function getPageAccessContext(): Promise<PageAccessContext> {
  const headersList = await headers();

  const session = await authClient.getSession({
    fetchOptions: {
      headers: headersList,
    },
  });

  if (!session.data?.user) {
    redirect('/login');
  }

  const sessionData = session.data as any;
  if (!sessionData?.organization) {
    redirect('/login');
  }

  const organizationStatus = sessionData.organization.status as string;
  const memberRole = (sessionData.member?.role || 'member') as MemberRole;

  // Get subscription features from session if organization is approved
  let subscription: PageAccessContext['subscription'] = null;
  if (organizationStatus === 'APPROVED' && sessionData.subscription) {
    subscription = {
      maxMembers: sessionData.subscription.maxMembers ?? 1,
      maxListings: sessionData.subscription.maxListings ?? 5,
      hasAnalytics: sessionData.subscription.hasAnalytics ?? false,
    };
  }

  return {
    session: sessionData,
    organizationStatus,
    memberRole,
    subscription,
  };
}

/**
 * Check if user has admin-level access (owner or admin role)
 */
export function hasAdminAccess(role: MemberRole): boolean {
  return role === 'owner' || role === 'admin';
}

/**
 * Guard for analytics page access
 * Requirements:
 * - Organization must be APPROVED with active subscription
 * - Subscription must have hasAnalytics = true
 * - Member must be owner or admin
 */
export async function guardAnalyticsAccess(): Promise<PageAccessContext> {
  const context = await getPageAccessContext();

  // Check organization is approved with subscription
  if (context.organizationStatus !== 'APPROVED' || !context.subscription) {
    redirect('/');
  }

  // Check admin access
  if (!hasAdminAccess(context.memberRole)) {
    redirect('/');
  }

  // Check subscription has analytics
  if (!context.subscription.hasAnalytics) {
    redirect('/subscription?upgrade=analytics');
  }

  return context;
}

/**
 * Guard for team page access
 * Requirements:
 * - Organization must be APPROVED with active subscription
 * - Subscription must have maxMembers > 1
 * - Member must be owner or admin
 */
export async function guardTeamAccess(): Promise<PageAccessContext> {
  const context = await getPageAccessContext();

  // Check organization is approved with subscription
  if (context.organizationStatus !== 'APPROVED' || !context.subscription) {
    redirect('/');
  }

  // Check admin access
  if (!hasAdminAccess(context.memberRole)) {
    redirect('/');
  }

  // Check subscription allows multiple members
  if (context.subscription.maxMembers <= 1) {
    redirect('/subscription?upgrade=team');
  }

  return context;
}
