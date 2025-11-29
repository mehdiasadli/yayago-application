'use client';
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
// import { Suspense } from 'react';
import type React from 'react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
// import { PreferencesDialog } from './preferences-dialog';
import { Link } from '@/lib/navigation/navigation-client';

type FooterLink = {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
};
type FooterLinkGroup = {
  label: string;
  links: FooterLink[];
};

export function StickyFooter() {
  return (
    <footer
      className='relative h-[560px] w-full border-t'
      style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
    >
      <div className='fixed bottom-0 h-[560px] w-full'>
        <div className='sticky top-[calc(100vh-560px)] h-full overflow-y-auto'>
          <div className='relative flex size-full flex-col justify-between gap-5 px-4'>
            <div
              aria-hidden
              className='absolute inset-0 isolate z-0 opacity-50 contain-strict dark:opacity-100 pointer-events-none'
            >
              <div className='-translate-y-87.5 -rotate-45 absolute top-0 left-0 h-320 w-140 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]' />
              <div className='-rotate-45 absolute top-0 left-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]' />
              <div className='-translate-y-87.5 -rotate-45 absolute top-0 left-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]' />
            </div>
            <div className='relative z-10 flex flex-col gap-8 pt-12 md:flex-row'>
              <AnimatedContainer className='w-full min-w-2xs max-w-sm space-y-4'>
                <Logo className='size-10' />
                <p className='mt-8 text-muted-foreground text-sm md:mt-0'>
                  Your trusted partner for car leasing and rental services.
                </p>
                <div className='flex gap-2'>
                  {socialLinks.map((link, index) => (
                    <Button key={`social-${link.href}-${index}`} size='icon-sm' variant='outline' asChild>
                      <Link href={link.href as any}>
                        <link.icon className='size-4' />
                      </Link>
                    </Button>
                  ))}
                </div>
              </AnimatedContainer>
              {footerLinkGroups.map((group, index) => (
                <AnimatedContainer className='w-full' delay={0.1 + index * 0.1} key={group.label}>
                  <div className='mb-10 md:mb-0'>
                    <h3 className='text-sm uppercase'>{group.label}</h3>
                    <ul className='mt-4 space-y-2 text-muted-foreground text-sm md:text-xs lg:text-sm'>
                      {group.links.map((link) => (
                        <li key={link.title}>
                          <Link
                            className='inline-flex items-center transition-all duration-300 hover:text-foreground'
                            href={link.href}
                          >
                            {link.icon && <link.icon className='me-1 size-4' />}
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedContainer>
              ))}
            </div>
            <div className='relative z-10 flex flex-col items-center justify-between gap-2 border-t py-4 text-muted-foreground text-sm md:flex-row'>
              <p>&copy; {new Date().getFullYear()} Yayago Car Rental LLC, All rights reserved.</p>
              {/* <Suspense fallback={null}>
                <PreferencesDialog />
              </Suspense> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const socialLinks = [
  { title: 'Facebook', href: 'https://www.facebook.com/yayago', icon: FacebookIcon },
  { title: 'Instagram', href: 'https://www.instagram.com/yayago', icon: InstagramIcon },
  { title: 'Twitter', href: 'https://www.twitter.com/yayago', icon: TwitterIcon },
  { title: 'LinkedIn', href: 'https://www.linkedin.com/company/yayago', icon: LinkedinIcon },
];

const footerLinkGroups: FooterLinkGroup[] = [
  {
    label: 'Browse',
    links: [
      { title: 'Search Cars', href: '/rent/cars' },
      { title: 'Browse Categories', href: '/rent/cars/categories' },
      { title: 'Explore Locations', href: '/rent/cars/locations' },
      { title: 'Explore Brands', href: '/rent/cars/brands' },
      { title: 'Browse by Body Type', href: '/rent/cars/body-types' },
    ],
  },
  {
    label: 'Company',
    links: [
      { title: 'About Us', href: '/about' },
      { title: 'Pricing Plans', href: '/pricing' },
      { title: 'Contact Us', href: '/contact' },
      { title: 'Help Center', href: '/help-center' },
      { title: 'FAQ', href: '/faq' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { title: 'Leasing', href: '/leasing' },
      {
        title: 'Become a Host',
        href: '/become-a-host',
      },
      {
        title: 'How it works',
        href: '/how-it-works',
      },
    ],
  },
  {
    label: 'Legal',
    links: [
      { title: 'Terms of Service', href: '/legal/terms-of-service' },
      { title: 'Privacy Policy', href: '/legal/privacy-policy' },
    ],
  },
];

type AnimatedContainerProps = React.ComponentProps<typeof motion.div> & {
  children?: React.ReactNode;
  delay?: number;
};

function AnimatedContainer({ delay = 0.1, children, ...props }: AnimatedContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return children;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      transition={{ delay, duration: 0.8 }}
      viewport={{ once: true }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
