import { Button } from '@/components/ui/button';
import { Car, Key, PlusIcon } from 'lucide-react';
import { Link } from '@/lib/navigation/navigation-client';

export function AboutCTA() {
  return (
    <div className='relative grid w-full border md:grid-cols-2'>
      <PlusIcon className='-top-[12.5px] -left-[12.5px] absolute h-6 w-6 text-muted-foreground/50' strokeWidth={1} />
      <PlusIcon className='-top-[12.5px] -right-[12.5px] absolute h-6 w-6 text-muted-foreground/50' strokeWidth={1} />
      <PlusIcon className='-bottom-[12.5px] -left-[12.5px] absolute h-6 w-6 text-muted-foreground/50' strokeWidth={1} />
      <PlusIcon
        className='-right-[12.5px] -bottom-[12.5px] absolute h-6 w-6 text-muted-foreground/50'
        strokeWidth={1}
      />

      <div className='flex flex-col justify-center bg-secondary/50 p-8 md:border-r dark:bg-secondary/20'>
        <h2 className='mb-4 font-semibold text-3xl tracking-tight'>Ready to get started?</h2>
        <p className='mb-6 text-muted-foreground'>
          Whether you are looking for the perfect ride or want to earn from your vehicle, YayaGO has you covered.
        </p>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <Button asChild size='lg'>
            <Link href='/rent/cars'>
              <Key className='mr-2 size-4' />
              Rent a Car
            </Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link href='/become-a-host'>
              <Car className='mr-2 size-4' />
              Become a Host
            </Link>
          </Button>
        </div>
      </div>

      <div className='flex flex-col justify-center bg-card p-8'>
        <div className='grid gap-6 sm:grid-cols-2'>
          <Stat value='500+' label='Vehicles' />
          <Stat value='50+' label='Brands' />
          <Stat value='24/7' label='Support' />
          <Stat value='100%' label='Verified' />
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='font-bold text-3xl tracking-tight'>{value}</span>
      <span className='text-muted-foreground text-sm uppercase tracking-wider'>{label}</span>
    </div>
  );
}
