import { Building2, Car, Sparkles, Users } from 'lucide-react';

export function AboutHero() {
  return (
    <section className='relative overflow-hidden bg-primary py-24 lg:py-36'>
      {/* Grid pattern background */}
      <div className='absolute inset-0 opacity-10'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='about-hero-grid' width='40' height='40' patternUnits='userSpaceOnUse'>
              <path d='M 40 0 L 0 0 0 40' fill='none' stroke='white' strokeWidth='1' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#about-hero-grid)' />
        </svg>
      </div>

      {/* Decorative blurred circles */}
      <div className='absolute top-20 right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl' />
      <div className='absolute bottom-10 left-10 h-64 w-64 rounded-full bg-white/5 blur-3xl' />
      <div className='absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-white/5 blur-2xl' />

      <div className='container relative z-10 mx-auto px-4 text-center'>
        <div className='mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm'>
          <Sparkles className='size-4 text-white' />
          <span className='font-medium text-white'>The Car Rental Marketplace</span>
        </div>

        <h1 className='mb-6 font-bold text-4xl text-white tracking-tight sm:text-5xl lg:text-6xl'>
          We're Not a Car Rental.
          <br />
          <span className='text-white/80'>We're Something Better.</span>
        </h1>

        <p className='mx-auto mb-10 max-w-3xl text-lg text-white/80 sm:text-xl leading-relaxed'>
          YayaGO is the UAE's first true car rental marketplace. We connect you directly with verified rental companies,
          letting you book, pay, and drive – all in one seamless experience.
        </p>

        {/* Key differentiators */}
        <div className='mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto'>
          <div className='flex flex-col items-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20'>
            <div className='flex size-14 items-center justify-center rounded-xl bg-white/20 mb-4'>
              <Building2 className='size-7 text-white' />
            </div>
            <p className='text-2xl font-bold text-white'>500+</p>
            <p className='text-sm text-white/70'>Partner Companies</p>
          </div>
          <div className='flex flex-col items-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20'>
            <div className='flex size-14 items-center justify-center rounded-xl bg-white/20 mb-4'>
              <Car className='size-7 text-white' />
            </div>
            <p className='text-2xl font-bold text-white'>10,000+</p>
            <p className='text-sm text-white/70'>Vehicles Listed</p>
          </div>
          <div className='flex flex-col items-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20'>
            <div className='flex size-14 items-center justify-center rounded-xl bg-white/20 mb-4'>
              <Users className='size-7 text-white' />
            </div>
            <p className='text-2xl font-bold text-white'>50,000+</p>
            <p className='text-sm text-white/70'>Happy Customers</p>
          </div>
        </div>
      </div>
    </section>
  );
}
