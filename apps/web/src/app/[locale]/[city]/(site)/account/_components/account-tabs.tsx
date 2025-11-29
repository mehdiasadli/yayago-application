'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Link } from '@/lib/navigation/navigation-client';
import { cn } from '@/lib/utils';
import { Calendar, Heart, Home, MessageCircle, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navigationMenuItems = [
  { title: 'Overview', href: '/account', icon: Home },
  { title: 'Bookings', href: '/account/bookings', icon: Calendar },
  { title: 'Reviews', href: '/account/reviews', icon: MessageCircle },
  { title: 'Favorites', href: '/account/favorites', icon: Heart },
  { title: 'Settings', href: '/account/settings', icon: Settings },
];

export default function AccountTabs() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // remove /countr/city/locale from the href
    const [_c, _ci, _l, ...rest] = pathname.split('/').filter(Boolean);

    if (rest.length === 0) {
      return href === '/account';
    }

    return href === `/account/${rest.join('/')}`;
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navigationMenuItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            <NavigationMenuLink asChild active={isActive(item.href)}>
              <Link href={item.href} className='flex-row items-center gap-2.5'>
                <item.icon className='h-5 w-5 shrink-0' />
                <span className={cn('hidden md:block', isActive(item.href) && 'text-primary')}>{item.title}</span>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
