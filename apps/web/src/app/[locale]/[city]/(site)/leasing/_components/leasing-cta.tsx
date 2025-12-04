import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation/navigation-client';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function LeasingCTA() {
  return (
    <section className='relative overflow-hidden bg-primary py-20 lg:py-28 text-primary-foreground'>
      {/* Grid pattern */}
      <div className='absolute inset-0 opacity-10'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='leasing-cta-grid' width='32' height='32' patternUnits='userSpaceOnUse'>
              <path d='M 32 0 L 0 0 0 32' fill='none' stroke='white' strokeWidth='0.5' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#leasing-cta-grid)' />
        </svg>
      </div>

      {/* Decorative circles */}
      <div className='absolute top-10 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl' />
      <div className='absolute bottom-10 right-10 h-80 w-80 rounded-full bg-white/5 blur-3xl' />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/5 blur-3xl' />

      <div className='container relative z-10 mx-auto px-4'>
        <div className='max-w-3xl mx-auto text-center'>
          <h2 className='mb-6 font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl'>
            Ready to Drive Your Dream Car?
          </h2>
          <p className='mx-auto mb-10 max-w-2xl text-lg text-white/80 lg:text-xl'>
            Get behind the wheel of a brand new vehicle with flexible leasing options. Contact our team today for a
            personalized quote.
          </p>

          {/* Benefits list */}
          <div className='flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10'>
            <div className='flex items-center gap-2 text-white/90'>
              <CheckCircle className='size-5' />
              <span>24h Approval</span>
            </div>
            <div className='flex items-center gap-2 text-white/90'>
              <CheckCircle className='size-5' />
              <span>Free Delivery</span>
            </div>
            <div className='flex items-center gap-2 text-white/90'>
              <CheckCircle className='size-5' />
              <span>Flexible Terms</span>
            </div>
          </div>

          <Button
            size='lg'
            variant='secondary'
            className='h-14 px-10 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105'
            asChild
          >
            <Link href='/contact'>
              Contact Sales
              <ArrowRight className='ml-2 size-5' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

