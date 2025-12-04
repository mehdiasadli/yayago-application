'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Link, useRouter } from '@/lib/navigation/navigation-client';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  ChevronDown,
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
  { title: 'Notifications', href: '/account/notifications', icon: Bell },
  { title: 'Favorites', href: '/account/favorites', icon: Heart },
  { title: 'Reviews', href: '/account/reviews', icon: MessageCircle },
  { title: 'Settings', href: '/account/settings', icon: Settings },
];

const settingsNavItems: NavItem[] = [
  { title: 'Profile', href: '/account/settings', icon: User },
  { title: 'Personal', href: '/account/settings/personal', icon: CreditCard },
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
  const router = useRouter();
  const { isVerified, isPending, openModal, isLoading: isVerificationLoading } = useVerification();
  const [settingsOpen, setSettingsOpen] = useState(true);

  // Fetch profile to get isHost status
  const { data: profile, isLoading } = useQuery(orpc.users.getMyProfile.queryOptions());

  const isHost = profile?.isHost ?? false;

  // Extract path after /[locale]/[city]
  const getAccountPath = () => {
    const segments = pathname.split('/').filter(Boolean);
    return '/' + segments.slice(2).join('/');
  };

  const accountPath = getAccountPath();

  // Fixed isActive logic
  const isActive = (href: string) => {
    if (href === '/account') {
      return accountPath === '/account';
    }
    if (href === '/account/settings') {
      return accountPath === '/account/settings';
    }
    return accountPath === href || accountPath.startsWith(href + '/');
  };

  // Check if we're in settings section
  const isInSettings = accountPath.startsWith('/account/settings');

  // Get current page for mobile select
  const getCurrentPage = () => {
    if (isInSettings) return '/account/settings';
    const current = mainNavItems.find((item) => isActive(item.href));
    return current?.href || '/account';
  };

  // Get current settings page
  const getCurrentSettingsPage = () => {
    const current = settingsNavItems.find((item) => isActive(item.href));
    return current?.href || '/account/settings';
  };

  const handleNavChange = (value: string) => {
    router.push(value);
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div className='lg:hidden space-y-3'>
        {/* Main Navigation Select */}
        <Select value={getCurrentPage()} onValueChange={handleNavChange}>
          <SelectTrigger className='w-full h-12 rounded-xl bg-card border shadow-sm'>
            <div className='flex items-center gap-3'>
              {(() => {
                const current = mainNavItems.find((item) => item.href === getCurrentPage());
                if (current) {
                  return (
                    <>
                      <div className='p-1.5 rounded-lg bg-primary/10'>
                        <current.icon className='size-4 text-primary' />
                      </div>
                      <SelectValue>{current.title}</SelectValue>
                    </>
                  );
                }
                return <SelectValue />;
              })()}
            </div>
          </SelectTrigger>
          <SelectContent className='rounded-xl'>
            {mainNavItems.map((item) => (
              <SelectItem key={item.href} value={item.href} className='rounded-lg py-3'>
                <div className='flex items-center gap-3'>
                  <item.icon className='size-4' />
                  <span>{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Settings Sub-navigation Grid */}
        {isInSettings && (
          <div className='grid grid-cols-3 gap-2'>
            {settingsNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all',
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-card border hover:bg-accent'
                )}
              >
                <item.icon className='size-5' />
                <span className='text-xs font-medium leading-tight'>{item.title}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Actions for Mobile */}
        <div className='flex gap-2'>
          {/* Verification Status */}
          {!isVerificationLoading && !isVerified && !isPending && (
            <Button
              variant='outline'
              size='sm'
              className='flex-1 h-10 rounded-xl gap-2 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
              onClick={openModal}
            >
              <BadgeCheck className='size-4' />
              Verify
            </Button>
          )}

          {/* Partner Link */}
          {!isLoading && !isHost && (
            <Button asChild variant='secondary' size='sm' className='flex-1 h-10 rounded-xl gap-2 hover:text-primary'>
              <Link href='/become-a-host'>
                <Car className='size-4' />
                Become a Host
              </Link>
            </Button>
          )}

          {/* Admin Link */}
          {(userRole === 'admin' || userRole === 'moderator') && (
            <Button asChild variant='outline' size='sm' className='flex-1 h-10 rounded-xl gap-2'>
              <a
                href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002'}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Crown className='size-4 text-amber-500' />
                Admin
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Navigation - Sidebar */}
      <div className='hidden lg:block'>
        <div className='sticky top-4 space-y-3'>
          {/* Main Navigation Card */}
          <div className='rounded-2xl border bg-card p-2 shadow-sm'>
            <nav className='space-y-1'>
              {mainNavItems
                .filter((item) => item.href !== '/account/settings')
                .map((item) => (
                  <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
                ))}
            </nav>
          </div>

          {/* Settings Section Card */}
          <div className='rounded-2xl border bg-card shadow-sm overflow-hidden'>
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger className='flex items-center justify-between w-full px-4 py-3 hover:bg-accent/50 transition-colors'>
                <div className='flex items-center gap-2'>
                  <div
                    className={cn(
                      'p-1.5 rounded-lg',
                      isInSettings ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Settings className='size-4' />
                  </div>
                  <span className='text-sm font-semibold'>Settings</span>
                </div>
                <ChevronDown
                  className={cn(
                    'size-4 text-muted-foreground transition-transform duration-200',
                    settingsOpen && 'rotate-180'
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='px-2 pb-2'>
                  <nav className='space-y-1'>
                    {settingsNavItems.map((item) => (
                      <NavLink key={item.href} item={item} isActive={isActive(item.href)} isSettings />
                    ))}
                  </nav>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Quick Actions Card */}
          <div className='rounded-2xl border bg-card p-3 shadow-sm space-y-2'>
            {/* Admin/Moderator Link */}
            {(userRole === 'admin' || userRole === 'moderator') && (
              <a
                href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002'}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-orange-500/10 group'
              >
                <div className='p-1.5 rounded-lg bg-gradient-to-br from-amber-500/15 to-orange-500/15'>
                  <Crown className='size-4 text-amber-500' />
                </div>
                <span className='flex-1'>Admin Dashboard</span>
                <ExternalLink className='size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
              </a>
            )}

            {/* Verification Status */}
            {isVerificationLoading ? (
              <div className='flex items-center gap-3 px-3 py-2.5'>
                <Skeleton className='size-8 rounded-lg' />
                <Skeleton className='h-4 flex-1' />
              </div>
            ) : isVerified ? (
              <div className='flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10'>
                <div className='p-1.5 rounded-lg bg-emerald-500/15'>
                  <BadgeCheck className='size-4 text-emerald-500' />
                </div>
                <span className='flex-1 text-sm font-medium text-emerald-700 dark:text-emerald-400'>
                  Account Verified
                </span>
              </div>
            ) : isPending ? (
              <div className='flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10'>
                <div className='p-1.5 rounded-lg bg-amber-500/15'>
                  <Clock className='size-4 text-amber-500' />
                </div>
                <span className='flex-1 text-sm font-medium text-amber-700 dark:text-amber-400'>
                  Verification Pending
                </span>
              </div>
            ) : (
              <Button
                variant='ghost'
                className='w-full justify-start gap-3 px-3 py-2.5 h-auto rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/15 hover:to-cyan-500/15 text-blue-700 dark:text-blue-400'
                onClick={openModal}
              >
                <div className='p-1.5 rounded-lg bg-blue-500/15'>
                  <BadgeCheck className='size-4 text-blue-500' />
                </div>
                <span className='flex-1 text-left text-sm font-medium'>Verify Account</span>
                <ChevronRight className='size-4' />
              </Button>
            )}

            {/* Partner/Host Link */}
            {isLoading ? (
              <div className='flex items-center gap-3 px-3 py-2.5'>
                <Skeleton className='size-8 rounded-lg' />
                <Skeleton className='h-4 flex-1' />
              </div>
            ) : isHost ? (
              <a
                href={process.env.NEXT_PUBLIC_PARTNER_URL || 'http://localhost:3003'}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-gradient-to-r hover:from-primary/10 hover:to-violet-500/10 group'
              >
                <div className='p-1.5 rounded-lg bg-gradient-to-br from-primary/15 to-violet-500/15'>
                  <Building2 className='size-4 text-primary' />
                </div>
                <span className='flex-1'>Partner Dashboard</span>
                <ExternalLink className='size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
              </a>
            ) : (
              <Link
                href='/become-a-host'
                className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-primary/10 to-violet-500/10 hover:from-primary/15 hover:to-violet-500/15 text-primary group'
              >
                <div className='p-1.5 rounded-lg bg-gradient-to-br from-primary/15 to-violet-500/15'>
                  <Car className='size-4' />
                </div>
                <span className='flex-1'>Become a Host</span>
                <ChevronRight className='size-4 opacity-0 group-hover:opacity-100 transition-opacity' />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function NavLink({ item, isActive, isSettings }: { item: NavItem; isActive: boolean; isSettings?: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
        isActive ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'hover:bg-accent text-foreground',
        isSettings && 'py-2'
      )}
    >
      <div
        className={cn(
          'p-1 rounded-md transition-colors',
          isActive ? 'bg-primary-foreground/20' : 'bg-muted',
          isSettings && 'p-0.5'
        )}
      >
        <item.icon className={cn('size-4', isSettings && 'size-3.5')} />
      </div>
      <span className='flex-1'>{item.title}</span>
      {item.badge && (
        <Badge variant={isActive ? 'secondary' : 'outline'} className='text-xs'>
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}
