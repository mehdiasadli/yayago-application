'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Crown,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Timer,
  RefreshCw,
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid';

interface UsageData {
  plan: {
    name: string;
    slug: string;
  };
  subscription: {
    status: SubscriptionStatus;
    periodStart: string | null;
    periodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    trialStart: string | null;
    trialEnd: string | null;
  } | null;
  usage: {
    listings: { current: number; max: number };
    featuredListings: { current: number; max: number };
    members: { current: number; max: number };
    images: { current: number; max: number };
    videos: { current: number; max: number };
  };
}

interface Props {
  usage: UsageData;
}

const statusConfig: Record<
  SubscriptionStatus,
  { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'; Icon: React.ComponentType<{ className?: string }> }
> = {
  active: { label: 'Active', variant: 'success', Icon: CheckCircle },
  trialing: { label: 'Trial', variant: 'warning', Icon: Timer },
  canceled: { label: 'Canceled', variant: 'destructive', Icon: XCircle },
  incomplete: { label: 'Incomplete', variant: 'warning', Icon: AlertTriangle },
  incomplete_expired: { label: 'Expired', variant: 'destructive', Icon: XCircle },
  past_due: { label: 'Past Due', variant: 'destructive', Icon: AlertTriangle },
  paused: { label: 'Paused', variant: 'secondary', Icon: Pause },
  unpaid: { label: 'Unpaid', variant: 'destructive', Icon: AlertTriangle },
};

export function SubscriptionOverview({ usage }: Props) {
  const { plan, subscription } = usage;
  const status = subscription?.status || 'active';
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.Icon;

  const periodEnd = subscription?.periodEnd ? new Date(subscription.periodEnd) : null;
  const trialEnd = subscription?.trialEnd ? new Date(subscription.trialEnd) : null;
  const isTrialing = status === 'trialing' && trialEnd;
  const daysRemaining = periodEnd ? differenceInDays(periodEnd, new Date()) : null;
  const trialDaysRemaining = trialEnd ? differenceInDays(trialEnd, new Date()) : null;

  // Calculate overall usage percentage
  const totalUsed =
    usage.usage.listings.current +
    usage.usage.featuredListings.current +
    usage.usage.members.current;
  const totalMax =
    usage.usage.listings.max + usage.usage.featuredListings.max + usage.usage.members.max;
  const overallUsagePercent = totalMax > 0 ? Math.round((totalUsed / totalMax) * 100) : 0;

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <CardTitle className='flex items-center gap-2'>
              <Crown className='size-5 text-amber-500' />
              {plan.name}
            </CardTitle>
            <CardDescription>Your current subscription plan</CardDescription>
          </div>
          <Badge variant={statusInfo.variant as 'default'} className='gap-1'>
            <StatusIcon className='size-3' />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Trial Banner */}
        {isTrialing && trialDaysRemaining !== null && (
          <div className='rounded-lg bg-amber-500/10 border border-amber-500/20 p-4'>
            <div className='flex items-center gap-3'>
              <Timer className='size-5 text-amber-500' />
              <div className='flex-1'>
                <p className='font-medium text-amber-600 dark:text-amber-400'>Free Trial Active</p>
                <p className='text-sm text-muted-foreground'>
                  {trialDaysRemaining > 0 ? (
                    <>
                      {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining until{' '}
                      {format(trialEnd, 'MMM d, yyyy')}
                    </>
                  ) : (
                    <>Trial ends today!</>
                  )}
                </p>
              </div>
              <Progress value={Math.max(0, 100 - (trialDaysRemaining / 14) * 100)} className='w-24' />
            </div>
          </div>
        )}

        {/* Cancel at Period End Warning */}
        {subscription?.cancelAtPeriodEnd && (
          <div className='rounded-lg bg-destructive/10 border border-destructive/20 p-4'>
            <div className='flex items-center gap-3'>
              <AlertTriangle className='size-5 text-destructive' />
              <div className='flex-1'>
                <p className='font-medium text-destructive'>Subscription Ending</p>
                <p className='text-sm text-muted-foreground'>
                  Your subscription will end on {periodEnd ? format(periodEnd, 'MMM d, yyyy') : 'the next billing date'}.
                  You can restore it before then.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Billing Period */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1'>
            <p className='text-sm text-muted-foreground flex items-center gap-1.5'>
              <Calendar className='size-3.5' />
              Current Period
            </p>
            <p className='font-medium'>
              {subscription?.periodStart
                ? format(new Date(subscription.periodStart), 'MMM d')
                : 'N/A'}{' '}
              -{' '}
              {subscription?.periodEnd
                ? format(new Date(subscription.periodEnd), 'MMM d, yyyy')
                : 'N/A'}
            </p>
          </div>
          <div className='space-y-1'>
            <p className='text-sm text-muted-foreground flex items-center gap-1.5'>
              <Clock className='size-3.5' />
              Next Billing
            </p>
            <p className='font-medium'>
              {periodEnd ? (
                <>
                  {formatDistanceToNow(periodEnd, { addSuffix: true })}
                  {daysRemaining !== null && daysRemaining <= 7 && (
                    <span className='text-amber-500 ml-2'>({daysRemaining} days)</span>
                  )}
                </>
              ) : (
                'N/A'
              )}
            </p>
          </div>
        </div>

        {/* Overall Usage */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Overall Usage</span>
            <span className='font-medium'>{overallUsagePercent}%</span>
          </div>
          <Progress
            value={overallUsagePercent}
            className={overallUsagePercent >= 90 ? '[&>div]:bg-destructive' : overallUsagePercent >= 75 ? '[&>div]:bg-amber-500' : ''}
          />
          <p className='text-xs text-muted-foreground'>
            {totalUsed} of {totalMax} total resources used
          </p>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-3 gap-4 pt-2 border-t'>
          <div className='text-center'>
            <p className='text-2xl font-bold'>{usage.usage.listings.current}</p>
            <p className='text-xs text-muted-foreground'>Listings</p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold'>{usage.usage.members.current}</p>
            <p className='text-xs text-muted-foreground'>Members</p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold'>{usage.usage.images.current}</p>
            <p className='text-xs text-muted-foreground'>Images</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

