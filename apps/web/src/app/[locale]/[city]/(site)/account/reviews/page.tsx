'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@/lib/navigation/navigation-client';
import { Star, Car, Clock, ChevronLeft, ChevronRight, MessageSquare, PenLine, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    id: string;
    listing: { slug: string; title: string; primaryImage: string | null };
    vehicle: { make: string; model: string; year: number };
  } | null>(null);

  const queryClient = useQueryClient();

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery(
    orpc.reviews.listMyReviews.queryOptions({
      input: { page, take: 10 },
    })
  );

  const { data: pendingData, isLoading: pendingLoading } = useQuery(
    orpc.reviews.getPendingReviews.queryOptions({
      input: {},
    })
  );

  const pendingReviews = pendingData?.pendingReviews || [];

  const handleWriteReview = (booking: (typeof pendingReviews)[0]) => {
    setSelectedBooking({
      id: booking.booking.id,
      listing: booking.listing,
      vehicle: booking.vehicle,
    });
    setWriteReviewOpen(true);
  };

  const handleReviewSuccess = () => {
    setWriteReviewOpen(false);
    setSelectedBooking(null);
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
  };

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
            {pendingReviews.length > 0 && (
              <Badge variant='secondary' className='ml-1'>
                {pendingReviews.length}
              </Badge>
            )}
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
                  <Button variant='outline' size='icon' disabled={page === 1} onClick={() => setPage(page - 1)}>
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
          ) : pendingReviews.length > 0 ? (
            <div className='space-y-4'>
              {pendingReviews.map((pending) => (
                <PendingReviewCard
                  key={pending.booking.id}
                  pending={pending}
                  onWriteReview={() => handleWriteReview(pending)}
                />
              ))}
            </div>
          ) : (
            <Card className='py-12'>
              <CardContent className='text-center'>
                <Clock className='size-12 mx-auto text-muted-foreground/50 mb-4' />
                <h3 className='text-lg font-medium mb-2'>All caught up!</h3>
                <p className='text-muted-foreground'>No pending reviews. Complete a rental to leave a review.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Write Review Dialog */}
      {selectedBooking && (
        <WriteReviewDialog
          open={writeReviewOpen}
          onOpenChange={setWriteReviewOpen}
          bookingId={selectedBooking.id}
          listing={selectedBooking.listing}
          vehicle={selectedBooking.vehicle}
          onSuccess={handleReviewSuccess}
        />
      )}
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
      vehicle: {
        year: number;
        model: { name: string; brand: { name: string } };
      } | null;
    };
    booking: {
      id: string;
      referenceCode: string;
      startDate: Date;
      endDate: Date;
    };
  };
}

function ReviewCard({ review }: ReviewCardProps) {
  const vehicleName = review.listing.vehicle
    ? `${review.listing.vehicle.model.brand.name} ${review.listing.vehicle.model.name} ${review.listing.vehicle.year}`
    : review.listing.title;

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
                  <h3 className='font-medium hover:text-primary transition-colors'>{vehicleName}</h3>
                </Link>
                <div className='flex items-center gap-2 mt-1'>
                  <div className='flex'>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${
                          i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'
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

            {review.comment && <p className='mt-2 text-sm text-muted-foreground line-clamp-2'>{review.comment}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PendingReviewCardProps {
  pending: {
    booking: {
      id: string;
      referenceCode: string;
      startDate: Date;
      endDate: Date;
    };
    listing: {
      id: string;
      slug: string;
      title: string;
      primaryImage: string | null;
    };
    vehicle: {
      make: string;
      model: string;
      year: number;
    };
  };
  onWriteReview: () => void;
}

function PendingReviewCard({ pending, onWriteReview }: PendingReviewCardProps) {
  const vehicleName = `${pending.vehicle.make} ${pending.vehicle.model} ${pending.vehicle.year}`;

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
                  <h3 className='font-medium hover:text-primary transition-colors'>{vehicleName}</h3>
                </Link>
                <p className='text-sm text-muted-foreground mt-1'>
                  Completed {formatDistanceToNow(new Date(pending.booking.endDate), { addSuffix: true })}
                </p>
              </div>
              <Button size='sm' onClick={onWriteReview}>
                <PenLine className='size-4 mr-2' />
                Write Review
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface WriteReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  listing: { slug: string; title: string; primaryImage: string | null };
  vehicle: { make: string; model: string; year: number };
  onSuccess: () => void;
}

function WriteReviewDialog({ open, onOpenChange, bookingId, listing, vehicle, onSuccess }: WriteReviewDialogProps) {
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
          <DialogDescription>Share your experience with {vehicleName}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Car Preview */}
          <div className='flex items-center gap-4'>
            <div className='w-20 h-14 rounded-lg overflow-hidden bg-muted'>
              {listing.primaryImage ? (
                <img src={listing.primaryImage} alt={vehicleName} className='w-full h-full object-cover' />
              ) : (
                <div className='w-full h-full flex items-center justify-center'>
                  <Car className='size-6 text-muted-foreground' />
                </div>
              )}
            </div>
            <div>
              <p className='font-medium'>{vehicleName}</p>
              <p className='text-sm text-muted-foreground'>{listing.title}</p>
            </div>
          </div>

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
                      i < displayRating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'
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
            <p className='text-xs text-muted-foreground text-right'>{comment.length}/2000</p>
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
