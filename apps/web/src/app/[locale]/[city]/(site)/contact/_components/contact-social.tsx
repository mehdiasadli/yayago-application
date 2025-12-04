import { Link } from '@/lib/navigation/navigation-client';
import { ArrowRight, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const socialLinks = [
  {
    icon: Instagram,
    name: 'Instagram',
    handle: '@yayago',
    href: 'https://instagram.com/yayago',
    color: 'hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500',
  },
  {
    icon: Twitter,
    name: 'Twitter / X',
    handle: '@yayago',
    href: 'https://twitter.com/yayago',
    color: 'hover:bg-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900',
  },
  {
    icon: Facebook,
    name: 'Facebook',
    handle: 'YayaGO',
    href: 'https://facebook.com/yayago',
    color: 'hover:bg-blue-600',
  },
  {
    icon: Youtube,
    name: 'YouTube',
    handle: 'YayaGO',
    href: 'https://youtube.com/yayago',
    color: 'hover:bg-red-600',
  },
];

export function ContactSocial() {
  return (
    <section className='relative overflow-hidden bg-muted/50 py-20 lg:py-28'>
      {/* Pattern background */}
      <div className='absolute inset-0 opacity-[0.02]'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='contact-social-pattern' width='20' height='20' patternUnits='userSpaceOnUse'>
              <path d='M 0 20 L 20 0' fill='none' stroke='currentColor' strokeWidth='1' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#contact-social-pattern)' />
        </svg>
      </div>

      <div className='container relative z-10 mx-auto px-4'>
        <div className='max-w-5xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            {/* Left - Social Links */}
            <div>
              <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary'>
                Connect With Us
              </div>
              <h2 className='font-bold text-3xl tracking-tight md:text-4xl mb-4'>Follow Us Online</h2>
              <p className='text-muted-foreground text-lg mb-8'>
                Stay updated with the latest news, promotions, and car listings by following us on social media.
              </p>

              <div className='grid grid-cols-2 gap-3'>
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={`group flex items-center gap-3 p-4 rounded-xl border bg-card hover:text-white hover:border-transparent transition-all duration-300 ${social.color}`}
                  >
                    <social.icon className='size-5' />
                    <div>
                      <p className='font-medium text-sm'>{social.name}</p>
                      <p className='text-xs text-muted-foreground group-hover:text-white/70'>{social.handle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Right - FAQ Link */}
            <div className='rounded-3xl border-2 border-primary/20 bg-card p-8 text-center'>
              <div className='flex size-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6'>
                <svg className='size-8 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h3 className='font-bold text-2xl mb-3'>Have Questions?</h3>
              <p className='text-muted-foreground mb-6'>
                Check out our FAQ page for answers to commonly asked questions about bookings, payments, and more.
              </p>
              <Link
                href='/faq'
                className='inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors'
              >
                Visit FAQ
                <ArrowRight className='size-4' />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

