'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FrequencyToggle } from '@/components/frequency-toggle';
import { NumberTicker } from '@/components/ui/number-ticker';
import { authClient } from '@/lib/auth-client';
import { useRouter, Link } from '@/lib/navigation/navigation-client';
import { cn } from '@/lib/utils';
import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Check,
  Crown,
  Loader2,
  PackageX,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useState } from 'react';
import { toast } from 'sonner';
import type { GetPublicSubscriptionPlansOutputType } from '@yayago-app/validators';

type SubscriptionPlan = GetPublicSubscriptionPlansOutputType[number];

function getPriceForFrequency(plan: SubscriptionPlan, frequency: 'monthly' | 'yearly') {
  const interval = frequency === 'monthly' ? 'month' : 'year';
  const price = plan.prices.find((p) => p.interval === interval);
  return price ? price.amount / 100 : 0;
}

function getStripePriceId(plan: SubscriptionPlan, frequency: 'monthly' | 'yearly') {
  const interval = frequency === 'monthly' ? 'month' : 'year';
  const price = plan.prices.find((p) => p.interval === interval);
  return price?.stripePriceId;
}

export function HostPricing() {
  const [frequency, setFrequency] = useQueryState(
    'frequency',
    parseAsStringLiteral(['monthly', 'yearly']).withDefault('monthly')
  );

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => orpc.subscriptionPlans.getPublicPlans.call(),
  });

  return (
    <section id='pricing' className='relative overflow-hidden py-20 lg:py-28 scroll-mt-20'>
      {/* Diagonal lines pattern */}
      <div className='absolute inset-0 opacity-[0.02]'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='pricing-diag' width='20' height='20' patternUnits='userSpaceOnUse'>
              <path d='M 0 20 L 20 0' fill='none' stroke='currentColor' strokeWidth='0.5' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#pricing-diag)' />
        </svg>
      </div>

      {/* Gradient blobs */}
      <div className='absolute top-20 left-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl' />
      <div className='absolute bottom-20 right-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl' />

      <div className='container relative z-10 mx-auto px-4'>
        <div className='mx-auto max-w-6xl'>
          {/* Header */}
          <div className='text-center mb-12'>
            <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary'>
              <Zap className='size-4' />
              Simple & Transparent Pricing
            </div>
            <h2 className='font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl mb-4'>
              Choose Your Plan
            </h2>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
              Start with a plan that fits your business. Upgrade anytime as you grow. 
              All plans include our 5% commission model – no hidden fees.
            </p>
          </div>

          {/* Frequency Toggle */}
          <div className='flex justify-center mb-12'>
            <div className='inline-flex items-center gap-3 p-1.5 rounded-2xl bg-muted/50 border'>
              <FrequencyToggle frequency={frequency} setFrequency={setFrequency} />
            </div>
          </div>

          {/* Plans */}
          {isLoading ? (
            <div className='flex items-center justify-center py-16'>
              <Loader2 className='size-8 animate-spin text-primary' />
            </div>
          ) : plans && plans.length > 0 ? (
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {plans.map((plan, index) => (
                <PricingCard key={plan.slug} plan={plan} frequency={frequency} index={index} />
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center gap-4 py-16 text-center'>
              <div className='rounded-2xl bg-muted p-6'>
                <PackageX className='size-12 text-muted-foreground' />
              </div>
              <div className='space-y-2'>
                <h3 className='text-xl font-semibold'>No plans available</h3>
                <p className='text-muted-foreground max-w-md'>
                  Pricing plans are being updated. Please check back later or contact us for more information.
                </p>
              </div>
            </div>
          )}

          {/* Commission info */}
          <div className='mt-16 rounded-3xl border-2 border-primary/20 bg-primary/5 p-8 text-center'>
            <div className='flex size-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4'>
              <Sparkles className='size-7 text-primary' />
            </div>
            <h3 className='font-bold text-2xl mb-3'>Plus, Our Simple 5% Commission</h3>
            <p className='text-muted-foreground max-w-2xl mx-auto mb-6'>
              On top of your subscription, we only take a 5% commission on successful bookings. 
              No booking? No fee. You keep 95% of every rental – that's it, no hidden charges.
            </p>
            <div className='flex flex-wrap justify-center gap-4'>
              <div className='flex items-center gap-2 text-sm'>
                <Check className='size-4 text-primary' />
                <span>No listing fees</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Check className='size-4 text-primary' />
                <span>No monthly minimums</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Check className='size-4 text-primary' />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface PricingCardProps {
  plan: SubscriptionPlan;
  frequency: 'monthly' | 'yearly';
  index: number;
}

function PricingCard({ plan, frequency, index }: PricingCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = authClient.useSession();
  const priceToShow = getPriceForFrequency(plan, frequency);
  const organizationUrl = `${process.env.NEXT_PUBLIC_PARTNER_URL}/login?callback_url=/onboarding`;

  const isPopular = plan.isPopular;

  async function onGetStarted() {
    if (!session?.user) {
      toast.info('Please sign in to subscribe');
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const stripePriceId = getStripePriceId(plan, frequency);

    if (!stripePriceId) {
      toast.error('Price not available for this plan');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.subscription.upgrade({
        plan: plan.slug,
        annual: frequency === 'yearly',
        successUrl: organizationUrl,
        cancelUrl: window.location.origin + '/become-a-host',
        disableRedirect: false,
      });

      if (result.error) {
        toast.error(result.error.message || 'Failed to start subscription');
        setIsLoading(false);
        return;
      }

      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  }

  return (
    <div
      className={cn(
        'relative rounded-3xl p-6 lg:p-8 transition-all duration-300 group',
        isPopular
          ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/25 scale-[1.02] lg:scale-105'
          : 'bg-card border-2 hover:border-primary/30 hover:shadow-lg'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className='absolute -top-4 left-1/2 -translate-x-1/2'>
          <Badge className='bg-white text-primary shadow-lg px-4 py-1'>
            <Crown className='size-3 mr-1' />
            Most Popular
          </Badge>
        </div>
      )}

      {/* Plan header */}
      <div className='mb-6'>
        <h3 className={cn('font-bold text-xl mb-2', isPopular ? 'text-white' : 'text-foreground')}>
          {plan.name}
        </h3>
        {plan.description && (
          <p className={cn('text-sm', isPopular ? 'text-white/80' : 'text-muted-foreground')}>
            {plan.description}
          </p>
        )}
      </div>

      {/* Price */}
      <div className='mb-6'>
        <div className='flex items-baseline gap-1'>
          <span className={cn('text-5xl font-bold', isPopular ? 'text-white' : 'text-foreground')}>
            <NumberTicker value={priceToShow}>{priceToShow}</NumberTicker>
          </span>
          <span className={cn('text-lg', isPopular ? 'text-white/70' : 'text-muted-foreground')}>
            AED/{frequency === 'monthly' ? 'mo' : 'yr'}
          </span>
        </div>
        {plan.trialEnabled && plan.trialDays > 0 && (
          <p className={cn('text-sm mt-2', isPopular ? 'text-white/70' : 'text-muted-foreground')}>
            {plan.trialDays}-day free trial included
          </p>
        )}
      </div>

      {/* Limits */}
      <div className={cn('mb-6 p-4 rounded-xl', isPopular ? 'bg-white/10' : 'bg-muted/50')}>
        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div>
            <p className={cn('font-semibold', isPopular ? 'text-white' : 'text-foreground')}>
              {plan.maxListings}
            </p>
            <p className={cn(isPopular ? 'text-white/70' : 'text-muted-foreground')}>Listings</p>
          </div>
          <div>
            <p className={cn('font-semibold', isPopular ? 'text-white' : 'text-foreground')}>
              {plan.maxMembers}
            </p>
            <p className={cn(isPopular ? 'text-white/70' : 'text-muted-foreground')}>Team Members</p>
          </div>
          {plan.maxFeaturedListings > 0 && (
            <div className='col-span-2'>
              <p className={cn('font-semibold', isPopular ? 'text-white' : 'text-foreground')}>
                {plan.maxFeaturedListings} Featured
              </p>
              <p className={cn(isPopular ? 'text-white/70' : 'text-muted-foreground')}>
                Highlighted listings
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <Button
        onClick={onGetStarted}
        disabled={isLoading}
        className={cn(
          'w-full h-12 rounded-xl font-semibold transition-all',
          isPopular
            ? 'bg-white text-primary hover:bg-white/90 shadow-lg'
            : 'bg-primary text-white hover:bg-primary/90'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className='size-4 animate-spin mr-2' />
            Processing...
          </>
        ) : (
          <>
            Get Started
            <ArrowRight className='ml-2 size-4' />
          </>
        )}
      </Button>

      {/* Features */}
      <div className='mt-6 pt-6 border-t border-current/10'>
        <p className={cn('text-sm font-medium mb-3', isPopular ? 'text-white' : 'text-foreground')}>
          What's included:
        </p>
        <ul className='space-y-2.5'>
          {plan.features.map((feature, i) => (
            <li key={i} className='flex items-start gap-2.5 text-sm'>
              {feature.isIncluded ? (
                <div
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full mt-0.5',
                    isPopular ? 'bg-white/20' : 'bg-primary/10'
                  )}
                >
                  <Check className={cn('size-3', isPopular ? 'text-white' : 'text-primary')} />
                </div>
              ) : (
                <div
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full mt-0.5',
                    isPopular ? 'bg-white/10' : 'bg-muted'
                  )}
                >
                  <X className={cn('size-3', isPopular ? 'text-white/50' : 'text-muted-foreground')} />
                </div>
              )}
              <span
                className={cn(
                  !feature.isIncluded && (isPopular ? 'text-white/50 line-through' : 'text-muted-foreground line-through'),
                  feature.isIncluded && (isPopular ? 'text-white/90' : 'text-foreground')
                )}
              >
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

