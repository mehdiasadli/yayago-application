'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Check,
  Crown,
  Loader2,
  Star,
  Zap,
  Building2,
  Car,
  Users,
  BarChart3,
  Image,
  Video,
  Sparkles,
} from 'lucide-react';
import { orpc } from '@/utils/orpc';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const TRIAL_DAYS = 14;

export function PlanSelectionContent() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string | null>(null);

  // Fetch subscription plans
  const { data: plans, isLoading } = useQuery(
    orpc.subscriptionPlans.getPublicPlans.queryOptions({ input: {} })
  );

  // Subscription upgrade mutation
  const { mutateAsync: selectPlan, isPending: isSelecting } = useMutation({
    mutationFn: async (planSlug: string) => {
      const plan = plans?.find((p) => p.slug === planSlug);
      if (!plan) throw new Error('Plan not found');

      const price = plan.prices.find((p) => p.interval === (isYearly ? 'year' : 'month'));
      if (!price) throw new Error('Price not found');

      // Use Better Auth subscription upgrade
      const result = await authClient.subscription.upgrade({
        plan: planSlug,
        annual: isYearly,
        successUrl: `${window.location.origin}/subscription?success=true`,
        cancelUrl: `${window.location.origin}/plan-selection?cancelled=true`,
      });

      return result;
    },
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error.message || 'Failed to start subscription');
        return;
      }
      // Redirect to Stripe checkout
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to select plan');
    },
  });

  const handleSelectPlan = async (planSlug: string) => {
    setSelectedPlanSlug(planSlug);
    await selectPlan(planSlug);
  };

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className='h-[500px] rounded-xl' />
        ))}
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <Card className='max-w-lg mx-auto'>
        <CardContent className='pt-6 text-center'>
          <p className='text-muted-foreground'>No plans available at the moment. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort plans by sortOrder
  const sortedPlans = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className='space-y-8'>
      {/* Billing Toggle */}
      <div className='flex items-center justify-center gap-4'>
        <Label htmlFor='billing-toggle' className={cn(!isYearly && 'text-primary font-medium')}>
          Monthly
        </Label>
        <Switch id='billing-toggle' checked={isYearly} onCheckedChange={setIsYearly} />
        <Label htmlFor='billing-toggle' className={cn(isYearly && 'text-primary font-medium')}>
          Yearly
          <Badge variant='secondary' className='ml-2'>
            Save 20%
          </Badge>
        </Label>
      </div>

      {/* Trial Banner */}
      <div className='bg-primary/5 border border-primary/20 rounded-lg p-4 text-center'>
        <div className='flex items-center justify-center gap-2 text-primary'>
          <Sparkles className='h-5 w-5' />
          <span className='font-medium'>All plans include a {TRIAL_DAYS}-day free trial</span>
          <Sparkles className='h-5 w-5' />
        </div>
        <p className='text-sm text-muted-foreground mt-1'>
          No charge until your trial ends. Cancel anytime.
        </p>
      </div>

      {/* Plans Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {sortedPlans.map((plan) => {
          const monthlyPrice = plan.prices.find((p) => p.interval === 'month');
          const yearlyPrice = plan.prices.find((p) => p.interval === 'year');
          const currentPrice = isYearly ? yearlyPrice : monthlyPrice;
          const isPopular = plan.isPopular;
          const isSelected = selectedPlanSlug === plan.slug;
          const isProcessing = isSelecting && isSelected;

          // Calculate monthly equivalent for yearly (amounts are in cents, divide by 100)
          const monthlyEquivalent = yearlyPrice ? Math.round(yearlyPrice.amount / 100 / 12) : null;

          // Plan icon based on tier
          const PlanIcon = plan.sortOrder === 1 ? Zap : plan.sortOrder === 2 ? Star : Crown;

          return (
            <Card
              key={plan.slug}
              className={cn(
                'relative flex flex-col transition-all',
                isPopular && 'border-primary shadow-lg scale-[1.02]',
                isSelected && 'ring-2 ring-primary'
              )}
            >
              {isPopular && (
                <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                  <Badge className='bg-primary text-primary-foreground'>
                    <Crown className='h-3 w-3 mr-1' />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className='text-center pt-8'>
                <div
                  className={cn(
                    'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl',
                    isPopular ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <PlanIcon className='h-7 w-7' />
                </div>
                <CardTitle className='text-xl'>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className='flex-1 space-y-6'>
                {/* Price */}
                <div className='text-center'>
                  <div className='flex items-baseline justify-center gap-1'>
                    <span className='text-4xl font-bold'>${currentPrice ? Math.round(currentPrice.amount / 100) : 0}</span>
                    <span className='text-muted-foreground'>/{isYearly ? 'year' : 'month'}</span>
                  </div>
                  {isYearly && monthlyEquivalent && (
                    <p className='text-sm text-muted-foreground mt-1'>
                      ${monthlyEquivalent}/month billed annually
                    </p>
                  )}
                </div>

                {/* Limits */}
                <div className='space-y-3'>
                  <div className='flex items-center gap-3 text-sm'>
                    <Car className='h-4 w-4 text-primary' />
                    <span>
                      <strong>{plan.maxListings === -1 ? 'Unlimited' : plan.maxListings}</strong> vehicle listings
                    </span>
                  </div>
                  <div className='flex items-center gap-3 text-sm'>
                    <Users className='h-4 w-4 text-primary' />
                    <span>
                      <strong>{plan.maxMembers === -1 ? 'Unlimited' : plan.maxMembers}</strong> team members
                    </span>
                  </div>
                  <div className='flex items-center gap-3 text-sm'>
                    <Image className='h-4 w-4 text-primary' />
                    <span>
                      <strong>{plan.maxImagesPerListing}</strong> images per listing
                    </span>
                  </div>
                  {plan.maxVideosPerListing > 0 && (
                    <div className='flex items-center gap-3 text-sm'>
                      <Video className='h-4 w-4 text-primary' />
                      <span>
                        <strong>{plan.maxVideosPerListing}</strong> videos per listing
                      </span>
                    </div>
                  )}
                  {plan.hasAnalytics && (
                    <div className='flex items-center gap-3 text-sm'>
                      <BarChart3 className='h-4 w-4 text-primary' />
                      <span>Advanced analytics</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <div className='pt-4 border-t space-y-2'>
                    {plan.features.map((feature, index) => (
                      <div key={index} className='flex items-start gap-2 text-sm'>
                        <Check className='h-4 w-4 text-green-500 mt-0.5' />
                        <span>{feature.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className='pt-4'>
                <Button
                  className='w-full'
                  size='lg'
                  variant={isPopular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.slug)}
                  disabled={isSelecting}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Processing...
                    </>
                  ) : (
                    <>
                      Start {TRIAL_DAYS}-Day Trial
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ / Help */}
      <div className='text-center text-sm text-muted-foreground'>
        <p>
          Need help choosing a plan?{' '}
          <a href='mailto:partners@yayago.com' className='text-primary hover:underline'>
            Contact our team
          </a>
        </p>
      </div>
    </div>
  );
}

