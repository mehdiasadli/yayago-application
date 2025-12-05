import { HelpCircle, Search } from 'lucide-react';

interface FaqHeroProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function FaqHero({ searchTerm, onSearchChange }: FaqHeroProps) {
  return (
    <section className='relative overflow-hidden bg-primary py-20 lg:py-28'>
      {/* Grid pattern background */}
      <div className='absolute inset-0 opacity-10'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='faq-hero-grid' width='40' height='40' patternUnits='userSpaceOnUse'>
              <path d='M 40 0 L 0 0 0 40' fill='none' stroke='white' strokeWidth='1' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#faq-hero-grid)' />
        </svg>
      </div>

      {/* Decorative blurred circles */}
      <div className='absolute top-20 right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl' />
      <div className='absolute bottom-10 left-10 h-64 w-64 rounded-full bg-white/5 blur-3xl' />

      <div className='container relative z-10 mx-auto px-4'>
        <div className='max-w-3xl mx-auto text-center'>
          <div className='mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm'>
            <HelpCircle className='size-4 text-white' />
            <span className='font-medium text-white'>Help Center</span>
          </div>

          <h1 className='mb-6 font-bold text-4xl text-white tracking-tight sm:text-5xl lg:text-6xl'>
            Frequently Asked
            <br />
            <span className='text-white/80'>Questions</span>
          </h1>

          <p className='mx-auto mb-10 max-w-2xl text-lg text-white/80'>
            Find answers to common questions about booking, payments, partnerships, and more. Can't find what you're
            looking for? Our support team is here to help.
          </p>

          {/* Search input */}
          <div className='max-w-xl mx-auto'>
            <div className='relative'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50' />
              <input
                type='text'
                placeholder='Search for answers...'
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className='w-full h-14 pl-12 pr-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

