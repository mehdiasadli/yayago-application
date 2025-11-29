'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { CircleCheckBig, CircleX, Crown, Sparkles, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { NumberTicker } from '@/components/ui/number-ticker';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/lib/navigation/navigation-client';
import { useState } from 'react';
import type { GetPublicSubscriptionPlansOutputType } from '@yayago-app/validators';

const pricingColumnVariants = cva(
  'max-w-container relative flex flex-col gap-6 overflow-hidden rounded-2xl p-8 shadow-xl',
  {
    variants: {
      variant: {
        default: 'glass-1 to-transparent dark:glass-3',
        glow: "glass-2 to-trasparent dark:glass-3 after:content-[''] after:absolute after:-top-[128px] after:left-1/2 after:h-[128px] after:w-[100%] after:max-w-[960px] after:-translate-x-1/2 after:rounded-[50%] dark:after:bg-foreground/30 after:blur-[72px]",
        'glow-brand':
          "glass-3 from-card/100 to-card/100 dark:glass-4 after:content-[''] after:absolute after:-top-[128px] after:left-1/2 after:h-[128px] after:w-[100%] after:max-w-[960px] after:-translate-x-1/2 after:rounded-[50%] after:bg-brand-foreground/70 after:blur-[72px]",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type SubscriptionPlan = GetPublicSubscriptionPlansOutputType[number];

export interface PricingColumnProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pricingColumnVariants> {
  plan: SubscriptionPlan;
  currentPlan?: string;
  frequency: 'monthly' | 'yearly';
}

function getPriceForFrequency(plan: SubscriptionPlan, frequency: 'monthly' | 'yearly') {
  const interval = frequency === 'monthly' ? 'month' : 'year';
  const price = plan.prices.find((p) => p.interval === interval);
  return price ? price.amount / 100 : 0; // Convert cents to AED
}

function getStripePriceId(plan: SubscriptionPlan, frequency: 'monthly' | 'yearly') {
  const interval = frequency === 'monthly' ? 'month' : 'year';
  const price = plan.prices.find((p) => p.interval === interval);
  return price?.stripePriceId;
}

export function PricingColumn({ plan, variant, className, frequency, currentPlan, ...props }: PricingColumnProps) {
  const priceToShow = getPriceForFrequency(plan, frequency);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = authClient.useSession();

  const organizationUrl = `${process.env.NEXT_PUBLIC_PARTNER_URL}/login?callback_url=/onboarding`;

  // Determine variant based on plan properties
  const effectiveVariant = variant ?? (plan.isPopular ? 'glow' : 'default');
  const buttonVariant = plan.isPopular ? 'default' : 'outline';

  async function onGetStarted() {
    // Check if user is logged in
    if (!session?.user) {
      // Redirect to login with return URL
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
        cancelUrl: window.location.origin + '/pricing',
        disableRedirect: false, // Enable auto-redirect to Stripe Checkout
      });

      // If redirect didn't happen automatically, handle it manually
      if (result.error) {
        console.error('❌ Subscription error:', result.error);
        toast.error(result.error.message || 'Failed to start subscription');
        setIsLoading(false);
        return;
      }

      // Fallback: If there's a redirect URL and we're still here, navigate manually
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
    // Note: Don't setIsLoading(false) here as user will be redirected
  }

  const isCurrentPlan = currentPlan === plan.slug;

  return (
    <div className={cn(pricingColumnVariants({ variant: effectiveVariant, className }))} {...props}>
      <hr
        className={cn(
          'via-foreground/60 absolute top-0 left-[10%] h-px w-[80%] border-0 bg-linear-to-r from-transparent to-transparent',
          effectiveVariant === 'glow-brand' && 'via-brand'
        )}
      />
      <div className='flex flex-col gap-7'>
        <div className='flex flex-col gap-2'>
          <h2 className='flex items-center gap-2 font-bold'>
            {plan.isPopular && (
              <div className='text-amber-500 flex items-center gap-2'>
                <Crown className='size-4' />
              </div>
            )}
            {plan.name}
            {isCurrentPlan && <Badge variant='outline'>Current Plan</Badge>}
            {plan.isPopular && !isCurrentPlan && (
              <Badge variant='secondary'>
                <Sparkles className='size-3 mr-1' />
                Popular
              </Badge>
            )}
          </h2>
          {plan.description && <p className='text-muted-foreground max-w-[220px] text-sm'>{plan.description}</p>}
        </div>

        <div className='flex items-center gap-3 lg:flex-col lg:items-start xl:flex-row xl:items-center'>
          <div className='flex items-baseline gap-1'>
            <span className='text-6xl font-bold'>
              <NumberTicker value={priceToShow}>{priceToShow}</NumberTicker>
              <span className='text-muted-foreground text-2xl font-bold'> AED</span>
              <span className='text-muted-foreground text-2xl font-bold'>
                {' '}
                / {frequency === 'monthly' ? 'month' : 'year'}
              </span>
            </span>
          </div>
        </div>

        {!currentPlan && (
          <Button variant={buttonVariant} size='lg' onClick={onGetStarted} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='size-4 animate-spin mr-2' />
                Processing...
              </>
            ) : (
              'Get started'
            )}
          </Button>
        )}

        {plan.trialEnabled && plan.trialDays > 0 && (
          <p className='text-muted-foreground text-sm'>{plan.trialDays}-day free trial included</p>
        )}

        <div className='text-muted-foreground text-xs space-y-1'>
          <p>Up to {plan.maxListings} listings</p>
          <p>Up to {plan.maxMembers} team members</p>
          {plan.maxFeaturedListings > 0 && <p>{plan.maxFeaturedListings} featured listings</p>}
        </div>

        <hr className='border-input' />
      </div>

      <div>
        <ul className='flex flex-col gap-2'>
          {plan.features.map((feature, index) => (
            <li key={index} className='flex items-center gap-2 text-sm'>
              {feature.isIncluded ? (
                <CircleCheckBig className='text-emerald-500 size-4 shrink-0' />
              ) : (
                <CircleX className='text-muted-foreground/50 size-4 shrink-0' />
              )}
              <span className={cn(!feature.isIncluded && 'text-muted-foreground/50 line-through')}>{feature.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export { pricingColumnVariants };
