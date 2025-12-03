'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageSquare, Calendar, TrendingUp } from 'lucide-react';

export default function ReviewsStats() {
  // Get total reviews count using the main query without filters
  const { data, isLoading } = useQuery(
    orpc.reviews.listAll.queryOptions({
      input: {
        page: 1,
        take: 1,
        sortBy: 'newest',
      },
    })
  );

  // Get recent reviews (this month)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyData, isLoading: isMonthlyLoading } = useQuery(
    orpc.reviews.listAll.queryOptions({
      input: {
        page: 1,
        take: 1,
        dateFrom: startOfMonth,
        sortBy: 'newest',
      },
    })
  );

  // Get low ratings count (1-2 stars)
  const { data: lowRatings1 } = useQuery(
    orpc.reviews.listAll.queryOptions({
      input: { page: 1, take: 1, rating: 1, sortBy: 'newest' },
    })
  );

  const { data: lowRatings2 } = useQuery(
    orpc.reviews.listAll.queryOptions({
      input: { page: 1, take: 1, rating: 2, sortBy: 'newest' },
    })
  );

  const { data: highRatings } = useQuery(
    orpc.reviews.listAll.queryOptions({
      input: { page: 1, take: 1, rating: 5, sortBy: 'newest' },
    })
  );

  if (isLoading || isMonthlyLoading) {
    return <ReviewsStatsSkeleton />;
  }

  const totalReviews = data?.pagination.total || 0;
  const monthlyReviews = monthlyData?.pagination.total || 0;
  const lowRatingsCount = (lowRatings1?.pagination.total || 0) + (lowRatings2?.pagination.total || 0);
  const fiveStarCount = highRatings?.pagination.total || 0;

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {/* Total Reviews */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Total Reviews</CardTitle>
          <MessageSquare className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalReviews.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground mt-1'>All time reviews</p>
        </CardContent>
      </Card>

      {/* This Month */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>This Month</CardTitle>
          <Calendar className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{monthlyReviews.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground mt-1'>New reviews</p>
        </CardContent>
      </Card>

      {/* 5-Star Reviews */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>5-Star Reviews</CardTitle>
          <Star className='size-4 text-amber-500 fill-amber-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-green-600'>{fiveStarCount.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground mt-1'>
            {totalReviews > 0 ? `${((fiveStarCount / totalReviews) * 100).toFixed(1)}% of total` : 'No reviews'}
          </p>
        </CardContent>
      </Card>

      {/* Low Ratings */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-muted-foreground'>Low Ratings</CardTitle>
          <TrendingUp className='size-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-amber-600'>{lowRatingsCount.toLocaleString()}</div>
          <p className='text-xs text-muted-foreground mt-1'>1-2 star reviews</p>
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

