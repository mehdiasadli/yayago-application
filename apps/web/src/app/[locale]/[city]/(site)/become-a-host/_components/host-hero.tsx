import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation/navigation-client';
import { ArrowRight, Building2, Sparkles } from 'lucide-react';

export function HostHero() {
  return (
    <section className='relative overflow-hidden bg-primary py-24 lg:py-36'>
      {/* Grid pattern background */}
      <div className='absolute inset-0 opacity-10'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='hero-grid' width='40' height='40' patternUnits='userSpaceOnUse'>
              <path d='M 40 0 L 0 0 0 40' fill='none' stroke='white' strokeWidth='1' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#hero-grid)' />
        </svg>
      </div>

      {/* Decorative blurred circles */}
      <div className='absolute top-20 right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl' />
      <div className='absolute bottom-10 left-10 h-64 w-64 rounded-full bg-white/5 blur-3xl' />
      <div className='absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-white/5 blur-2xl' />

      <div className='container relative z-10 mx-auto px-4 text-center'>
        <div className='mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm'>
          <Building2 className='size-4 text-white' />
          <span className='font-medium text-white'>For Rental Companies</span>
          <Sparkles className='size-4 text-white/70' />
        </div>

        <h1 className='mb-6 font-bold text-4xl text-white tracking-tight sm:text-5xl lg:text-6xl'>
          Scale Your Car Rental Business
          <br />
          <span className='text-white/80'>with YayaGO</span>
        </h1>

        <p className='mx-auto mb-10 max-w-2xl text-lg text-white/80 sm:text-xl'>
          Join the fastest-growing marketplace in the UAE. We handle the technology, marketing, and payments so you can
          focus on managing your fleet.
        </p>

        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
          <Button
            size='lg'
            variant='secondary'
            className='h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow'
            asChild
          >
            <Link href='/signup?role=partner'>
              Become a Partner
              <ArrowRight className='ml-2 size-5' />
            </Link>
          </Button>
          <Button
            size='lg'
            variant='outline'
            className='h-12 px-8 text-base border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm'
            asChild
          >
            <Link href='#calculator'>Calculate Earnings</Link>
          </Button>
        </div>

        {/* Stats row */}
        <div className='mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto'>
          <div className='text-center'>
            <p className='text-3xl font-bold text-white lg:text-4xl'>500+</p>
            <p className='text-sm text-white/70 mt-1'>Active Partners</p>
          </div>
          <div className='text-center border-x border-white/20'>
            <p className='text-3xl font-bold text-white lg:text-4xl'>10K+</p>
            <p className='text-sm text-white/70 mt-1'>Vehicles Listed</p>
          </div>
          <div className='text-center'>
            <p className='text-3xl font-bold text-white lg:text-4xl'>95%</p>
            <p className='text-sm text-white/70 mt-1'>You Keep</p>
          </div>
        </div>
      </div>
    </section>
  );
}
