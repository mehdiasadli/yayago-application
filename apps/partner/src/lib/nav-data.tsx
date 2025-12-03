import {
  BarChart,
  Bell,
  Building2,
  Calendar,
  Car,
  CreditCard,
  ExternalLink,
  FileText,
  Home,
  type LucideIcon,
  MessageCircle,
  Settings,
  Users,
  HelpCircle,
  Shield,
  Plus,
  Banknote,
} from 'lucide-react';

export type OrganizationStatus = 'IDLE' | 'ONBOARDING' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED';

export interface SubscriptionFeatures {
  maxMembers: number;
  maxListings: number;
  hasAnalytics: boolean;
  hasBookings: boolean;
  hasReviews: boolean;
}

export interface NavigationContext {
  organizationStatus: OrganizationStatus;
  memberRole: string;
  subscription?: SubscriptionFeatures | null;
}

export type NavigationLink = {
  title: string;
  href: string;
  Icon: LucideIcon;
  badge?: string | number;
  items?: Omit<NavigationLink, 'items' | 'Icon'>[];
};

export type NavigationGroup = {
  label?: string;
  links: NavigationLink[];
};

// Default subscription features for when no subscription data is available
const DEFAULT_FEATURES: SubscriptionFeatures = {
  maxMembers: 1,
  maxListings: 5,
  hasAnalytics: false,
  hasBookings: true,
  hasReviews: true,
};

/**
 * Get navigation links based on organization status and subscription
 */
export function getNavigationGroups(context: NavigationContext): NavigationGroup[] {
  const { organizationStatus, memberRole, subscription } = context;
  const features = subscription || DEFAULT_FEATURES;
  const isOwner = memberRole === 'owner';

  // For SUSPENDED or ARCHIVED - minimal navigation
  if (organizationStatus === 'SUSPENDED' || organizationStatus === 'ARCHIVED') {
    return [
      {
        links: [{ title: 'Overview', href: '/', Icon: Home }],
      },
      {
        label: 'Support',
        links: [
          // { title: 'Help Center', href: '/help', Icon: HelpCircle },
          // { title: 'Settings', href: '/settings', Icon: Settings },
        ],
      },
    ];
  }

  // For IDLE or ONBOARDING - shouldn't really be in dashboard, but just in case
  if (organizationStatus === 'IDLE' || organizationStatus === 'ONBOARDING') {
    return [
      {
        links: [{ title: 'Overview', href: '/', Icon: Home }],
      },
      {
        label: 'Support',
        links: [{ title: 'Settings', href: '/settings', Icon: Settings }],
      },
    ];
  }

  // For PENDING - limited access while waiting for approval
  if (organizationStatus === 'PENDING') {
    return [
      {
        links: [{ title: 'Overview', href: '/', Icon: Home }],
      },
      {
        label: 'Organization',
        links: [
          { title: 'Organization', href: '/organization', Icon: Building2 },
          ...(isOwner ? [{ title: 'Subscription', href: '/subscription', Icon: CreditCard }] : []),
        ],
      },
      {
        label: 'Support',
        links: [
          { title: 'Notifications', href: '/notifications', Icon: Bell },
          // { title: 'Help Center', href: '/help', Icon: HelpCircle },
          // { title: 'Settings', href: '/settings', Icon: Settings },
        ],
      },
    ];
  }

  // For REJECTED - similar to pending but with emphasis on fixing
  if (organizationStatus === 'REJECTED') {
    return [
      {
        links: [{ title: 'Overview', href: '/', Icon: Home }],
      },
      {
        label: 'Organization',
        links: [
          { title: 'Organization', href: '/organization', Icon: Building2 },
          { title: 'Fix Application', href: '/onboarding', Icon: FileText },
          ...(isOwner ? [{ title: 'Subscription', href: '/subscription', Icon: CreditCard }] : []),
        ],
      },
      {
        label: 'Support',
        links: [
          { title: 'Notifications', href: '/notifications', Icon: Bell },
          // { title: 'Help Center', href: '/help', Icon: HelpCircle },
          // { title: 'Settings', href: '/settings', Icon: Settings },
        ],
      },
    ];
  }

  // For ACTIVE - full access based on subscription features
  const mainLinks: NavigationLink[] = [{ title: 'Overview', href: '/', Icon: Home }];
  const isAdminOrOwner = memberRole === 'owner' || memberRole === 'admin';

  // Analytics - may be a premium feature and requires admin/owner role
  if (features.hasAnalytics && isAdminOrOwner) {
    mainLinks.push({ title: 'Analytics', href: '/analytics', Icon: BarChart });
  }

  // Fleet Management
  const fleetLinks: NavigationLink[] = [
    {
      title: 'Listings',
      href: '/listings',
      Icon: Car,
      items: [
        { title: 'All Listings', href: '/listings' },
        { title: 'Add New', href: '/listings/create' },
      ],
    },
  ];

  // Bookings
  if (features.hasBookings) {
    fleetLinks.push({ title: 'Bookings', href: '/bookings', Icon: Calendar });
  }

  // Reviews
  if (features.hasReviews) {
    fleetLinks.push({ title: 'Reviews', href: '/reviews', Icon: MessageCircle });
  }

  // Organization management
  const orgLinks: NavigationLink[] = [{ title: 'Organization', href: '/organization', Icon: Building2 }];

  // Team - only show if subscription allows more than 1 member AND user is admin/owner
  if (features.maxMembers > 1 && isAdminOrOwner) {
    orgLinks.push({
      title: 'Team',
      href: '/team',
      Icon: Users,
    });
  }

  // Subscription & Payouts - only for owners
  if (isOwner) {
    orgLinks.push({ title: 'Subscription', href: '/subscription', Icon: CreditCard });
    orgLinks.push({ title: 'Payouts', href: '/payouts', Icon: Banknote });
  }

  // Support & Settings
  const supportLinks: NavigationLink[] = [
    { title: 'Notifications', href: '/notifications', Icon: Bell },
    // { title: 'Help Center', href: '/help', Icon: HelpCircle },
    // { title: 'Settings', href: '/settings', Icon: Settings },
  ];

  return [
    {
      links: mainLinks,
    },
    {
      label: 'Fleet',
      links: fleetLinks,
    },
    {
      label: 'Organization',
      links: orgLinks,
    },
    {
      label: 'Support',
      links: supportLinks,
    },
  ];
}

/**
 * Get quick action links based on context
 */
export function getQuickActions(context: NavigationContext): NavigationLink[] {
  const { organizationStatus } = context;

  if (organizationStatus !== 'ACTIVE') {
    return [];
  }

  return [{ title: 'Add Listing', href: '/listings/create', Icon: Plus }];
}

/**
 * External links (always shown in footer)
 */
export const externalLinks: NavigationLink[] = [
  {
    title: 'Public Website',
    href: process.env.NEXT_PUBLIC_WEB_URL || '/',
    Icon: ExternalLink,
  },
];

// Legacy exports for backwards compatibility (deprecated)
/** @deprecated Use getNavigationGroups instead */
export const primaryNavigationLinks: NavigationLink[] = [
  { title: 'Overview', href: '/', Icon: Home },
  { title: 'Analytics', href: '/analytics', Icon: BarChart },
  { title: 'Listings', href: '/listings', Icon: Car },
  { title: 'Bookings', href: '/bookings', Icon: Calendar },
  { title: 'Reviews', href: '/reviews', Icon: MessageCircle },
];

/** @deprecated Use getNavigationGroups instead */
export const secondaryNavigationLinks: NavigationLink[] = [
  { title: 'Public Website', href: process.env.NEXT_PUBLIC_WEB_URL ?? '', Icon: ExternalLink },
  { title: 'Notifications', href: '/notifications', Icon: Bell },
  { title: 'Settings', href: '/settings', Icon: Settings },
];
