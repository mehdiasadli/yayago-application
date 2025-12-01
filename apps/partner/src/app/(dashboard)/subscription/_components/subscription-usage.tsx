'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car, Star, Users, Image, Video, AlertTriangle, TrendingUp } from 'lucide-react';
import type { GetSubscriptionUsageOutputType } from '@yayago-app/validators';

interface Props {
  usage: GetSubscriptionUsageOutputType;
}

interface UsageCardProps {
  title: string;
  description: string;
  current: number;
  max: number;
  Icon: React.ComponentType<{ className?: string }>;
  unit?: string;
}

function UsageCard({ title, description, current, max, Icon, unit = '' }: UsageCardProps) {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <Card className={isAtLimit ? 'border-destructive/50' : isNearLimit ? 'border-amber-500/50' : ''}>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div
              className={`p-2 rounded-lg ${
                isAtLimit
                  ? 'bg-destructive/10 text-destructive'
                  : isNearLimit
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-primary/10 text-primary'
              }`}
            >
              <Icon className='size-4' />
            </div>
            <div>
              <CardTitle className='text-base'>{title}</CardTitle>
              <CardDescription className='text-xs'>{description}</CardDescription>
            </div>
          </div>
          {isAtLimit && (
            <Badge variant='destructive' className='text-xs'>
              Limit Reached
            </Badge>
          )}
          {isNearLimit && !isAtLimit && (
            <Badge variant='warning' className='text-xs'>
              Near Limit
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex items-baseline justify-between'>
          <span className='text-3xl font-bold'>{current}</span>
          <span className='text-muted-foreground'>
            of {max} {unit}
          </span>
        </div>
        <Progress
          value={Math.min(percentage, 100)}
          className={isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-amber-500' : ''}
        />
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <span>{percentage}% used</span>
          <span>{max - current} remaining</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function SubscriptionUsage({ usage }: Props) {
  const { listings, featuredListings, members, images, videos } = usage.usage;
  const hasAnalytics = usage.plan.hasAnalytics;

  // Calculate total max for images and videos based on maxPerListing * max listings
  const imagesMax = images.maxPerListing * listings.max;
  const videosMax = videos.maxPerListing * listings.max;

  // Check if any limit is near or at limit
  const hasWarnings =
    (listings.max > 0 && listings.current / listings.max >= 0.8) ||
    (featuredListings.max > 0 && featuredListings.current / featuredListings.max >= 0.8) ||
    (members.max > 0 && members.current / members.max >= 0.8);

  return (
    <div className='space-y-6'>
      {/* Warning Alert */}
      {hasWarnings && (
        <Alert variant='destructive'>
          <AlertTriangle className='size-4' />
          <AlertDescription>
            You're approaching one or more usage limits. Consider upgrading your plan to avoid interruptions.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Usage Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <UsageCard
          title='Listings'
          description='Active car listings'
          current={listings.current}
          max={listings.max}
          Icon={Car}
        />
        <UsageCard
          title='Featured Listings'
          description='Highlighted in search'
          current={featuredListings.current}
          max={featuredListings.max}
          Icon={Star}
        />
        <UsageCard
          title='Team Members'
          description='Users with access'
          current={members.current}
          max={members.max}
          Icon={Users}
        />
      </div>

      {/* Media Usage */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Media Storage</CardTitle>
          <CardDescription>Total media files across all listings</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Images */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Image className='size-4 text-muted-foreground' />
                <span className='font-medium'>Images</span>
              </div>
              <div className='flex items-baseline gap-2'>
                <span className='text-2xl font-bold'>{images.current}</span>
                <span className='text-muted-foreground'>/ {imagesMax} total</span>
              </div>
              <Progress
                value={imagesMax > 0 ? (images.current / imagesMax) * 100 : 0}
                className={imagesMax > 0 && images.current / imagesMax >= 0.8 ? '[&>div]:bg-amber-500' : ''}
              />
              <p className='text-xs text-muted-foreground'>{images.maxPerListing} images per listing allowed</p>
            </div>

            {/* Videos */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Video className='size-4 text-muted-foreground' />
                <span className='font-medium'>Videos</span>
              </div>
              <div className='flex items-baseline gap-2'>
                <span className='text-2xl font-bold'>{videos.current}</span>
                <span className='text-muted-foreground'>/ {videosMax} total</span>
              </div>
              <Progress
                value={videosMax > 0 ? (videos.current / videosMax) * 100 : 0}
                className={videosMax > 0 && videos.current / videosMax >= 0.8 ? '[&>div]:bg-amber-500' : ''}
              />
              <p className='text-xs text-muted-foreground'>{videos.maxPerListing} videos per listing allowed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Feature */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <TrendingUp className='size-5' />
            Analytics
          </CardTitle>
          <CardDescription>Track your performance and insights</CardDescription>
        </CardHeader>
        <CardContent>
          {hasAnalytics ? (
            <div className='flex items-center gap-3 text-green-600 dark:text-green-400'>
              <Badge variant='success'>Included</Badge>
              <span className='text-sm'>Full access to performance analytics and reporting</span>
            </div>
          ) : (
            <div className='space-y-3'>
              <div className='flex items-center gap-3 text-muted-foreground'>
                <Badge variant='secondary'>Not Included</Badge>
                <span className='text-sm'>Upgrade to a higher plan for analytics access</span>
              </div>
              <p className='text-xs text-muted-foreground'>
                Analytics include: views, bookings, revenue trends, customer insights, and more.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card className='bg-muted/50'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-3'>
            <div className='p-2 rounded-full bg-primary/10 text-primary'>
              <AlertTriangle className='size-4' />
            </div>
            <div>
              <h4 className='font-medium'>Usage Tips</h4>
              <ul className='mt-2 text-sm text-muted-foreground space-y-1'>
                <li>• Archive inactive listings to free up slots</li>
                <li>• Optimize images before uploading to save storage</li>
                <li>• Remove unused team members to stay within limits</li>
                <li>• Featured listings appear higher in search results</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
