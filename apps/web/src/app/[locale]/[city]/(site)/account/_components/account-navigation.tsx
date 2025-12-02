'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Link } from '@/lib/navigation/navigation-client';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Home,
  Calendar,
  Heart,
  MessageCircle,
  Settings,
  User,
  CreditCard,
  Bell,
  Shield,
  Key,
  Building2,
  ExternalLink,
  Crown,
  ChevronRight,
  Car,
  BadgeCheck,
  Clock,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useVerification } from '@/contexts/verification-context';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { title: 'Overview', href: '/account', icon: Home },
  { title: 'Bookings', href: '/account/bookings', icon: Calendar },
  { title: 'Favorites', href: '/account/favorites', icon: Heart },
  { title: 'Reviews', href: '/account/reviews', icon: MessageCircle },
];

const settingsNavItems: NavItem[] = [
  { title: 'Profile', href: '/account/settings', icon: User },
  { title: 'Personal Info', href: '/account/settings/personal', icon: CreditCard },
  { title: 'Security', href: '/account/settings/security', icon: Shield },
  { title: 'Verification', href: '/account/settings/verification', icon: Key },
  { title: 'Notifications', href: '/account/settings/notifications', icon: Bell },
  { title: 'Preferences', href: '/account/settings/preferences', icon: Settings },
];

interface AccountNavigationProps {
  userRole: 'user' | 'moderator' | 'admin';
}

export default function AccountNavigation({ userRole }: AccountNavigationProps) {
  const pathname = usePathname();
  const { status, isVerified, isPending, openModal, isLoading: isVerificationLoading } = useVerification();

  // Fetch profile to get isHost status
  const { data: profile, isLoading } = useQuery(orpc.users.getMyProfile.queryOptions());

  const isHost = profile?.isHost ?? false;

  const isActive = (href: string) => {
    // Extract path after /[locale]/[city]
    const segments = pathname.split('/').filter(Boolean);
    const accountPath = '/' + segments.slice(2).join('/');

    if (href === '/account') {
      return accountPath === '/account';
    }
    return accountPath.startsWith(href);
  };

  return (
    <Card className='sticky top-4'>
      <CardContent className='p-3 space-y-1'>
        {/* Main Navigation */}
        <nav className='space-y-1'>
          {mainNavItems.map((item) => (
            <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
          ))}
        </nav>

        {/* Settings Section */}
        <div className='pt-2'>
          <p className='px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider'>Settings</p>
          <nav className='space-y-1'>
            {settingsNavItems.map((item) => (
              <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
            ))}
          </nav>
        </div>

        <Separator className='my-3' />

        {/* Role-based Links */}
        <div className='space-y-1'>
          {/* Admin/Moderator Link */}
          {(userRole === 'admin' || userRole === 'moderator') && (
            <a
              href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002'}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent group'
            >
              <Crown className='size-4 text-amber-500' />
              <span className='flex-1'>Admin Dashboard</span>
              <ExternalLink className='size-3 opacity-0 group-hover:opacity-100 transition-opacity' />
            </a>
          )}

          {/* Verification Status Button */}
          {isVerificationLoading ? (
            <div className='flex items-center gap-3 px-3 py-2'>
              <Skeleton className='size-4' />
              <Skeleton className='h-4 flex-1' />
            </div>
          ) : isVerified ? (
            <div className='flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'>
              <BadgeCheck className='size-4' />
              <span className='flex-1'>Account Verified</span>
            </div>
          ) : isPending ? (
            <div className='flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'>
              <Clock className='size-4' />
              <span className='flex-1'>Verification Pending</span>
            </div>
          ) : (
            <Button
              variant='outline'
              className='w-full justify-start gap-3 px-3 py-2 h-auto text-sm font-medium border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50'
              onClick={openModal}
            >
              <BadgeCheck className='size-4' />
              <span className='flex-1 text-left'>Verify Account</span>
              <ChevronRight className='size-3' />
            </Button>
          )}

          {/* Partner/Host Link - show loading skeleton while fetching */}
          {isLoading ? (
            <div className='flex items-center gap-3 px-3 py-2'>
              <Skeleton className='size-4' />
              <Skeleton className='h-4 flex-1' />
            </div>
          ) : isHost ? (
            <a
              href={process.env.NEXT_PUBLIC_PARTNER_URL || 'http://localhost:3003'}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent group'
            >
              <Building2 className='size-4 text-primary' />
              <span className='flex-1'>Partner Dashboard</span>
              <ExternalLink className='size-3 opacity-0 group-hover:opacity-100 transition-opacity' />
            </a>
          ) : (
            <Link
              href='/become-a-host'
              className='flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-primary/10 hover:bg-primary/20 text-primary group'
            >
              <Car className='size-4' />
              <span className='flex-1'>Become a Host</span>
              <ChevronRight className='size-3 opacity-0 group-hover:opacity-100 transition-opacity' />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-foreground'
      )}
    >
      <item.icon className='size-4' />
      <span className='flex-1'>{item.title}</span>
      {item.badge && (
        <Badge variant='secondary' className='text-xs'>
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}
