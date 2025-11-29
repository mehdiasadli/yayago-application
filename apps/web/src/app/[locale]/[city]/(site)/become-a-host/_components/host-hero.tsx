import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation/navigation-client';
import { ArrowRight, Building2 } from 'lucide-react';

export function HostHero() {
  return (
    <section className='relative overflow-hidden py-20 lg:py-32'>
      <div className='container relative z-10 mx-auto px-4 text-center'>
        <div className='mb-6 inline-flex items-center rounded-full border bg-background/50 px-3 py-1 text-sm backdrop-blur-sm'>
          <Building2 className='mr-2 size-4' />
          <span className='font-medium'>For Rental Companies</span>
        </div>
        
        <h1 className='mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text font-bold text-4xl text-transparent tracking-tight sm:text-5xl lg:text-6xl'>
          Scale Your Car Rental Business
          <br />
          with YayaGO
        </h1>
        
        <p className='mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl'>
          Join the fastest-growing marketplace in the UAE. We handle the technology, marketing, and payments so you can focus on managing your fleet.
        </p>
        
        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
          <Button size='lg' asChild>
            <Link href='/signup?role=partner'>
              Become a Partner
              <ArrowRight className='ml-2 size-4' />
            </Link>
          </Button>
          <Button variant='outline' size='lg' asChild>
            <Link href='#calculator'>Calculate Earnings</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

