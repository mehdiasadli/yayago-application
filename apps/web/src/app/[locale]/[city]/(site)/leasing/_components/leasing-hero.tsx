import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation/navigation-client';
import { ChevronRight } from 'lucide-react';

export function LeasingHero() {
  return (
    <div className='relative overflow-hidden py-24 lg:py-32'>
      <div className='container relative z-10 mx-auto px-4 text-center'>
        <Badge variant='outline' className='mb-4 px-4 py-1 text-sm'>
          Drive Your Dream Car
        </Badge>
        <h1 className='mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text font-bold text-4xl text-transparent tracking-tight sm:text-5xl lg:text-6xl'>
          Smart Leasing Solutions
          <br />
          for Personal & Business
        </h1>
        <p className='mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl'>
          Enjoy the flexibility of ownership without the hassle. Get behind the wheel of brand new vehicles with our competitive leasing plans tailored to your needs.
        </p>
        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
          <Button size='lg' asChild>
            <Link href='#calculator'>
              Calculate Payments
              <ChevronRight className='ml-2 size-4' />
            </Link>
          </Button>
          <Button variant='outline' size='lg' asChild>
            <Link href='/contact'>Contact Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

