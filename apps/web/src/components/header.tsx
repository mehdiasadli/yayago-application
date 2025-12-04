'use client';

import { Car, FileText, HelpCircle, Info, Key, List, type LucideIcon, MapPin, Phone, Shield, Star } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';
import { Logo } from '@/components/logo';
import { MenuToggleIcon } from '@/components/menu-toggle-icon';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useScroll } from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';
import { AnimatedThemeToggler } from './ui/animated-theme-toggler';
import { authClient } from '@/lib/auth-client';
import UserMenu from './user-menu';
import { Link } from '@/lib/navigation/navigation-client';

type LinkItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export function Header() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const { data: session, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn('sticky top-0 z-50 w-full border-transparent border-b', {
        'border-border bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/50': scrolled,
      })}
    >
      <nav className='mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4'>
        <div className='flex items-center gap-5'>
          <Link href='/'>
            <Logo className='size-9' />
          </Link>

          <NavigationMenu className='hidden md:flex'>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className='bg-transparent'>Browse</NavigationMenuTrigger>
                <NavigationMenuContent className='bg-muted/50 p-1 pr-1.5 dark:bg-background'>
                  <ul className='grid w-lg grid-cols-2 gap-2 rounded-md border bg-popover p-2 shadow'>
                    {productLinks.map((item, i) => (
                      <li key={i}>
                        <ListItem {...item} />
                      </li>
                    ))}
                  </ul>
                  <div className='p-2'>
                    <p className='text-muted-foreground text-sm'>
                      You want to list your car?{' '}
                      <Link className='font-medium text-foreground hover:underline' href='/become-a-host'>
                        Become a host and earn money!
                      </Link>
                    </p>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className='bg-transparent'>Company</NavigationMenuTrigger>
                <NavigationMenuContent className='bg-muted/50 p-1 pr-1.5 pb-1.5 dark:bg-background'>
                  <div className='grid w-lg grid-cols-2 gap-2'>
                    <ul className='space-y-2 rounded-md border bg-popover p-2 shadow'>
                      {companyLinks.map((item, i) => (
                        <li key={i}>
                          <ListItem {...item} />
                        </li>
                      ))}
                    </ul>
                    <ul className='space-y-2 p-3'>
                      {companyLinks2.map((item, i) => (
                        <li key={i}>
                          <NavigationMenuLink className='flex-row items-center gap-x-2' href={item.href} asChild>
                            <Link href={item.href}>
                              <item.icon className='size-4 text-foreground' />
                              <span className='font-medium'>{item.title}</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href='/pricing'
                  className='inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1'
                >
                  Pricing
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className='hidden items-center gap-2 md:flex'>
          <AnimatedThemeToggler />
          {isPending ? null : !session ? (
            <>
              <Button variant='outline' asChild>
                <Link href='/login'>Sign In</Link>
              </Button>

              <Button asChild>
                <Link href='/signup?callback_url=/become-a-host'>Get Started</Link>
              </Button>
            </>
          ) : (
            <UserMenu user={session.user} />
          )}
        </div>
        <div className='flex items-center gap-2 md:hidden'>
          <AnimatedThemeToggler />
          <Button
            aria-controls='mobile-menu'
            aria-expanded={open}
            aria-label='Toggle menu'
            onClick={() => setOpen(!open)}
            size='icon'
            variant='outline'
          >
            <MenuToggleIcon className='size-5' duration={300} open={open} />
          </Button>
          {!isPending && session && <UserMenu user={session.user} />}
        </div>
      </nav>
      <MobileMenu open={open}>
        <div className='flex flex-col h-full'>
          {/* Scrollable content area */}
          <div className='flex-1 overflow-y-auto'>
            <div className='flex flex-col gap-y-2'>
              <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Product</span>
              {productLinks.map((link) => (
                <MobileMenuItem key={link.title} {...link} onClick={() => setOpen(false)} />
              ))}
              <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider mt-4'>Company</span>
              {companyLinks.map((link) => (
                <MobileMenuItem key={link.title} {...link} onClick={() => setOpen(false)} />
              ))}
              {companyLinks2.map((link) => (
                <MobileMenuItem key={link.title} {...link} onClick={() => setOpen(false)} />
              ))}
            </div>
          </div>
          {/* Fixed bottom buttons - only show when not signed in */}
          {!isPending && !session && (
            <div className='flex flex-col gap-2 pt-4 pb-safe border-t mt-4'>
              <Button className='w-full' variant='outline' asChild>
                <Link href='/login' onClick={() => setOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button className='w-full' asChild>
                <Link href='/signup?callback_url=/become-a-host' onClick={() => setOpen(false)}>
                  Become a Host
                </Link>
              </Button>
            </div>
          )}
        </div>
      </MobileMenu>
    </header>
  );
}

type MobileMenuProps = React.ComponentProps<'div'> & {
  open: boolean;
};

function MobileMenu({ open, children }: MobileMenuProps) {
  if (!open || typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        'bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/50',
        'fixed top-14 right-0 bottom-0 left-0 z-40 overflow-hidden border-t md:hidden'
      )}
      id='mobile-menu'
    >
      <div className='h-full p-4'>{children}</div>
    </div>,
    document.body
  );
}

function MobileMenuItem({ title, description, icon: Icon, href, onClick }: LinkItem & { onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className='flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors'
    >
      <div className='flex size-10 items-center justify-center rounded-md border bg-background/40 shadow-sm shrink-0'>
        <Icon className='size-4 text-foreground' />
      </div>
      <div className='flex flex-col'>
        <span className='font-medium text-sm'>{title}</span>
        {description && <span className='text-muted-foreground text-xs'>{description}</span>}
      </div>
    </Link>
  );
}

function ListItem({
  title,
  description,
  icon: Icon,
  className,
  href,
  ...props
}: React.ComponentProps<typeof NavigationMenuLink> & LinkItem) {
  return (
    <NavigationMenuLink className={cn('w-full flex-row gap-x-2', className)} {...props} asChild>
      <Link href={href}>
        <div className='flex aspect-square size-12 items-center justify-center rounded-md border bg-background/40 shadow-sm'>
          <Icon className='size-5 text-foreground' />
        </div>
        <div className='flex flex-col items-start justify-center'>
          <span className='font-medium'>{title}</span>
          <span className='text-muted-foreground text-xs'>{description}</span>
        </div>
      </Link>
    </NavigationMenuLink>
  );
}

const productLinks: LinkItem[] = [
  {
    title: 'Search Cars',
    href: '/rent/cars',
    description: 'Search for cars to rent',
    icon: Car,
  },
  {
    title: 'Explore Brands',
    href: '/rent/cars/brands',
    description: 'Explore brands of cars to rent',
    icon: Star,
  },
  {
    title: 'Explore Locations',
    href: '/rent/cars/locations',
    description: 'Explore locations of cars to rent',
    icon: MapPin,
  },
  {
    title: 'Browse by Category',
    href: '/rent/cars/categories',
    description: 'Browse cars by category',
    icon: List,
  },
];

const companyLinks: LinkItem[] = [
  {
    title: 'About Us',
    href: '/about',
    description: 'Learn more about our story and what is YayaGO',
    icon: Info,
  },
  {
    title: 'Leasing',
    href: '/leasing',
    description: 'See what we have to offer with Car leasing',
    icon: Key,
  },
  {
    title: 'Become a Host',
    href: '/become-a-host',
    icon: Car,
    description: 'Become a host and earn money by renting your car',
  },
];

const companyLinks2: LinkItem[] = [
  {
    title: 'Terms of Service',
    href: '/legal/terms-of-service',
    icon: FileText,
  },
  {
    title: 'Privacy Policy',
    href: '/legal/privacy-policy',
    icon: Shield,
  },
  {
    title: 'Contact Us',
    href: '/contact',
    icon: Phone,
  },
  {
    title: 'FAQ',
    href: '/faq',
    icon: HelpCircle,
  },
];
