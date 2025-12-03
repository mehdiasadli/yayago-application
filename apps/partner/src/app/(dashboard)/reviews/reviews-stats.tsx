'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, TrendingDown, MessageSquare, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReviewsStats() {
  const { data: stats, isLoading } = useQuery(
    orpc.reviews.getPartnerStats.queryOptions({
      input: {},
    })
  );

  if (isLoading) {
    return <ReviewsStatsSkeleton />;
  }

  if (!stats) {
    return null;
  }

  const hasReviews = stats.totalReviews > 0;

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {/* Total Reviews */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Total Reviews</CardTitle>
          <MessageSquare className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalReviews}</div>
          {stats.reviewsThisMonth > 0 && (
            <p className='text-xs text-muted-foreground mt-1'>
              +{stats.reviewsThisMonth} this month
            </p>
          )}
        </CardContent>
      </Card>

      {/* Average Rating */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Average Rating</CardTitle>
          <Star className='size-4 text-amber-500 fill-amber-500' />
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-2'>
            <span className='text-2xl font-bold'>
              {hasReviews ? stats.averageRating?.toFixed(1) : '—'}
            </span>
            {hasReviews && (
              <div className='flex'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'size-4',
                      i < Math.round(stats.averageRating || 0)
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
          {stats.averageRatingThisMonth && (
            <p className='text-xs text-muted-foreground mt-1'>
              {stats.averageRatingThisMonth.toFixed(1)} this month
            </p>
          )}
        </CardContent>
      </Card>

      {/* Rating Distribution (Mini) */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className='space-y-1'>
          {hasReviews ? (
            [5, 4, 3, 2, 1].map((stars) => {
              const count = stats.ratingDistribution[stars as keyof typeof stats.ratingDistribution];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={stars} className='flex items-center gap-2'>
                  <span className='text-xs w-3'>{stars}</span>
                  <Progress value={percentage} className='h-1.5 flex-1' />
                  <span className='text-xs text-muted-foreground w-6 text-right'>{count}</span>
                </div>
              );
            })
          ) : (
            <p className='text-sm text-muted-foreground'>No ratings yet</p>
          )}
        </CardContent>
      </Card>

      {/* Low Ratings Alert */}
      <Card className={cn(stats.recentLowRatings.length > 0 && 'border-amber-500/50 bg-amber-500/5')}>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Needs Attention</CardTitle>
          <AlertTriangle className={cn('size-4', stats.recentLowRatings.length > 0 ? 'text-amber-500' : 'text-muted-foreground')} />
        </CardHeader>
        <CardContent>
          {stats.recentLowRatings.length > 0 ? (
            <div>
              <div className='text-2xl font-bold text-amber-600'>{stats.recentLowRatings.length}</div>
              <p className='text-xs text-muted-foreground mt-1'>
                Recent low ratings (1-2 stars)
              </p>
            </div>
          ) : (
            <div>
              <div className='text-2xl font-bold text-green-600'>0</div>
              <p className='text-xs text-muted-foreground mt-1'>
                No low ratings recently
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewsStatsSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className='pb-2'>
            <Skeleton className='h-4 w-24' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-8 w-16 mb-1' />
            <Skeleton className='h-3 w-20' />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

