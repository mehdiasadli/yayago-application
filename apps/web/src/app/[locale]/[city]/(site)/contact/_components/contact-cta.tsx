import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation/navigation-client';
import { ArrowRight, Building2, Car } from 'lucide-react';

export function ContactCTA() {
  return (
    <section className='relative overflow-hidden bg-primary py-20 lg:py-28 text-primary-foreground'>
      {/* Grid pattern */}
      <div className='absolute inset-0 opacity-10'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='contact-cta-grid' width='32' height='32' patternUnits='userSpaceOnUse'>
              <path d='M 32 0 L 0 0 0 32' fill='none' stroke='white' strokeWidth='0.5' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#contact-cta-grid)' />
        </svg>
      </div>

      {/* Decorative circles */}
      <div className='absolute top-10 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl' />
      <div className='absolute bottom-10 right-10 h-80 w-80 rounded-full bg-white/5 blur-3xl' />

      <div className='container relative z-10 mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-8'>
            {/* For Renters */}
            <div className='rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 text-center'>
              <div className='flex size-14 items-center justify-center rounded-xl bg-white/20 mx-auto mb-6'>
                <Car className='size-7 text-white' />
              </div>
              <h3 className='font-bold text-2xl mb-3'>Looking to Rent?</h3>
              <p className='text-white/80 mb-6'>
                Browse thousands of vehicles from verified rental companies and book your perfect car today.
              </p>
              <Button
                size='lg'
                variant='secondary'
                className='h-12 px-8 font-semibold shadow-lg hover:shadow-xl transition-shadow'
                asChild
              >
                <Link href='/rent/cars'>
                  Browse Cars
                  <ArrowRight className='ml-2 size-5' />
                </Link>
              </Button>
            </div>

            {/* For Partners */}
            <div className='rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 text-center'>
              <div className='flex size-14 items-center justify-center rounded-xl bg-white/20 mx-auto mb-6'>
                <Building2 className='size-7 text-white' />
              </div>
              <h3 className='font-bold text-2xl mb-3'>Own a Rental Company?</h3>
              <p className='text-white/80 mb-6'>
                Join our marketplace and reach thousands of customers. List your fleet and start earning today.
              </p>
              <Button
                size='lg'
                variant='outline'
                className='h-12 px-8 font-semibold border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white'
                asChild
              >
                <Link href='/become-a-host'>
                  Become a Partner
                  <ArrowRight className='ml-2 size-5' />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

