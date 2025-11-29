'use client';

import { FacebookIcon, InstagramIcon, type LucideIcon, Mail, MapPin, Phone, YoutubeIcon } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

const APP_EMAIL = 'support@yayago.ae';
const APP_PHONE = '+971 50 123 4567';
const APP_PHONE_2 = '+971 50 123 4567';

export function Contact() {
  const socialLinks = [
    {
      icon: InstagramIcon,
      href: 'https://www.instagram.com/yayago',
      label: 'Instagram',
    },
    {
      icon: XIcon,
      href: 'https://www.x.com/yayago',
      label: 'Twitter',
    },
    {
      icon: FacebookIcon,
      href: 'https://www.facebook.com/yayago',
      label: 'Facebook',
    },
    {
      icon: YoutubeIcon,
      href: 'https://www.youtube.com/yayago',
      label: 'Youtube',
    },
  ];

  return (
    <div className='mx-auto h-full min-h-screen max-w-5xl lg:border-x'>
      <div className='flex grow flex-col justify-center px-4 py-18 md:items-center'>
        <h1 className='font-bold text-4xl md:text-5xl'>Contact Us</h1>
        <p className='mb-5 text-base text-muted-foreground'>Contact the support team at YayaGO.</p>
      </div>
      <BorderSeparator />
      <div className='grid md:grid-cols-3'>
        <Box description='We respond to all emails within 24 hours.' icon={Mail} title='Email'>
          <a className='font-medium font-mono text-sm tracking-wide hover:underline' href={`mailto:${APP_EMAIL}`}>
            {APP_EMAIL}
          </a>
        </Box>
        <Box description='Drop by our office for a chat.' icon={MapPin} title='Office'>
          <span className='font-medium font-mono text-sm tracking-wide'>
            Office # 10, Al Mulla Building, Al Karama, Dubai, UAE
          </span>
        </Box>
        <Box
          className='border-b-0 md:border-r-0'
          description="We're available Mon-Fri, 9am-5pm."
          icon={Phone}
          title='Phone'
        >
          <div>
            <a className='block font-medium font-mono text-sm tracking-wide hover:underline' href={`tel:${APP_PHONE}`}>
              {APP_PHONE}
            </a>
            <a
              className='block font-medium font-mono text-sm tracking-wide hover:underline'
              href={`tel:${APP_PHONE_2}`}
            >
              {APP_PHONE_2}
            </a>
          </div>
        </Box>
      </div>
      <BorderSeparator />
      <div className='z-1 flex h-full flex-col items-center justify-center gap-4 py-24'>
        <h2 className='text-center font-medium text-2xl text-muted-foreground tracking-tight md:text-3xl'>
          Find us <span className='text-foreground'>online</span>
        </h2>
        <div className='flex flex-wrap items-center gap-2'>
          {socialLinks.map((link) => (
            <a
              className='flex items-center gap-x-2 rounded-full border bg-card px-3 py-1.5 shadow hover:bg-accent'
              href={link.href}
              key={link.label}
              rel='noopener noreferrer'
              target='_blank'
            >
              <link.icon className='size-3.5 text-muted-foreground' />
              <span className='font-medium font-mono text-xs tracking-wide'>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function BorderSeparator({ className }: React.ComponentProps<'div'>) {
  return <div className={cn('absolute inset-x-0 h-px w-full border-b', className)} />;
}

type ContactBox = React.ComponentProps<'div'> & {
  icon: LucideIcon;
  title: string;
  description: string;
};

function Box({ title, description, className, children, ...props }: ContactBox) {
  return (
    <div className={cn('flex flex-col justify-between border-b md:border-r md:border-b-0', className)}>
      <div className='flex items-center gap-x-3 border-b bg-secondary/50 p-4 dark:bg-secondary/20'>
        <props.icon className='size-5 text-muted-foreground' strokeWidth={1} />
        <h2 className='font-heading font-medium text-lg tracking-wider'>{title}</h2>
      </div>
      <div className='flex items-center gap-x-2 p-4 py-12'>{children}</div>
      <div className='border-t p-4'>
        <p className='text-muted-foreground text-sm'>{description}</p>
      </div>
    </div>
  );
}

const XIcon = (props: React.ComponentProps<'svg'>) => (
  <svg fill='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' {...props}>
    <path d='m18.9,1.153h3.682l-8.042,9.189,9.46,12.506h-7.405l-5.804-7.583-6.634,7.583H.469l8.6-9.831L0,1.153h7.593l5.241,6.931,6.065-6.931Zm-1.293,19.494h2.039L6.482,3.239h-2.19l13.314,17.408Z' />
  </svg>
);
