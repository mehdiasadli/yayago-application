import type React from 'react';
import { cn } from '@/lib/utils';
import { AboutCTA } from './_components/about-cta';
import { AboutHero } from './_components/about-hero';
import { AboutMission } from './_components/about-mission';

export default function AboutPage() {
  return (
    <div className='flex flex-col items-center'>
      <div className='w-full max-w-5xl min-h-[calc(100vh-3.5rem)] lg:border-x'>
        <AboutHero />
        <BorderSeparator />
        <AboutMission />
        <BorderSeparator />
        <div className='p-4 md:p-8'>
          <AboutCTA />
        </div>
      </div>
    </div>
  );
}

function BorderSeparator({ className }: React.ComponentProps<'div'>) {
  return <div className={cn('h-px w-full border-b', className)} />;
}
