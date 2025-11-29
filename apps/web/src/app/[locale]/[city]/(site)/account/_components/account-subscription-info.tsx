'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authClient } from '@/lib/auth-client';
import { Crown, Calendar, CreditCard, TrendingUp, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from '@/lib/navigation/navigation-client';

type Subscription = {
  id: string;
  plan: string;
  status: string;
  priceId?: string;
  limits?: Record<string, number>;
  periodEnd?: Date | string;
  cancelAt?: Date | string;
};

export default function AccountSubscriptionInfo() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isManagingBilling, setIsManagingBilling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadSubscription() {
      try {
        const result = await authClient.subscription.list();
        const activeSub = result.data?.find((s) => s.status === 'active' || s.status === 'trialing');
        setSubscription(activeSub || null);
      } catch (error) {
        console.error('Failed to load subscription:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSubscription();
  }, []);

  async function handleManageBilling() {
    setIsManagingBilling(true);
    try {
      const result = await authClient.subscription.billingPortal({
        returnUrl: window.location.href,
      });

      if (result.error) {
        toast.error(result.error.message || 'Failed to open billing portal');
        return;
      }

      // Billing portal redirect happens automatically
    } catch (error) {
      console.error('Billing portal error:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setIsManagingBilling(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Crown className='h-5 w-5 text-muted-foreground' />
            No Active Subscription
          </CardTitle>
          <CardDescription>Choose a plan to unlock premium features and grow your business</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push('/pricing')} className='w-full'>
            View Plans
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const planName = subscription.plan || 'Unknown';
  const formattedPlanName = planName.charAt(0).toUpperCase() + planName.slice(1);

  const currentPeriodEnd = subscription.periodEnd
    ? new Date(subscription.periodEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const statusColors: Record<string, string> = {
    active: 'bg-green-500 text-white',
    trialing: 'bg-blue-500 text-white',
    canceled: 'bg-yellow-500 text-white',
    past_due: 'bg-red-500 text-white',
    incomplete: 'bg-orange-500 text-white',
  };

  const statusColor = statusColors[subscription.status] || 'bg-gray-500 text-white';

  // Get limits display
  const listingsLimit = subscription.limits?.listings;
  const limitDisplay = listingsLimit === -1 ? 'Unlimited' : listingsLimit || 0;

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Crown className='h-5 w-5 text-primary' />
              {formattedPlanName} Plan
            </CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </div>
          <Badge className={statusColor}>
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='flex items-center gap-3 p-3 rounded-lg bg-muted/50'>
            <Calendar className='h-5 w-5 text-muted-foreground' />
            <div>
              <p className='text-sm font-medium'>Listings Limit</p>
              <p className='text-sm text-muted-foreground'>{limitDisplay} listings</p>
            </div>
          </div>

          <div className='flex items-center gap-3 p-3 rounded-lg bg-muted/50'>
            <CreditCard className='h-5 w-5 text-muted-foreground' />
            <div>
              <p className='text-sm font-medium'>Renews On</p>
              <p className='text-sm text-muted-foreground'>{currentPeriodEnd}</p>
            </div>
          </div>
        </div>

        {subscription.cancelAt && (
          <div className='p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20'>
            <p className='text-sm text-yellow-700 dark:text-yellow-400 font-medium'>
              ⚠️ Subscription will be canceled on{' '}
              {new Date(subscription.cancelAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className='flex flex-col sm:flex-row gap-2'>
        <Button variant='outline' className='w-full sm:w-auto' onClick={() => router.push('/pricing')}>
          <TrendingUp className='h-4 w-4 mr-2' />
          Upgrade Plan
        </Button>
        <Button
          variant='secondary'
          className='w-full sm:w-auto'
          onClick={handleManageBilling}
          disabled={isManagingBilling}
        >
          <Settings className='h-4 w-4 mr-2' />
          {isManagingBilling ? 'Loading...' : 'Manage Billing'}
        </Button>
      </CardFooter>
    </Card>
  );
}
