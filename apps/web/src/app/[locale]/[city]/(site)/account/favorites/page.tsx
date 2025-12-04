'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@/lib/navigation/navigation-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Heart,
  Car,
  MapPin,
  Zap,
  Trash2,
  AlertCircle,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  Star,
  Calendar,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

// ============ Types ============
type FavoriteItem = {
  id: string;
  addedAt: Date;
  listing: {
    id: string;
    slug: string;
    title: string;
    status: string;
    primaryImage: string | null;
    pricePerDay: number;
    currency: string;
    location: { city: string; country: string } | null;
    vehicle: { brand: string; model: string; year: number; class: string };
    organization: { name: string; slug: string };
    bookingDetails: { instantBooking: boolean } | null;
  };
};

export default function FavoritesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'dateAdded' | 'price' | 'name'>('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, error } = useQuery(
    orpc.users.listFavorites.queryOptions({
      input: { page, limit: 12, sortBy, sortOrder },
    })
  );

  const listFavoritesQueryKey = orpc.users.listFavorites.queryKey({
    input: { page, limit: 12, sortBy, sortOrder },
  });

  const removeMutation = useMutation({
    ...orpc.users.removeFavorite.mutationOptions(),
    onMutate: async ({ listingSlug }) => {
      await queryClient.cancelQueries({ queryKey: orpc.users.listFavorites.key() });
      const previousData = queryClient.getQueryData(listFavoritesQueryKey);
      queryClient.setQueryData(listFavoritesQueryKey, (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item) => item.listing.slug !== listingSlug),
          pagination: { ...old.pagination, total: old.pagination.total - 1 },
        };
      });
      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.users.listFavorites.key() });
      queryClient.invalidateQueries({ queryKey: orpc.users.checkFavorite.key() });
      queryClient.invalidateQueries({ queryKey: orpc.users.getAccountOverview.key() });
      toast.success('Removed from favorites');
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(listFavoritesQueryKey, context.previousData);
      }
      toast.error(error.message || 'Failed to remove from favorites');
    },
  });

  // Use mock data if enabled
  const displayItems = data?.items || [];
  const displayPagination = data?.pagination || { total: 0, totalPages: 0, page: 1, limit: 12 };

  const showLoading = isLoading;
  const showError = error;

  if (showLoading) {
    return <FavoritesSkeleton />;
  }

  if (showError) {
    return (
      <Alert variant='destructive' className='rounded-2xl'>
        <AlertCircle className='size-4' />
        <AlertDescription>{error?.message || 'Failed to load favorites'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-2xl border bg-card overflow-hidden'>
        <div className='p-5 sm:p-6 bg-linear-to-r from-rose-500/10 via-pink-500/5 to-violet-500/10'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-2xl bg-rose-500/10 shrink-0'>
                <Heart className='size-7 text-rose-500' />
              </div>
              <div>
                <h1 className='text-2xl font-bold'>My Favorites</h1>
                <p className='text-muted-foreground text-sm'>
                  {displayPagination.total} saved {displayPagination.total === 1 ? 'car' : 'cars'}
                </p>
              </div>
            </div>
            <Button asChild className='rounded-xl gap-2 shadow-lg shadow-primary/20'>
              <Link href='/rent/cars'>
                <Search className='size-4' />
                Browse Cars
              </Link>
            </Button>
          </div>
        </div>

        {/* Sort Controls */}
        {displayItems.length > 0 && (
          <div className='px-4 sm:px-6 py-3 border-t bg-muted/30'>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                Showing {displayItems.length} of {displayPagination.total} favorites
              </p>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                  setPage(1);
                }}
              >
                <SelectTrigger className='w-[180px] rounded-xl h-10'>
                  <ArrowUpDown className='size-4 mr-2' />
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent className='rounded-xl'>
                  <SelectItem value='dateAdded-desc'>Recently Added</SelectItem>
                  <SelectItem value='dateAdded-asc'>Oldest First</SelectItem>
                  <SelectItem value='price-asc'>Price: Low to High</SelectItem>
                  <SelectItem value='price-desc'>Price: High to Low</SelectItem>
                  <SelectItem value='name-asc'>Name: A to Z</SelectItem>
                  <SelectItem value='name-desc'>Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {displayItems.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {displayItems.map((favorite) => (
              <FavoriteCard
                key={favorite.id}
                favorite={favorite}
                onRemove={(slug) => removeMutation.mutate({ listingSlug: slug })}
                isRemoving={removeMutation.isPending}
              />
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
      )}
    </div>
  );
}

// ============ Favorite Card ============
function FavoriteCard({
  favorite,
  onRemove,
  isRemoving,
}: {
  favorite: FavoriteItem;
  onRemove: (slug: string) => void;
  isRemoving: boolean;
}) {
  const { listing } = favorite;
  const isAvailable = listing.status === 'AVAILABLE';

  return (
    <div className='rounded-2xl border bg-card overflow-hidden group hover:shadow-lg hover:border-primary/30 transition-all'>
      {/* Image */}
      <Link href={`/rent/cars/${listing.slug}`}>
        <div className='relative aspect-4/3 bg-muted'>
          {listing.primaryImage ? (
            <img
              src={listing.primaryImage}
              alt={listing.title}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-muted/50'>
              <Car className='size-12 text-muted-foreground' />
            </div>
          )}
          {/* Dark overlay */}
          <div className='absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/30' />

          {/* Badges */}
          <div className='absolute top-3 left-3 flex items-center gap-2'>
            {listing.bookingDetails?.instantBooking && (
              <Badge className='gap-1 px-2.5 py-1 border-0 shadow-lg backdrop-blur-md bg-amber-500/90 text-white'>
                <Zap className='size-3' />
                Instant
              </Badge>
            )}
          </div>

          {/* Status badge */}
          <div className='absolute top-3 right-3'>
            <Badge
              className={cn(
                'px-2.5 py-1 border-0 shadow-lg backdrop-blur-md',
                isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-black/50 text-white'
              )}
            >
              {isAvailable ? 'Available' : listing.status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Price overlay */}
          <div className='absolute bottom-3 left-3'>
            <div className='px-3 py-1.5 rounded-lg backdrop-blur-md bg-black/50 text-white'>
              <span className='text-lg font-bold'>
                {listing.currency} {listing.pricePerDay.toLocaleString()}
              </span>
              <span className='text-sm opacity-80'>/day</span>
            </div>
          </div>

          {/* Remove button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onRemove(listing.slug);
            }}
            disabled={isRemoving}
            className='absolute bottom-3 right-3 p-2.5 rounded-xl backdrop-blur-md bg-black/50 text-white hover:bg-rose-500 transition-colors disabled:opacity-50'
          >
            {isRemoving ? <Loader2 className='size-4 animate-spin' /> : <Trash2 className='size-4' />}
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className='p-4'>
        <Link href={`/rent/cars/${listing.slug}`}>
          <h3 className='font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1'>
            {listing.title}
          </h3>
        </Link>
        <p className='text-sm text-muted-foreground mt-0.5'>
          {listing.vehicle.brand} {listing.vehicle.model} • {listing.vehicle.year}
        </p>

        {/* Details */}
        <div className='mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
          {listing.location && (
            <div className='flex items-center gap-1'>
              <MapPin className='size-3.5' />
              <span>{listing.location.city}</span>
            </div>
          )}
          <div className='flex items-center gap-1'>
            <Building2 className='size-3.5' />
            <span className='truncate max-w-[120px]'>{listing.organization.name}</span>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-4 pt-3 border-t border-dashed flex items-center justify-between'>
          <Badge variant='outline' className='text-xs font-normal'>
            {listing.vehicle.class}
          </Badge>
          <span className='text-xs text-muted-foreground flex items-center gap-1'>
            <Clock className='size-3' />
            Added {formatDistanceToNow(new Date(favorite.addedAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============ Empty State ============
function EmptyState() {
  return (
    <div className='rounded-2xl border bg-card p-8 sm:p-12 text-center'>
      <div className='size-20 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center mb-5'>
        <Heart className='size-10 text-rose-500' />
      </div>
      <h3 className='text-xl font-semibold'>No favorites yet</h3>
      <p className='text-muted-foreground mt-2 max-w-sm mx-auto'>
        Start browsing and save the cars you love to find them easily later
      </p>
      <Button asChild className='mt-6 rounded-xl gap-2'>
        <Link href='/rent/cars'>
          <Search className='size-4' />
          Browse Cars
        </Link>
      </Button>
    </div>
  );
}

// ============ Skeleton ============
function FavoritesSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div className='rounded-2xl border bg-card overflow-hidden'>
        <div className='p-5 sm:p-6'>
          <div className='flex items-center gap-4'>
            <Skeleton className='size-14 rounded-2xl' />
            <div>
              <Skeleton className='h-7 w-40 mb-2' />
              <Skeleton className='h-4 w-24' />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='rounded-2xl border bg-card overflow-hidden'>
            <Skeleton className='aspect-4/3' />
            <div className='p-4'>
              <Skeleton className='h-6 w-3/4 mb-2' />
              <Skeleton className='h-4 w-1/2 mb-3' />
              <Skeleton className='h-4 w-2/3 mb-4' />
              <div className='pt-3 border-t border-dashed flex justify-between'>
                <Skeleton className='h-5 w-16' />
                <Skeleton className='h-4 w-24' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
