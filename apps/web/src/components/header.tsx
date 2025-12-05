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
      className={cn('sticky top-0 z-50 w-full border-transparent border-b transition-all duration-300', {
        'border-border/40 bg-background/80 backdrop-blur-xl shadow-sm': scrolled,
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
                <NavigationMenuContent className='bg-muted/50 backdrop-blur-xl p-1 pr-1.5 dark:bg-background/80'>
                  <ul className='grid w-lg grid-cols-2 gap-2 rounded-md border bg-popover/95 backdrop-blur-sm p-2 shadow'>
                    {productLinks.map((item, i) => (
                      <li key={i}>
                        <ListItem {...item} />
                      </li>
                    ))}
                  </ul>
                  <div className='p-2'>
                    <p className='text-muted-foreground text-sm'>
                      You want to list your car?{' '}
                      <Link className='font-medium text-primary hover:underline' href='/become-a-host'>
                        Become a host and earn money!
                      </Link>
                    </p>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className='bg-transparent'>Company</NavigationMenuTrigger>
                <NavigationMenuContent className='bg-muted/50 backdrop-blur-xl p-1 pr-1.5 pb-1.5 dark:bg-background/80'>
                  <div className='grid w-lg grid-cols-2 gap-2'>
                    <ul className='space-y-2 rounded-md border bg-popover/95 backdrop-blur-sm p-2 shadow'>
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
                              <item.icon className='size-4 text-primary' />
                              <span className='font-medium'>{item.title}</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </NavigationMenuContent>
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
      <MobileMenu open={open} onClose={() => setOpen(false)} session={session} isPending={isPending} />
    </header>
  );
}

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  session: typeof authClient extends { useSession: () => { data: infer T } } ? T : unknown;
  isPending: boolean;
};

function MobileMenu({ open, onClose, session, isPending }: MobileMenuProps) {
  if (!open || typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <div className='fixed inset-0 top-14 z-40 md:hidden' id='mobile-menu'>
      {/* Backdrop with blur */}
      <div
        className='absolute inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-200'
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className='relative h-full bg-background/95 backdrop-blur-xl border-t border-border/50 overflow-hidden animate-in slide-in-from-top-2 duration-300'>
        {/* Decorative gradient */}
        <div className='absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-primary/5 to-transparent pointer-events-none' />

        <div className='h-full flex flex-col relative'>
          {/* Scrollable content */}
          <div className='flex-1 overflow-y-auto p-4'>
            {/* Browse Section */}
            <div className='mb-6'>
              <h3 className='text-xs font-semibold text-primary uppercase tracking-wider mb-3 px-2'>Browse</h3>
              <div className='space-y-1'>
                {productLinks.map((link, index) => (
                  <MobileMenuItem key={link.title} {...link} onClick={onClose} index={index} />
                ))}
              </div>
            </div>

            {/* Company Section */}
            <div className='mb-6'>
              <h3 className='text-xs font-semibold text-primary uppercase tracking-wider mb-3 px-2'>Company</h3>
              <div className='space-y-1'>
                {companyLinks.map((link, index) => (
                  <MobileMenuItem key={link.title} {...link} onClick={onClose} index={index + productLinks.length} />
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className='mb-6'>
              <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2'>
                Quick Links
              </h3>
              <div className='grid grid-cols-2 gap-2'>
                {companyLinks2.map((link, index) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    onClick={onClose}
                    className='flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all duration-200'
                    style={{ animationDelay: `${(index + productLinks.length + companyLinks.length) * 30}ms` }}
                  >
                    <link.icon className='size-4' />
                    <span>{link.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed bottom area */}
          {!isPending && !session && (
            <div className='shrink-0 p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm'>
              <div className='flex flex-col gap-2.5'>
                <Button variant='outline' className='w-full h-12 rounded-xl' asChild>
                  <Link href='/login' onClick={onClose}>
                    Sign In
                  </Link>
                </Button>
                <Button className='w-full h-12 rounded-xl' asChild>
                  <Link href='/signup?callback_url=/become-a-host' onClick={onClose}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function MobileMenuItem({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  index = 0,
}: LinkItem & { onClick?: () => void; index?: number }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className='flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-primary/5 transition-all duration-200 group animate-in fade-in slide-in-from-left-2'
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-200 shrink-0'>
        <Icon className='size-4 text-primary' />
      </div>
      <div className='flex flex-col min-w-0'>
        <span className='font-medium text-sm group-hover:text-primary transition-colors'>{title}</span>
        {description && <span className='text-muted-foreground text-xs truncate'>{description}</span>}
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
      <Link href={href} className='group'>
        <div className='flex aspect-square size-12 items-center justify-center rounded-md border bg-background/60 shadow-sm group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-200'>
          <Icon className='size-5 text-foreground group-hover:text-primary transition-colors' />
        </div>
        <div className='flex flex-col items-start justify-center'>
          <span className='font-medium group-hover:text-primary transition-colors'>{title}</span>
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
