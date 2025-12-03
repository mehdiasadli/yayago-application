'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, PenLine, ChevronLeft, ChevronRight, Loader2, User } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';

interface ListingReviewsProps {
  listingSlug: string;
  listingTitle: string;
}

export default function ListingReviews({ listingSlug, listingTitle }: ListingReviewsProps) {
  const [page, setPage] = useState(1);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  // Get review summary
  const { data: summary, isLoading: summaryLoading } = useQuery(
    orpc.reviews.getListingSummary.queryOptions({
      input: { listingSlug },
    })
  );

  // Get reviews list
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery(
    orpc.reviews.listForListing.queryOptions({
      input: { listingSlug, page, take: 5, sortBy: 'newest' },
    })
  );

  // Check if user can review (has completed booking without review)
  const { data: pendingReviews } = useQuery({
    ...orpc.reviews.getPendingReviews.queryOptions({ input: {} }),
    enabled: !!session?.user,
  });

  // Find if there's a pending review for this listing
  const canWriteReview = pendingReviews?.pendingReviews.some(
    (p) => p.listing.slug === listingSlug
  );
  const pendingBooking = pendingReviews?.pendingReviews.find(
    (p) => p.listing.slug === listingSlug
  );

  const handleReviewSuccess = () => {
    setWriteReviewOpen(false);
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
  };

  if (summaryLoading) {
    return <ReviewsSectionSkeleton />;
  }

  const hasReviews = summary && summary.totalReviews > 0;

  return (
    <Card id='reviews'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <MessageSquare className='size-5' />
            Reviews
            {hasReviews && (
              <span className='text-muted-foreground font-normal'>
                ({summary.totalReviews})
              </span>
            )}
          </CardTitle>
          {canWriteReview && (
            <Button size='sm' onClick={() => setWriteReviewOpen(true)}>
              <PenLine className='size-4 mr-2' />
              Write a Review
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {hasReviews ? (
          <>
            {/* Rating Overview */}
            <RatingOverview
              averageRating={summary.averageRating!}
              totalReviews={summary.totalReviews}
              distribution={summary.ratingDistribution}
            />

            {/* Reviews List */}
            {reviewsLoading ? (
              <ReviewsListSkeleton />
            ) : reviewsData && reviewsData.items.length > 0 ? (
              <div className='space-y-4 pt-4 border-t'>
                {reviewsData.items.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))}

                {/* Pagination */}
                {reviewsData.pagination.totalPages > 1 && (
                  <div className='flex items-center justify-center gap-2 pt-4'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className='size-4 mr-1' />
                      Previous
                    </Button>
                    <span className='text-sm text-muted-foreground px-4'>
                      Page {page} of {reviewsData.pagination.totalPages}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={page === reviewsData.pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                      <ChevronRight className='size-4 ml-1' />
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </>
        ) : (
          <div className='text-center py-8'>
            <MessageSquare className='size-12 mx-auto text-muted-foreground/30 mb-4' />
            <h3 className='font-medium mb-1'>No reviews yet</h3>
            <p className='text-sm text-muted-foreground'>
              Be the first to share your experience with this vehicle
            </p>
          </div>
        )}
      </CardContent>

      {/* Write Review Dialog */}
      {pendingBooking && (
        <WriteReviewDialog
          open={writeReviewOpen}
          onOpenChange={setWriteReviewOpen}
          bookingId={pendingBooking.booking.id}
          listingTitle={listingTitle}
          vehicle={pendingBooking.vehicle}
          onSuccess={handleReviewSuccess}
        />
      )}
    </Card>
  );
}

interface RatingOverviewProps {
  averageRating: number;
  totalReviews: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

function RatingOverview({ averageRating, totalReviews, distribution }: RatingOverviewProps) {
  const maxCount = Math.max(...Object.values(distribution));

  return (
    <div className='flex flex-col md:flex-row gap-6'>
      {/* Average Rating */}
      <div className='flex flex-col items-center justify-center p-6 bg-muted/50 rounded-xl min-w-[160px]'>
        <div className='text-5xl font-bold'>{averageRating.toFixed(1)}</div>
        <div className='flex items-center gap-1 mt-2'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'size-5',
                i < Math.round(averageRating)
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-muted-foreground'
              )}
            />
          ))}
        </div>
        <p className='text-sm text-muted-foreground mt-2'>
          {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Distribution Bars */}
      <div className='flex-1 space-y-2'>
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = distribution[stars as keyof typeof distribution];
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={stars} className='flex items-center gap-3'>
              <div className='flex items-center gap-1 w-12'>
                <span className='text-sm font-medium'>{stars}</span>
                <Star className='size-3.5 text-amber-500 fill-amber-500' />
              </div>
              <div className='flex-1'>
                <Progress value={percentage} className='h-2.5' />
              </div>
              <div className='w-12 text-right'>
                <span className='text-sm text-muted-foreground'>{count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ReviewItemProps {
  review: {
    id: string;
    createdAt: Date;
    rating: number;
    comment: string | null;
    user: {
      id: string;
      name: string;
      image: string | null;
    };
    booking: {
      id: string;
      referenceCode: string;
      startDate: Date;
      endDate: Date;
    };
  };
}

function ReviewItem({ review }: ReviewItemProps) {
  // Calculate rental duration
  const startDate = new Date(review.booking.startDate);
  const endDate = new Date(review.booking.endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className='flex gap-4'>
      <Avatar className='size-10 shrink-0'>
        <AvatarImage src={review.user.image || undefined} />
        <AvatarFallback>
          <User className='size-5 text-muted-foreground' />
        </AvatarFallback>
      </Avatar>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='font-medium'>{review.user.name}</span>
          <span className='text-muted-foreground'>·</span>
          <div className='flex items-center'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'size-3.5',
                  i < review.rating
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-muted-foreground'
                )}
              />
            ))}
          </div>
        </div>

        <p className='text-xs text-muted-foreground mt-0.5'>
          Rented for {days} {days === 1 ? 'day' : 'days'} · {format(startDate, 'MMMM yyyy')}
        </p>

        {review.comment && (
          <p className='mt-2 text-sm text-muted-foreground'>{review.comment}</p>
        )}

        <p className='text-xs text-muted-foreground mt-2'>
          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

interface WriteReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  listingTitle: string;
  vehicle: { make: string; model: string; year: number };
  onSuccess: () => void;
}

function WriteReviewDialog({
  open,
  onOpenChange,
  bookingId,
  listingTitle,
  vehicle,
  onSuccess,
}: WriteReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const createReview = useMutation(
    orpc.reviews.create.mutationOptions({
      onSuccess: () => {
        toast.success('Review submitted successfully!');
        onSuccess();
        setRating(0);
        setComment('');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to submit review');
      },
    })
  );

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    createReview.mutate({
      bookingId,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  const vehicleName = `${vehicle.make} ${vehicle.model} ${vehicle.year}`;
  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with {vehicleName}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Rating */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Rating</label>
            <div className='flex items-center gap-1'>
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type='button'
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className='p-1 transition-transform hover:scale-110'
                >
                  <Star
                    className={cn(
                      'size-8 transition-colors',
                      i < displayRating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
              {displayRating > 0 && (
                <span className='ml-2 text-sm text-muted-foreground'>
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][displayRating]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Comment (optional)</label>
            <Textarea
              placeholder='Share details about your experience...'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={2000}
            />
            <p className='text-xs text-muted-foreground text-right'>
              {comment.length}/2000
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createReview.isPending || rating === 0}>
            {createReview.isPending && <Loader2 className='size-4 mr-2 animate-spin' />}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewsSectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-32' />
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='flex flex-col md:flex-row gap-6'>
          <Skeleton className='w-40 h-32 rounded-xl' />
          <div className='flex-1 space-y-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-3'>
                <Skeleton className='w-12 h-4' />
                <Skeleton className='flex-1 h-2.5' />
                <Skeleton className='w-8 h-4' />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewsListSkeleton() {
  return (
    <div className='space-y-4 pt-4 border-t'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className='flex gap-4'>
          <Skeleton className='size-10 rounded-full' />
          <div className='flex-1'>
            <Skeleton className='h-5 w-32 mb-1' />
            <Skeleton className='h-3 w-24 mb-2' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4 mt-1' />
          </div>
        </div>
      ))}
    </div>
  );
}

