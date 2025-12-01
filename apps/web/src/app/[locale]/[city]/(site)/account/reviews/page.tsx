'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@/lib/navigation/navigation-client';
import {
  Star,
  Car,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  PenLine,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function ReviewsPage() {
  const [page, setPage] = useState(1);

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery(
    orpc.users.listMyReviews.queryOptions({
      input: { page, limit: 10 },
    })
  );

  const { data: pendingReviews, isLoading: pendingLoading } = useQuery(
    orpc.users.listPendingReviews.queryOptions()
  );

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>My Reviews</h2>
        <p className='text-muted-foreground'>View and manage your reviews</p>
      </div>

      <Tabs defaultValue='written' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='written' className='gap-2'>
            <MessageSquare className='size-4' />
            Written Reviews
            {reviewsData?.pagination.total ? (
              <Badge variant='secondary' className='ml-1'>
                {reviewsData.pagination.total}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value='pending' className='gap-2'>
            <PenLine className='size-4' />
            Pending
            {pendingReviews?.length ? (
              <Badge variant='secondary' className='ml-1'>
                {pendingReviews.length}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='written'>
          {reviewsLoading ? (
            <ReviewsSkeleton />
          ) : reviewsData && reviewsData.items.length > 0 ? (
            <>
              <div className='space-y-4'>
                {reviewsData.items.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {/* Pagination */}
              {reviewsData.pagination.totalPages > 1 && (
                <div className='flex items-center justify-center gap-2 mt-6'>
                  <Button
                    variant='outline'
                    size='icon'
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className='size-4' />
                  </Button>
                  <span className='text-sm text-muted-foreground'>
                    Page {page} of {reviewsData.pagination.totalPages}
                  </span>
                  <Button
                    variant='outline'
                    size='icon'
                    disabled={page === reviewsData.pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className='size-4' />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className='py-12'>
              <CardContent className='text-center'>
                <MessageSquare className='size-12 mx-auto text-muted-foreground/50 mb-4' />
                <h3 className='text-lg font-medium mb-2'>No reviews yet</h3>
                <p className='text-muted-foreground'>
                  After completing a rental, you'll be able to leave a review here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='pending'>
          {pendingLoading ? (
            <PendingReviewsSkeleton />
          ) : pendingReviews && pendingReviews.length > 0 ? (
            <div className='space-y-4'>
              {pendingReviews.map((pending) => (
                <PendingReviewCard key={pending.bookingId} pending={pending} />
              ))}
            </div>
          ) : (
            <Card className='py-12'>
              <CardContent className='text-center'>
                <Clock className='size-12 mx-auto text-muted-foreground/50 mb-4' />
                <h3 className='text-lg font-medium mb-2'>All caught up!</h3>
                <p className='text-muted-foreground'>
                  No pending reviews. Complete a rental to leave a review.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    listing: {
      id: string;
      slug: string;
      title: string;
      primaryImage: string | null;
    };
  };
}

function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex gap-4'>
          {/* Car Image */}
          <Link href={`/rent/cars/${review.listing.slug}`} className='shrink-0'>
            <div className='w-24 h-16 rounded-lg overflow-hidden bg-muted'>
              {review.listing.primaryImage ? (
                <img
                  src={review.listing.primaryImage}
                  alt={review.listing.title}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center'>
                  <Car className='size-6 text-muted-foreground' />
                </div>
              )}
            </div>
          </Link>

          {/* Review Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-2'>
              <div>
                <Link href={`/rent/cars/${review.listing.slug}`}>
                  <h3 className='font-medium hover:text-primary transition-colors'>
                    {review.listing.title}
                  </h3>
                </Link>
                <div className='flex items-center gap-2 mt-1'>
                  <div className='flex'>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${
                          i < review.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className='text-sm text-muted-foreground'>
                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {review.comment && (
              <p className='mt-2 text-sm text-muted-foreground line-clamp-2'>{review.comment}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PendingReviewCardProps {
  pending: {
    bookingId: string;
    completedAt: Date;
    listing: {
      id: string;
      slug: string;
      title: string;
      primaryImage: string | null;
    };
  };
}

function PendingReviewCard({ pending }: PendingReviewCardProps) {
  return (
    <Card className='border-amber-500/50 bg-amber-500/5'>
      <CardContent className='p-4'>
        <div className='flex gap-4'>
          {/* Car Image */}
          <Link href={`/rent/cars/${pending.listing.slug}`} className='shrink-0'>
            <div className='w-24 h-16 rounded-lg overflow-hidden bg-muted'>
              {pending.listing.primaryImage ? (
                <img
                  src={pending.listing.primaryImage}
                  alt={pending.listing.title}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center'>
                  <Car className='size-6 text-muted-foreground' />
                </div>
              )}
            </div>
          </Link>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <Link href={`/rent/cars/${pending.listing.slug}`}>
                  <h3 className='font-medium hover:text-primary transition-colors'>
                    {pending.listing.title}
                  </h3>
                </Link>
                <p className='text-sm text-muted-foreground mt-1'>
                  Completed{' '}
                  {formatDistanceToNow(new Date(pending.completedAt), { addSuffix: true })}
                </p>
              </div>
              <Button asChild size='sm'>
                <Link href={`/rent/cars/${pending.listing.slug}#reviews`}>
                  <PenLine className='size-4 mr-2' />
                  Write Review
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewsSkeleton() {
  return (
    <div className='space-y-4'>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className='p-4'>
            <div className='flex gap-4'>
              <Skeleton className='w-24 h-16 rounded-lg' />
              <div className='flex-1'>
                <Skeleton className='h-5 w-48 mb-2' />
                <Skeleton className='h-4 w-32 mb-2' />
                <Skeleton className='h-4 w-full' />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PendingReviewsSkeleton() {
  return (
    <div className='space-y-4'>
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardContent className='p-4'>
            <div className='flex gap-4'>
              <Skeleton className='w-24 h-16 rounded-lg' />
              <div className='flex-1 flex items-start justify-between'>
                <div>
                  <Skeleton className='h-5 w-48 mb-2' />
                  <Skeleton className='h-4 w-32' />
                </div>
                <Skeleton className='h-9 w-28' />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
