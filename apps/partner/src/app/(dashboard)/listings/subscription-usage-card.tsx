'use client';

import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Car, ImageIcon, Video, AlertCircle, Clock, Sparkles, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SubscriptionUsageCard() {
  const { data, isLoading, error } = useQuery(orpc.listings.getSubscriptionUsage.queryOptions());

  if (isLoading) {
    return (
      <Card>
        <CardHeader className='pb-2'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-64' />
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-2 w-full' />
                <Skeleton className='h-4 w-16' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Alert>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>No Active Subscription</AlertTitle>
        <AlertDescription className='flex items-center justify-between'>
          <span>You need an active subscription to manage listings.</span>
          <Button asChild size='sm' className='ml-4'>
            <Link href='/subscription'>View Plans</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const { plan, usage, subscription } = data;

  const listingsPercentage = usage.listings.max > 0 ? (usage.listings.current / usage.listings.max) * 100 : 0;
  const featuredPercentage =
    usage.featuredListings.max > 0 ? (usage.featuredListings.current / usage.featuredListings.max) * 100 : 0;
  const membersPercentage = usage.members.max > 0 ? (usage.members.current / usage.members.max) * 100 : 0;

  const isNearLimit = listingsPercentage >= 80;
  const isAtLimit = listingsPercentage >= 100;

  return (
    <Card className={isAtLimit ? 'border-destructive/50' : isNearLimit ? 'border-warning/50' : ''}>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <Sparkles className='size-5' />
            </div>
            <div>
              <CardTitle className='text-lg flex items-center gap-2'>
                {plan.name} Plan
                {subscription.isTrialing && (
                  <Badge variant='secondary' className='font-normal'>
                    Trial
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {subscription.isTrialing && subscription.trialEnd ? (
                  <span className='flex items-center gap-1'>
                    <Clock className='size-3' />
                    Trial ends {format(new Date(subscription.trialEnd), 'd MMM yyyy')}
                  </span>
                ) : subscription.periodEnd ? (
                  <span className='flex items-center gap-1'>
                    <Clock className='size-3' />
                    {subscription.cancelAtPeriodEnd ? 'Ends' : 'Renews'}{' '}
                    {format(new Date(subscription.periodEnd), 'd MMM yyyy')}
                  </span>
                ) : (
                  'Active subscription'
                )}
              </CardDescription>
            </div>
          </div>
          {isNearLimit && !isAtLimit && <Badge variant='warning'>Near Limit</Badge>}
          {isAtLimit && <Badge variant='destructive'>Limit Reached</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {/* Listings */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <Car className='size-4 text-primary' />
                <span className='font-medium'>Listings</span>
              </div>
              <span className='text-muted-foreground font-mono text-xs'>
                {usage.listings.current}/{usage.listings.max}
              </span>
            </div>
            <Progress
              value={listingsPercentage}
              className={`h-2 ${isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-warning' : ''}`}
            />
            <p className='text-xs text-muted-foreground'>
              {usage.listings.remaining > 0 ? `${usage.listings.remaining} remaining` : 'No slots available'}
            </p>
          </div>

          {/* Featured Listings */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <Sparkles className='size-4 text-yellow-500' />
                <span className='font-medium'>Featured</span>
              </div>
              <span className='text-muted-foreground font-mono text-xs'>
                {usage.featuredListings.current}/{usage.featuredListings.max}
              </span>
            </div>
            <Progress value={featuredPercentage} className='h-2' />
            <p className='text-xs text-muted-foreground'>{usage.featuredListings.remaining} remaining</p>
          </div>

          {/* Members */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <Users className='size-4 text-purple-500' />
                <span className='font-medium'>Members</span>
              </div>
              <span className='text-muted-foreground font-mono text-xs'>
                {usage.members.current}/{usage.members.max}
              </span>
            </div>
            <Progress value={membersPercentage} className='h-2' />
            <p className='text-xs text-muted-foreground'>{usage.members.remaining} remaining</p>
          </div>

          {/* Media Limits */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='font-medium'>Media Limits</span>
            </div>
            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
              <div className='flex items-center gap-1'>
                <ImageIcon className='size-3 text-blue-500' />
                <span>{usage.images.maxPerListing} img/listing</span>
              </div>
              <div className='flex items-center gap-1'>
                <Video className='size-3 text-purple-500' />
                <span>{usage.videos.maxPerListing} vid/listing</span>
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>
              {usage.images.current} images, {usage.videos.current} videos total
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
