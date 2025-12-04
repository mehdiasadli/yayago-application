import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation/navigation-client';
import { ArrowRight, BarChart3, Globe, Shield, Wallet } from 'lucide-react';

const benefits = [
  {
    icon: Globe,
    title: 'Reach More Customers',
    description: 'Get your fleet in front of thousands of potential customers actively searching for rentals.',
  },
  {
    icon: Wallet,
    title: 'Guaranteed Payments',
    description: 'We handle all payments. You receive your earnings directly – no chasing customers.',
  },
  {
    icon: Shield,
    title: 'Verified Renters',
    description: 'Every customer is ID-verified before they can book. Protect your vehicles with confidence.',
  },
  {
    icon: BarChart3,
    title: 'Grow Your Business',
    description: 'Access analytics, manage bookings, and scale your operations with our partner dashboard.',
  },
];

export function AboutForPartners() {
  return (
    <section className='relative overflow-hidden bg-muted/50 py-20 lg:py-28'>
      {/* Pattern */}
      <div className='absolute inset-0 opacity-[0.02]'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='about-partner-hex' width='50' height='43.4' patternUnits='userSpaceOnUse' patternTransform='scale(2)'>
              <polygon
                points='24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2'
                fill='none'
                stroke='currentColor'
                strokeWidth='0.5'
              />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#about-partner-hex)' />
        </svg>
      </div>

      <div className='container relative z-10 mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            {/* Left side - Content */}
            <div>
              <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary'>
                For Rental Companies
              </div>
              <h2 className='font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl mb-6'>
                Grow Your Rental Business with YayaGO
              </h2>
              <p className='text-muted-foreground text-lg leading-relaxed mb-8'>
                YayaGO isn't just for renters – it's a powerful platform for rental companies too. Join hundreds of
                partners who are growing their business by listing their fleet on our marketplace.
              </p>

              <div className='flex flex-col sm:flex-row gap-4'>
                <Button size='lg' className='h-12' asChild>
                  <Link href='/become-a-host'>
                    Become a Partner
                    <ArrowRight className='ml-2 size-5' />
                  </Link>
                </Button>
                <Button size='lg' variant='outline' className='h-12' asChild>
                  <Link href='/pricing'>View Pricing</Link>
                </Button>
              </div>
            </div>

            {/* Right side - Benefits grid */}
            <div className='grid sm:grid-cols-2 gap-4'>
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className='group p-5 rounded-2xl border bg-card hover:shadow-xl hover:border-primary/30 transition-all duration-300'
                >
                  <div className='flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 mb-4'>
                    <benefit.icon className='size-6' />
                  </div>
                  <h3 className='font-bold text-lg mb-2'>{benefit.title}</h3>
                  <p className='text-muted-foreground text-sm leading-relaxed'>{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className='mt-16 grid grid-cols-2 md:grid-cols-4 gap-6'>
            <div className='text-center p-6 rounded-2xl bg-card border'>
              <p className='text-3xl font-bold text-primary'>95%</p>
              <p className='text-sm text-muted-foreground mt-1'>Revenue You Keep</p>
            </div>
            <div className='text-center p-6 rounded-2xl bg-card border'>
              <p className='text-3xl font-bold text-primary'>24h</p>
              <p className='text-sm text-muted-foreground mt-1'>Fast Payouts</p>
            </div>
            <div className='text-center p-6 rounded-2xl bg-card border'>
              <p className='text-3xl font-bold text-primary'>0</p>
              <p className='text-sm text-muted-foreground mt-1'>Listing Fees</p>
            </div>
            <div className='text-center p-6 rounded-2xl bg-card border'>
              <p className='text-3xl font-bold text-primary'>500+</p>
              <p className='text-sm text-muted-foreground mt-1'>Active Partners</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

