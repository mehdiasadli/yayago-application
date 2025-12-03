'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@/lib/navigation/navigation-client';
import { toast } from 'sonner';
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

  // Get the current query key for this specific query
  const listFavoritesQueryKey = orpc.users.listFavorites.queryKey({
    input: { page, limit: 12, sortBy, sortOrder },
  });

  const removeMutation = useMutation({
    ...orpc.users.removeFavorite.mutationOptions(),
    onMutate: async ({ listingSlug }) => {
      // Cancel outgoing refetches using ORPC's key() for partial matching
      await queryClient.cancelQueries({ queryKey: orpc.users.listFavorites.key() });

      // Snapshot previous value using the full query key
      const previousData = queryClient.getQueryData(listFavoritesQueryKey);

      // Optimistically update the list
      queryClient.setQueryData(listFavoritesQueryKey, (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item) => item.listing.slug !== listingSlug),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1,
          },
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      // Use ORPC's key() for partial matching invalidation
      queryClient.invalidateQueries({ queryKey: orpc.users.listFavorites.key() });
      queryClient.invalidateQueries({ queryKey: orpc.users.checkFavorite.key() });
      queryClient.invalidateQueries({ queryKey: orpc.users.getAccountOverview.key() });
      toast.success('Removed from favorites');
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(listFavoritesQueryKey, context.previousData);
      }
      toast.error(error.message || 'Failed to remove from favorites');
    },
  });

  if (isLoading) {
    return <FavoritesSkeleton />;
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertDescription>{error.message || 'Failed to load favorites'}</AlertDescription>
      </Alert>
    );
  }

  const { items, pagination } = data!;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold'>My Favorites</h2>
          <p className='text-muted-foreground'>
            {pagination.total} saved {pagination.total === 1 ? 'car' : 'cars'}
          </p>
        </div>

        {items.length > 0 && (
          <div className='flex items-center gap-2'>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
                setPage(1);
              }}
            >
              <SelectTrigger className='w-[180px]'>
                <ArrowUpDown className='size-4 mr-2' />
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='dateAdded-desc'>Recently Added</SelectItem>
                <SelectItem value='dateAdded-asc'>Oldest First</SelectItem>
                <SelectItem value='price-asc'>Price: Low to High</SelectItem>
                <SelectItem value='price-desc'>Price: High to Low</SelectItem>
                <SelectItem value='name-asc'>Name: A to Z</SelectItem>
                <SelectItem value='name-desc'>Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <Card className='py-16'>
          <CardContent className='text-center'>
            <Heart className='size-16 mx-auto text-muted-foreground/50 mb-4' />
            <h3 className='text-lg font-medium mb-2'>No favorites yet</h3>
            <p className='text-muted-foreground mb-6 max-w-sm mx-auto'>
              Start browsing and save the cars you love to find them easily later
            </p>
            <Button asChild>
              <Link href='/rent/cars'>
                <Search className='size-4 mr-2' />
                Browse Cars
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {items.map((favorite) => (
              <FavoriteCard
                key={favorite.id}
                favorite={favorite}
                onRemove={(slug) => removeMutation.mutate({ listingSlug: slug })}
                isRemoving={removeMutation.isPending}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className='flex items-center justify-center gap-2'>
              <Button variant='outline' size='icon' disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className='size-4' />
              </Button>
              <span className='text-sm text-muted-foreground'>
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant='outline'
                size='icon'
                disabled={page === pagination.totalPages}
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

interface FavoriteCardProps {
  favorite: {
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
  onRemove: (slug: string) => void;
  isRemoving: boolean;
}

function FavoriteCard({ favorite, onRemove, isRemoving }: FavoriteCardProps) {
  const { listing } = favorite;

  return (
    <Card className='overflow-hidden group'>
      <Link href={`/rent/cars/${listing.slug}`}>
        <div className='relative aspect-4/3 bg-muted'>
          {listing.primaryImage ? (
            <img
              src={listing.primaryImage}
              alt={listing.title}
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <Car className='size-12 text-muted-foreground' />
            </div>
          )}
          {listing.bookingDetails?.instantBooking && (
            <Badge className='absolute top-2 left-2 gap-1' variant='secondary'>
              <Zap className='size-3' />
              Instant
            </Badge>
          )}
          <Badge variant={listing.status === 'AVAILABLE' ? 'default' : 'secondary'} className='absolute top-2 right-2'>
            {listing.status === 'AVAILABLE' ? 'Available' : listing.status}
          </Badge>
        </div>
      </Link>

      <CardContent className='p-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <Link href={`/rent/cars/${listing.slug}`}>
              <h3 className='font-medium truncate hover:text-primary transition-colors'>{listing.title}</h3>
            </Link>
            <p className='text-sm text-muted-foreground truncate'>
              {listing.vehicle.brand} {listing.vehicle.model} • {listing.vehicle.year}
            </p>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='shrink-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50'
            onClick={() => onRemove(listing.slug)}
            disabled={isRemoving}
          >
            {isRemoving ? <Loader2 className='size-4 animate-spin' /> : <Trash2 className='size-4' />}
          </Button>
        </div>

        {listing.location && (
          <div className='flex items-center gap-1 mt-2 text-sm text-muted-foreground'>
            <MapPin className='size-3' />
            <span>
              {listing.location.city}, {listing.location.country}
            </span>
          </div>
        )}

        <div className='flex items-center justify-between mt-3 pt-3 border-t'>
          <div>
            <span className='text-lg font-bold'>
              {listing.currency} {listing.pricePerDay.toLocaleString()}
            </span>
            <span className='text-sm text-muted-foreground'>/day</span>
          </div>
          <span className='text-xs text-muted-foreground'>
            Added {formatDistanceToNow(new Date(favorite.addedAt), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function FavoritesSkeleton() {
  return (
    <div className='space-y-6'>
      <div>
        <Skeleton className='h-8 w-40 mb-2' />
        <Skeleton className='h-4 w-24' />
      </div>
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className='overflow-hidden'>
            <Skeleton className='aspect-4/3' />
            <CardContent className='p-4'>
              <Skeleton className='h-5 w-3/4 mb-2' />
              <Skeleton className='h-4 w-1/2 mb-3' />
              <Skeleton className='h-4 w-1/3' />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
