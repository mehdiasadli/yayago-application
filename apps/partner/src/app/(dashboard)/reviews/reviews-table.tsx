'use client';

import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { type ListPartnerReviewsOutputType } from '@yayago-app/validators';
import { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DataTable from '@/components/data-table';
import { format, formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, User, Car, CheckCircle, XCircle, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ReviewItem = ListPartnerReviewsOutputType['items'][number];

export default function ReviewsTable() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [take, setTake] = useQueryState('take', parseAsInteger.withDefault(10));
  const [rating] = useQueryState('rating', parseAsInteger);
  const [sortBy] = useQueryState('sort', parseAsString.withDefault('newest'));

  const { data, isLoading, error } = useQuery(
    orpc.reviews.listPartnerReviews.queryOptions({
      input: {
        page,
        take,
        rating: rating || undefined,
        sortBy: sortBy as 'newest' | 'oldest' | 'highest' | 'lowest',
      },
    })
  );

  const columns = useMemo<ColumnDef<ReviewItem>[]>(() => {
    return [
      {
        id: 'customer',
        accessorKey: 'user',
        header: 'Customer',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-3'>
              <Avatar className='size-9'>
                <AvatarImage src={row.original.user.image || undefined} />
                <AvatarFallback className='bg-primary/10 text-primary'>
                  <User className='size-4' />
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col min-w-0'>
                <span className='font-medium truncate'>{row.original.user.name}</span>
                <span className='text-xs text-muted-foreground'>
                  {row.original.booking.referenceCode}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'listing',
        header: 'Vehicle',
        cell: ({ row }) => {
          return (
            <div className='flex flex-col min-w-0'>
              <span className='font-medium truncate'>{row.original.listing.title}</span>
              <span className='text-xs text-muted-foreground'>
                {format(new Date(row.original.booking.startDate), 'MMM d')} -{' '}
                {format(new Date(row.original.booking.endDate), 'MMM d, yyyy')}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-1'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'size-4',
                    i < row.original.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: 'comment',
        header: 'Comment',
        cell: ({ row }) => {
          if (!row.original.comment) {
            return <span className='text-muted-foreground text-sm italic'>No comment</span>;
          }
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className='text-sm text-muted-foreground line-clamp-2 max-w-xs cursor-help'>
                    {row.original.comment}
                  </p>
                </TooltipTrigger>
                <TooltipContent className='max-w-sm'>
                  <p>{row.original.comment}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        id: 'tags',
        header: 'Feedback',
        cell: ({ row }) => {
          const tags = row.original.tags;
          const positiveCount = Object.values(tags).filter((v) => v === true).length;
          const negativeCount = Object.values(tags).filter((v) => v === false).length;
          const totalResponses = positiveCount + negativeCount;

          if (totalResponses === 0) {
            return <span className='text-muted-foreground text-sm'>—</span>;
          }

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex items-center gap-2'>
                    {positiveCount > 0 && (
                      <div className='flex items-center gap-1 text-green-600'>
                        <ThumbsUp className='size-3.5' />
                        <span className='text-sm font-medium'>{positiveCount}</span>
                      </div>
                    )}
                    {negativeCount > 0 && (
                      <div className='flex items-center gap-1 text-red-500'>
                        <ThumbsDown className='size-3.5' />
                        <span className='text-sm font-medium'>{negativeCount}</span>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className='max-w-xs'>
                  <div className='space-y-1 text-xs'>
                    <TagFeedbackItem label='Clean' value={tags.wasClean} />
                    <TagFeedbackItem label='As Described' value={tags.wasAsDescribed} />
                    <TagFeedbackItem label='Reliable' value={tags.wasReliable} />
                    <TagFeedbackItem label='Smooth Pickup' value={tags.wasPickupSmooth} />
                    <TagFeedbackItem label='Smooth Dropoff' value={tags.wasDropoffSmooth} />
                    <TagFeedbackItem label='Host Responsive' value={tags.wasHostResponsive} />
                    <TagFeedbackItem label='Good Value' value={tags.wasGoodValue} />
                    <TagFeedbackItem label='Would Rent Again' value={tags.wouldRentAgain} />
                    <TagFeedbackItem label='Would Recommend' value={tags.wouldRecommend} />
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        accessorKey: 'booking',
        header: 'Booking Value',
        cell: ({ row }) => {
          return (
            <div className='flex flex-col'>
              <span className='font-semibold'>
                {formatCurrency(row.original.booking.totalPrice, row.original.booking.currency)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => {
          return (
            <div className='flex flex-col'>
              <span className='text-sm'>{format(new Date(row.original.createdAt), 'd MMM yyyy')}</span>
              <span className='text-xs text-muted-foreground'>
                {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
              </span>
            </div>
          );
        },
      },
    ];
  }, []);

  // Handle error state
  if (error) {
    return (
      <Card>
        <CardContent className='py-16 text-center'>
          <MessageSquare className='size-12 mx-auto text-muted-foreground/50 mb-4' />
          <CardTitle className='text-lg mb-2'>Unable to Load Reviews</CardTitle>
          <CardDescription>
            Please make sure you have an active organization membership.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  // Handle empty state
  if (!isLoading && data?.items.length === 0 && !rating) {
    return (
      <Card>
        <CardContent className='py-16 text-center'>
          <Star className='size-16 mx-auto text-muted-foreground/50 mb-4' />
          <CardTitle className='text-xl mb-2'>No Reviews Yet</CardTitle>
          <CardDescription className='max-w-md mx-auto'>
            Once customers complete their rentals and leave reviews, they'll appear here.
            Great service leads to great reviews!
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      page={page}
      onPageChange={setPage}
      pageSize={take}
      onPageSizeChange={setTake}
    />
  );
}

function TagFeedbackItem({ label, value }: { label: string; value: boolean | null }) {
  if (value === null) return null;

  return (
    <div className='flex items-center justify-between gap-4'>
      <span>{label}</span>
      {value ? (
        <CheckCircle className='size-3.5 text-green-600' />
      ) : (
        <XCircle className='size-3.5 text-red-500' />
      )}
    </div>
  );
}

