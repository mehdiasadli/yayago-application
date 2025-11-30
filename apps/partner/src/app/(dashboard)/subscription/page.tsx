'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CreditCard, BarChart3, Settings, Sparkles } from 'lucide-react';
import { SubscriptionOverview } from './_components/subscription-overview';
import { SubscriptionUsage } from './_components/subscription-usage';
import { SubscriptionPlans } from './_components/subscription-plans';
import { BillingSection } from './_components/billing-section';
import { SubscriptionActions } from './_components/subscription-actions';

export default function SubscriptionPage() {
  const {
    data: usage,
    isLoading,
    error,
  } = useQuery(orpc.listings.getSubscriptionUsage.queryOptions());

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div>
          <Skeleton className='h-8 w-48 mb-2' />
          <Skeleton className='h-4 w-96' />
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <Skeleton className='h-64 lg:col-span-2' />
          <Skeleton className='h-64' />
        </div>
        <Skeleton className='h-96' />
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold'>Subscription</h1>
          <p className='text-muted-foreground'>Manage your subscription and billing</p>
        </div>
        <Alert variant='destructive'>
          <AlertCircle className='size-4' />
          <AlertDescription>{error?.message || 'Failed to load subscription data'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold'>Subscription</h1>
        <p className='text-muted-foreground'>Manage your subscription, usage limits, and billing</p>
      </div>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <SubscriptionOverview usage={usage} />
        </div>
        <div>
          <SubscriptionActions usage={usage} organizationId={usage.organizationId} />
        </div>
      </div>

      {/* Tabs for detailed sections */}
      <Tabs defaultValue='usage' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4 lg:w-auto lg:inline-flex'>
          <TabsTrigger value='usage' className='gap-2'>
            <BarChart3 className='size-4' />
            <span className='hidden sm:inline'>Usage</span>
          </TabsTrigger>
          <TabsTrigger value='plans' className='gap-2'>
            <Sparkles className='size-4' />
            <span className='hidden sm:inline'>Plans</span>
          </TabsTrigger>
          <TabsTrigger value='billing' className='gap-2'>
            <CreditCard className='size-4' />
            <span className='hidden sm:inline'>Billing</span>
          </TabsTrigger>
          <TabsTrigger value='settings' className='gap-2'>
            <Settings className='size-4' />
            <span className='hidden sm:inline'>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='usage' className='space-y-4'>
          <SubscriptionUsage usage={usage} />
        </TabsContent>

        <TabsContent value='plans' className='space-y-4'>
          <SubscriptionPlans currentPlan={usage.plan} />
        </TabsContent>

        <TabsContent value='billing' className='space-y-4'>
          <BillingSection organizationId={usage.organizationId} />
        </TabsContent>

        <TabsContent value='settings' className='space-y-4'>
          <SubscriptionActions usage={usage} organizationId={usage.organizationId} expanded />
        </TabsContent>
      </Tabs>
    </div>
  );
}

