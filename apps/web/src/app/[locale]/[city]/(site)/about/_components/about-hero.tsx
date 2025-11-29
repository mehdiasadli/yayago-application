import { cn } from '@/lib/utils';

export function AboutHero() {
  return (
    <div className='flex grow flex-col justify-center px-4 py-18 md:items-center'>
      <h1 className='font-bold text-4xl md:text-5xl'>About YayaGO</h1>
      <p className='mb-5 max-w-2xl text-center text-base text-muted-foreground'>
        Revolutionizing the car rental experience in the UAE. We connect drivers with the perfect vehicle for every
        journey, driven by trust, technology, and transparency.
      </p>
    </div>
  );
}
