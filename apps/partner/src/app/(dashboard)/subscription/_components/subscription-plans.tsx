'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, Crown, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface CurrentPlan {
  name: string;
  slug: string;
}

interface Props {
  currentPlan: CurrentPlan;
}

interface PlanPrice {
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  stripePriceId: string;
}

interface PlanFeature {
  name: string;
  description?: string;
  isIncluded: boolean;
}

interface Plan {
  slug: string;
  name: string;
  description?: string;
  isPopular: boolean;
  prices: PlanPrice[];
  features: PlanFeature[];
  maxListings: number;
  maxFeaturedListings: number;
  maxMembers: number;
  maxImagesPerListing: number;
  hasAnalytics: boolean;
  trialEnabled: boolean;
  trialDays: number;
}

export function SubscriptionPlans({ currentPlan }: Props) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const { data: plans, isLoading, error } = useQuery(
    orpc.subscriptionPlans.getPublicPlans.queryOptions()
  );

  const handleUpgrade = async (plan: Plan) => {
    const price = plan.prices.find((p) => p.interval === (isAnnual ? 'year' : 'month'));
    if (!price) {
      toast.error('Price not available for this billing period');
      return;
    }

    setUpgradingPlan(plan.slug);
    try {
      await authClient.subscription.upgrade({
        plan: plan.slug,
        annual: isAnnual,
        successUrl: `${window.location.origin}/subscription?upgraded=true`,
        cancelUrl: `${window.location.origin}/subscription`,
      });
    } catch (err) {
      console.error('Upgrade error:', err);
      toast.error('Failed to initiate upgrade. Please try again.');
    } finally {
      setUpgradingPlan(null);
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex justify-end'>
          <Skeleton className='h-10 w-48' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Skeleton className='h-96' />
          <Skeleton className='h-96' />
          <Skeleton className='h-96' />
        </div>
      </div>
    );
  }

  if (error || !plans) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertDescription>Failed to load subscription plans</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Billing Toggle */}
      <div className='flex items-center justify-center gap-4 p-4 rounded-lg bg-muted'>
        <Label htmlFor='annual' className={!isAnnual ? 'font-semibold' : 'text-muted-foreground'}>
          Monthly
        </Label>
        <Switch id='annual' checked={isAnnual} onCheckedChange={setIsAnnual} />
        <Label htmlFor='annual' className={isAnnual ? 'font-semibold' : 'text-muted-foreground'}>
          Annual
          <Badge variant='success' className='ml-2'>
            Save 20%
          </Badge>
        </Label>
      </div>

      {/* Plans Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {plans.map((plan) => {
          const price = plan.prices.find((p) => p.interval === (isAnnual ? 'year' : 'month'));
          const isCurrentPlan = plan.slug === currentPlan.slug;
          const monthlyEquivalent = isAnnual && price ? Math.round(price.amount / 12) : price?.amount || 0;

          return (
            <Card
              key={plan.slug}
              className={`relative ${plan.isPopular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'bg-primary/5' : ''}`}
            >
              {plan.isPopular && (
                <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                  <Badge className='gap-1'>
                    <Sparkles className='size-3' />
                    Most Popular
                  </Badge>
                </div>
              )}
              {isCurrentPlan && (
                <div className='absolute -top-3 right-4'>
                  <Badge variant='secondary' className='gap-1'>
                    <Crown className='size-3' />
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className='text-center pb-2'>
                <CardTitle className='text-xl'>{plan.name}</CardTitle>
                {plan.description && (
                  <CardDescription>{plan.description}</CardDescription>
                )}
              </CardHeader>

              <CardContent className='space-y-6'>
                {/* Price */}
                <div className='text-center'>
                  {price ? (
                    <>
                      <div className='flex items-baseline justify-center gap-1'>
                        <span className='text-4xl font-bold'>
                          {formatCurrency(monthlyEquivalent / 100, price.currency)}
                        </span>
                        <span className='text-muted-foreground'>/month</span>
                      </div>
                      {isAnnual && (
                        <p className='text-sm text-muted-foreground mt-1'>
                          Billed {formatCurrency(price.amount / 100, price.currency)} annually
                        </p>
                      )}
                    </>
                  ) : (
                    <span className='text-2xl font-bold text-muted-foreground'>Not available</span>
                  )}
                </div>

                {/* Trial */}
                {plan.trialEnabled && plan.trialDays > 0 && (
                  <div className='text-center'>
                    <Badge variant='outline' className='gap-1'>
                      {plan.trialDays}-day free trial
                    </Badge>
                  </div>
                )}

                {/* Limits */}
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Listings</span>
                    <span className='font-medium'>{plan.maxListings}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Featured</span>
                    <span className='font-medium'>{plan.maxFeaturedListings}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Team Members</span>
                    <span className='font-medium'>{plan.maxMembers}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Images/Listing</span>
                    <span className='font-medium'>{plan.maxImagesPerListing}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Analytics</span>
                    <span className='font-medium'>
                      {plan.hasAnalytics ? (
                        <Check className='size-4 text-green-500 inline' />
                      ) : (
                        <X className='size-4 text-muted-foreground inline' />
                      )}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className='space-y-2'>
                  {plan.features.slice(0, 5).map((feature, index) => (
                    <div key={`${plan.slug}-feature-${index}`} className='flex items-center gap-2 text-sm'>
                      {feature.isIncluded ? (
                        <Check className='size-4 text-green-500 shrink-0' />
                      ) : (
                        <X className='size-4 text-muted-foreground shrink-0' />
                      )}
                      <span className={feature.isIncluded ? '' : 'text-muted-foreground'}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className='w-full'
                  variant={isCurrentPlan ? 'outline' : plan.isPopular ? 'default' : 'secondary'}
                  disabled={isCurrentPlan || !price || upgradingPlan !== null}
                  onClick={() => handleUpgrade(plan)}
                >
                  {upgradingPlan === plan.slug ? (
                    <>
                      <Loader2 className='size-4 mr-2 animate-spin' />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    'Upgrade'
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Note */}
      <p className='text-center text-sm text-muted-foreground'>
        All plans include 24/7 support, secure payments, and automatic backups.
        <br />
        Prices are in AED. You can upgrade or downgrade at any time.
      </p>
    </div>
  );
}

