'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Star,
  Car,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  PenLine,
  Loader2,
  Calendar,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============ Types ============
type ReviewItem = {
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

type PendingReviewItem = {
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

// ============ Tab Configuration ============
const tabs = [
  { id: 'written', label: 'Written Reviews', icon: MessageSquare },
  { id: 'pending', label: 'Pending', icon: PenLine },
] as const;

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<'written' | 'pending'>('written');
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

  const displayReviews = reviewsData?.items || [];
  const displayPending = pendingData?.pendingReviews || [];
  const displayPagination = reviewsData?.pagination || { total: 0, totalPages: 0, page: 1, take: 10 };

  const showReviewsLoading = reviewsLoading;
  const showPendingLoading = pendingLoading;

  const handleWriteReview = (pending: PendingReviewItem) => {
    setSelectedBooking({
      id: pending.booking.id,
      listing: pending.listing,
      vehicle: pending.vehicle,
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
      {/* Header */}
      <div className='rounded-2xl border bg-card overflow-hidden'>
        <div className='p-5 sm:p-6 bg-linear-to-r from-violet-500/10 via-purple-500/5 to-pink-500/10'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-2xl bg-violet-500/10 shrink-0'>
                <Star className='size-7 text-violet-500' />
              </div>
              <div>
                <h1 className='text-2xl font-bold'>My Reviews</h1>
                <p className='text-muted-foreground text-sm'>Share your rental experiences</p>
              </div>
            </div>
            {displayPending.length > 0 && (
              <Badge className='gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 border-amber-500/20'>
                <Sparkles className='size-3.5' />
                {displayPending.length} pending {displayPending.length === 1 ? 'review' : 'reviews'}
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className='px-4 sm:px-6 py-3 border-t bg-muted/30'>
          <div className='flex gap-2'>
            {tabs.map((tab) => {
              const count = tab.id === 'written' ? displayPagination.total : displayPending.length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'bg-card border hover:bg-accent'
                  )}
                >
                  <tab.icon className='size-4' />
                  {tab.label}
                  {count > 0 && (
                    <Badge
                      variant={activeTab === tab.id ? 'secondary' : 'outline'}
                      className={cn('ml-1 text-xs', activeTab === tab.id && 'bg-primary-foreground/20 text-primary-foreground')}
                    >
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'written' ? (
        showReviewsLoading ? (
          <ReviewsSkeleton />
        ) : displayReviews.length > 0 ? (
          <>
            <div className='space-y-3'>
              {displayReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* Pagination */}
            {displayPagination.totalPages > 1 && (
              <div className='flex items-center justify-center gap-3'>
                <Button
                  variant='outline'
                  size='icon'
                  className='rounded-xl'
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className='size-4' />
                </Button>
                <div className='px-4 py-2 rounded-xl bg-muted/50 text-sm text-muted-foreground'>
                  Page {page} of {displayPagination.totalPages}
                </div>
                <Button
                  variant='outline'
                  size='icon'
                  className='rounded-xl'
                  disabled={page === displayPagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className='size-4' />
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState type='written' />
        )
      ) : showPendingLoading ? (
        <PendingReviewsSkeleton />
      ) : displayPending.length > 0 ? (
        <div className='space-y-3'>
          {displayPending.map((pending) => (
            <PendingReviewCard key={pending.booking.id} pending={pending} onWriteReview={() => handleWriteReview(pending)} />
          ))}
        </div>
      ) : (
        <EmptyState type='pending' />
      )}

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

// ============ Review Card ============
function ReviewCard({ review }: { review: ReviewItem }) {
  const vehicleName = review.listing.vehicle
    ? `${review.listing.vehicle.model.brand.name} ${review.listing.vehicle.model.name} ${review.listing.vehicle.year}`
    : review.listing.title;

  return (
    <Link href={`/rent/cars/${review.listing.slug}`} className='block group'>
      <div className='rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30'>
        <div className='flex flex-col sm:flex-row'>
          {/* Image */}
          <div className='relative w-full sm:w-44 h-32 sm:h-auto shrink-0'>
            {review.listing.primaryImage ? (
              <img
                src={review.listing.primaryImage}
                alt={review.listing.title}
                className='w-full h-full object-cover transition-transform group-hover:scale-105'
              />
            ) : (
              <div className='w-full h-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center'>
                <Car className='size-10 text-muted-foreground' />
              </div>
            )}
            {/* Dark overlay */}
            <div className='absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20' />
            {/* Rating on image */}
            <div className='absolute bottom-3 left-3'>
              <div className='flex items-center gap-1 px-2.5 py-1 rounded-lg backdrop-blur-md bg-black/50'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn('size-4', i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/30')}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 p-4 sm:p-5 flex flex-col min-w-0'>
            {/* Header */}
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <h3 className='font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1'>
                  {vehicleName}
                </h3>
                <p className='text-sm text-muted-foreground mt-0.5'>{review.listing.title}</p>
              </div>
              <Badge variant='outline' className='shrink-0 font-mono text-xs'>
                {review.booking.referenceCode}
              </Badge>
            </div>

            {/* Comment */}
            {review.comment ? (
              <p className='mt-3 text-sm text-muted-foreground line-clamp-2'>{review.comment}</p>
            ) : (
              <p className='mt-3 text-sm text-muted-foreground italic'>No comment provided</p>
            )}

            {/* Footer */}
            <div className='mt-auto pt-4 flex items-center justify-between border-t border-dashed'>
              <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                <div className='flex items-center gap-1.5'>
                  <Calendar className='size-3.5' />
                  <span>
                    {format(new Date(review.booking.startDate), 'MMM d')} -{' '}
                    {format(new Date(review.booking.endDate), 'MMM d')}
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                <Clock className='size-3.5' />
                <span>Reviewed {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============ Pending Review Card ============
function PendingReviewCard({ pending, onWriteReview }: { pending: PendingReviewItem; onWriteReview: () => void }) {
  const vehicleName = `${pending.vehicle.make} ${pending.vehicle.model} ${pending.vehicle.year}`;

  return (
    <div className='rounded-2xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 overflow-hidden'>
      <div className='flex flex-col sm:flex-row'>
        {/* Image */}
        <Link href={`/rent/cars/${pending.listing.slug}`} className='relative w-full sm:w-44 h-32 sm:h-auto shrink-0 group'>
          {pending.listing.primaryImage ? (
            <img
              src={pending.listing.primaryImage}
              alt={pending.listing.title}
              className='w-full h-full object-cover transition-transform group-hover:scale-105'
            />
          ) : (
            <div className='w-full h-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center'>
              <Car className='size-10 text-muted-foreground' />
            </div>
          )}
          {/* Dark overlay */}
          <div className='absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20' />
          {/* Pending badge */}
          <div className='absolute bottom-3 left-3'>
            <Badge className='gap-1.5 px-2.5 py-1 border-0 shadow-lg backdrop-blur-md bg-amber-500 text-white'>
              <Sparkles className='size-3' />
              Awaiting Review
            </Badge>
          </div>
        </Link>

        {/* Content */}
        <div className='flex-1 p-4 sm:p-5 flex flex-col min-w-0'>
          {/* Header */}
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0'>
              <Link href={`/rent/cars/${pending.listing.slug}`}>
                <h3 className='font-semibold text-lg hover:text-primary transition-colors line-clamp-1'>{vehicleName}</h3>
              </Link>
              <p className='text-sm text-muted-foreground mt-0.5'>{pending.listing.title}</p>
            </div>
            <Badge variant='outline' className='shrink-0 font-mono text-xs'>
              {pending.booking.referenceCode}
            </Badge>
          </div>

          {/* Info */}
          <div className='mt-3 flex items-center gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1.5'>
              <Calendar className='size-3.5' />
              <span>
                {format(new Date(pending.booking.startDate), 'MMM d')} -{' '}
                {format(new Date(pending.booking.endDate), 'MMM d, yyyy')}
              </span>
            </div>
            <div className='flex items-center gap-1.5'>
              <CheckCircle2 className='size-3.5 text-emerald-500' />
              <span>Completed {formatDistanceToNow(new Date(pending.booking.endDate), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Footer */}
          <div className='mt-auto pt-4 flex items-center justify-between'>
            <p className='text-sm text-amber-600 dark:text-amber-400'>Share your experience with this rental</p>
            <Button onClick={onWriteReview} className='rounded-xl gap-2 shadow-lg shadow-primary/20'>
              <PenLine className='size-4' />
              Write Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Empty States ============
function EmptyState({ type }: { type: 'written' | 'pending' }) {
  const config = {
    written: {
      icon: MessageSquare,
      title: 'No reviews yet',
      description: 'After completing a rental, you can share your experience here',
      color: 'violet',
    },
    pending: {
      icon: CheckCircle2,
      title: 'All caught up!',
      description: 'No pending reviews. Complete a rental to leave a review.',
      color: 'emerald',
    },
  }[type];

  return (
    <div className='rounded-2xl border bg-card p-8 sm:p-12 text-center'>
      <div
        className={cn(
          'size-20 mx-auto rounded-2xl flex items-center justify-center mb-5',
          type === 'written' ? 'bg-violet-500/10' : 'bg-emerald-500/10'
        )}
      >
        <config.icon className={cn('size-10', type === 'written' ? 'text-violet-500' : 'text-emerald-500')} />
      </div>
      <h3 className='text-xl font-semibold'>{config.title}</h3>
      <p className='text-muted-foreground mt-2 max-w-sm mx-auto'>{config.description}</p>
    </div>
  );
}

// ============ Write Review Dialog ============
function WriteReviewDialog({
  open,
  onOpenChange,
  bookingId,
  listing,
  vehicle,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  listing: { slug: string; title: string; primaryImage: string | null };
  vehicle: { make: string; model: string; year: number };
  onSuccess: () => void;
}) {
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
  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md rounded-2xl'>
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>Share your experience with {vehicleName}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Car Preview */}
          <div className='flex items-center gap-4 p-3 rounded-xl bg-muted/50'>
            <div className='w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0'>
              {listing.primaryImage ? (
                <img src={listing.primaryImage} alt={vehicleName} className='w-full h-full object-cover' />
              ) : (
                <div className='w-full h-full flex items-center justify-center'>
                  <Car className='size-6 text-muted-foreground' />
                </div>
              )}
            </div>
            <div className='min-w-0'>
              <p className='font-medium truncate'>{vehicleName}</p>
              <p className='text-sm text-muted-foreground truncate'>{listing.title}</p>
            </div>
          </div>

          {/* Rating */}
          <div className='space-y-3'>
            <label className='text-sm font-medium'>Your Rating</label>
            <div className='flex items-center gap-2'>
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
                        i < displayRating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'
                      )}
                    />
                  </button>
                ))}
              </div>
              {displayRating > 0 && (
                <Badge variant='secondary' className='ml-2'>
                  {ratingLabels[displayRating]}
                </Badge>
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
              className='rounded-xl resize-none'
            />
            <p className='text-xs text-muted-foreground text-right'>{comment.length}/2000</p>
          </div>
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' className='rounded-xl' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className='rounded-xl gap-2' onClick={handleSubmit} disabled={createReview.isPending || rating === 0}>
            {createReview.isPending && <Loader2 className='size-4 animate-spin' />}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ Skeletons ============
function ReviewsSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className='rounded-2xl border bg-card overflow-hidden'>
          <div className='flex flex-col sm:flex-row'>
            <Skeleton className='w-full sm:w-44 h-32 sm:h-36 rounded-none' />
            <div className='flex-1 p-4 sm:p-5 space-y-3'>
              <div className='flex justify-between'>
                <div>
                  <Skeleton className='h-6 w-48 mb-2' />
                  <Skeleton className='h-4 w-32' />
                </div>
                <Skeleton className='h-5 w-24' />
              </div>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
              <div className='pt-4 border-t border-dashed flex justify-between'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-4 w-28' />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingReviewsSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className='rounded-2xl border-2 border-dashed bg-card overflow-hidden'>
          <div className='flex flex-col sm:flex-row'>
            <Skeleton className='w-full sm:w-44 h-32 sm:h-36 rounded-none' />
            <div className='flex-1 p-4 sm:p-5 space-y-3'>
              <div className='flex justify-between'>
                <div>
                  <Skeleton className='h-6 w-48 mb-2' />
                  <Skeleton className='h-4 w-32' />
                </div>
                <Skeleton className='h-5 w-24' />
              </div>
              <Skeleton className='h-4 w-64' />
              <div className='pt-4 flex justify-between items-center'>
                <Skeleton className='h-4 w-48' />
                <Skeleton className='h-10 w-32 rounded-xl' />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
