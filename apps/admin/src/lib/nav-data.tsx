import {
  BarChart,
  Bell,
  Building,
  Building2,
  Calendar,
  Car,
  ExternalLink,
  Globe,
  Home,
  List,
  LucideIcon,
  Map,
  MapPin,
  MessageCircle,
  Package,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';

export type NavigationLink = {
  title: string;
  href: string;
  Icon: LucideIcon;
  items?: Omit<NavigationLink, 'items' | 'Icon'>[];
};

export const primaryNavigationLinks: NavigationLink[] = [
  {
    title: 'Overview',
    href: '/',
    Icon: Home,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    Icon: BarChart,
  },
  {
    title: 'Finance',
    href: '/finance',
    Icon: Wallet,
  },
  {
    title: 'Plans',
    href: '/plans',
    Icon: Package,
  },
  {
    title: 'Users',
    href: '/users',
    Icon: Users,
  },
  {
    title: 'Regions',
    href: '/regions',
    Icon: Map,
  },
  {
    title: 'Vehicles',
    href: '/vehicles',
    Icon: Car,
  },
  {
    title: 'Organizations',
    href: '/organizations',
    Icon: Building,
  },
  {
    title: 'Listings',
    href: '/listings',
    Icon: List,
  },
  {
    title: 'Bookings',
    href: '/bookings',
    Icon: Calendar,
  },
  {
    title: 'Reviews',
    href: '/reviews',
    Icon: MessageCircle,
  },
];

export const secondaryNavigationLinks: NavigationLink[] = [
  {
    title: 'Public Website',
    href: process.env.NEXT_PUBLIC_WEB_URL ?? '',
    Icon: ExternalLink,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    Icon: Bell,
  },
  {
    title: 'Settings',
    href: '/settings',
    Icon: Settings,
  },
];
