'use client';

import { cn } from '@/lib/utils';
import { PricingColumn, type SubscriptionPlan } from './pricing-column';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { FrequencyToggle } from '@/components/frequency-toggle';
import { PackageX } from 'lucide-react';

interface PricingProps {
  title?: string | false;
  description?: string | false;
  plans: SubscriptionPlan[];
  className?: string;
  currentPlan?: string;
}

export default function Pricing({
  title = 'Choose Your Perfect Plan',
  description = 'Flexible pricing plans for your car rental business',
  plans,
  className = '',
  currentPlan,
}: PricingProps) {
  const [frequency, setFrequency] = useQueryState(
    'frequency',
    parseAsStringLiteral(['monthly', 'yearly']).withDefault('monthly')
  );

  return (
    <section className={cn('py-12', className)}>
      <div className='mx-auto flex max-w-6xl flex-col items-center gap-12'>
        {(title || description) && (
          <div className='flex flex-col items-center gap-4 px-4 text-center sm:gap-8'>
            {title && <h2 className='text-3xl leading-tight font-semibold sm:text-5xl sm:leading-tight'>{title}</h2>}
            {description && (
              <p className='text-md text-muted-foreground max-w-[600px] font-medium sm:text-xl'>{description}</p>
            )}
          </div>
        )}
        <FrequencyToggle frequency={frequency} setFrequency={setFrequency} />
        {plans && plans.length > 0 ? (
          <div className='max-w-container mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {plans.map((plan) => (
              <PricingColumn key={plan.slug} plan={plan} frequency={frequency} currentPlan={currentPlan} />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center gap-4 py-16 text-center'>
            <div className='rounded-full bg-muted p-4'>
              <PackageX className='size-8 text-muted-foreground' />
            </div>
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold'>No plans available</h3>
              <p className='text-muted-foreground max-w-[400px] text-sm'>
                Pricing plans are not available at the moment. Please check back later.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
