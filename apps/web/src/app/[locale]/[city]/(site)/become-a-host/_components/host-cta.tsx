import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation/navigation-client';
import { ArrowRight } from 'lucide-react';

export function HostCTA() {
  return (
    <section className='bg-primary py-16 text-primary-foreground'>
      <div className='container mx-auto px-4 text-center'>
        <h2 className='mb-4 font-bold text-3xl tracking-tight md:text-4xl'>
          Ready to Grow Your Business?
        </h2>
        <p className='mx-auto mb-8 max-w-2xl text-lg opacity-90'>
          Join hundreds of successful rental partners on YayaGO. Sign up today and start listing your fleet.
        </p>
        <Button size='lg' variant='secondary' asChild>
          <Link href='/signup?role=partner'>
            Get Started Now
            <ArrowRight className='ml-2 size-4' />
          </Link>
        </Button>
      </div>
    </section>
  );
}

