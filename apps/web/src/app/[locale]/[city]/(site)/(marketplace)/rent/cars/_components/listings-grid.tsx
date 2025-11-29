'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import ListingCard from './listing-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseAsInteger, parseAsString, parseAsBoolean, parseAsIsoDate, useQueryState } from 'nuqs';
import { Car, ChevronLeft, ChevronRight, PackageOpen, SlidersHorizontal, Map, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { VehicleClass, VehicleBodyType, VehicleFuelType, VehicleTransmissionType } from '@yayago-app/db/enums';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map to avoid SSR issues
const CarsMap = dynamic(() => import('@/components/maps/cars-map'), {
  ssr: false,
  loading: () => <Skeleton className='w-full h-[500px] rounded-xl' />,
});

interface ListingsGridProps {
  cityCode: string;
}

const ITEMS_PER_PAGE = 12;

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'distance', label: 'Nearest First' },
];

export default function ListingsGrid({ cityCode }: ListingsGridProps) {
  const [showMap, setShowMap] = useState(false);

  // Use nuqs for URL state management
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState('sortBy', parseAsString.withDefault('newest'));
  const [q] = useQueryState('q', parseAsString);
  const [vehicleClass] = useQueryState('vehicleClass', parseAsString);
  const [bodyType] = useQueryState('bodyType', parseAsString);
  const [fuelType] = useQueryState('fuelType', parseAsString);
  const [transmissionType] = useQueryState('transmissionType', parseAsString);
  const [brandSlug] = useQueryState('brandSlug', parseAsString);
  const [modelSlug] = useQueryState('modelSlug', parseAsString);
  const [minSeats] = useQueryState('minSeats', parseAsInteger);
  const [maxSeats] = useQueryState('maxSeats', parseAsInteger);
  const [minDoors] = useQueryState('minDoors', parseAsInteger);
  const [maxDoors] = useQueryState('maxDoors', parseAsInteger);
  const [minYear] = useQueryState('minYear', parseAsInteger);
  const [maxYear] = useQueryState('maxYear', parseAsInteger);
  const [minPrice] = useQueryState('minPrice', parseAsInteger);
  const [maxPrice] = useQueryState('maxPrice', parseAsInteger);
  const [hasInstantBooking] = useQueryState('hasInstantBooking', parseAsBoolean);
  const [hasNoDeposit] = useQueryState('hasNoDeposit', parseAsBoolean);
  const [hasFreeCancellation] = useQueryState('hasFreeCancellation', parseAsBoolean);
  const [hasDelivery] = useQueryState('hasDelivery', parseAsBoolean);
  const [isFeatured] = useQueryState('isFeatured', parseAsBoolean);

  // Date filters
  const [startDate] = useQueryState('startDate', parseAsIsoDate);
  const [endDate] = useQueryState('endDate', parseAsIsoDate);

  // Location filters
  const [lat] = useQueryState('lat', parseAsString);
  const [lng] = useQueryState('lng', parseAsString);
  const [radius] = useQueryState('radius', parseAsInteger);

  const { data, isLoading, error } = useQuery(
    orpc.listings.listPublic.queryOptions({
      input: {
        page,
        take: ITEMS_PER_PAGE,
        cityCode,
        q: q || undefined,
        vehicleClass: (vehicleClass as VehicleClass) || undefined,
        bodyType: (bodyType as VehicleBodyType) || undefined,
        fuelType: (fuelType as VehicleFuelType) || undefined,
        transmissionType: (transmissionType as VehicleTransmissionType) || undefined,
        minSeats: minSeats || undefined,
        maxSeats: maxSeats || undefined,
        minDoors: minDoors || undefined,
        maxDoors: maxDoors || undefined,
        minYear: minYear || undefined,
        maxYear: maxYear || undefined,
        brandSlug: brandSlug || undefined,
        modelSlug: modelSlug || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        hasInstantBooking: hasInstantBooking || undefined,
        hasNoDeposit: hasNoDeposit || undefined,
        hasFreeCancellation: hasFreeCancellation || undefined,
        hasDelivery: hasDelivery || undefined,
        isFeatured: isFeatured || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
        radius: radius || undefined,
        sortBy: sortBy as 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating' | 'distance',
      },
    })
  );

  // Prepare car locations for map
  const carLocations =
    data?.items
      .filter((item) => item.location?.lat && item.location?.lng)
      .map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        lat: item.location!.lat,
        lng: item.location!.lng,
        pricePerDay: item.pricing.totalPrice ?? item.pricing.pricePerDay,
        currency: item.pricing.currency,
        primaryImage: item.primaryMedia?.url || null,
        brand: item.vehicle.model.brand.name,
        model: item.vehicle.model.name,
        year: item.vehicle.year,
        hasInstantBooking: item.bookingDetails.hasInstantBooking,
      })) || [];

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const clearAllFilters = async () => {
    // Just reload with clean URL
    window.location.href = window.location.pathname;
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-10 w-40' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='space-y-4 rounded-xl border bg-card p-0 overflow-hidden'>
              <Skeleton className='h-56 w-full' />
              <div className='p-4 space-y-3'>
                <Skeleton className='h-5 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
                <div className='grid grid-cols-4 gap-2'>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className='h-12 rounded-lg' />
                  ))}
                </div>
                <Skeleton className='h-px w-full' />
                <div className='flex justify-between'>
                  <Skeleton className='h-10 w-32' />
                  <Skeleton className='h-10 w-24' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <PackageOpen className='size-16 text-muted-foreground/30 mb-4' />
        <h3 className='text-lg font-semibold'>Unable to Load Listings</h3>
        <p className='text-muted-foreground mt-1'>Please try again later</p>
        <p className='text-xs text-red-500 mt-2'>{error.message}</p>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <Car className='size-16 text-muted-foreground/30 mb-4' />
        <h3 className='text-lg font-semibold'>No Vehicles Found</h3>
        <p className='text-muted-foreground mt-1'>Try adjusting your filters or search in a different area</p>
        <Button variant='outline' className='mt-4' onClick={clearAllFilters}>
          <SlidersHorizontal className='size-4 mr-2' />
          Clear Filters
        </Button>
      </div>
    );
  }

  const totalPages = data.pagination.totalPages;

  return (
    <div className='space-y-6'>
      {/* Header with results count and sorting */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <p className='text-muted-foreground'>
          Showing <span className='font-medium text-foreground'>{data.items.length}</span> of{' '}
          <span className='font-medium text-foreground'>{data.pagination.total}</span> vehicles
          {startDate && endDate && (
            <span className='block text-sm'>
              for {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
            </span>
          )}
        </p>
        <div className='flex items-center gap-2'>
          <Button
            variant={showMap ? 'default' : 'outline'}
            size='sm'
            onClick={() => setShowMap(!showMap)}
            className='hidden md:flex'
          >
            <Map className='size-4 mr-2' />
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
          <span className='text-sm text-muted-foreground'>Sort by:</span>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className='w-44'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} disabled={option.value === 'distance' && !lat}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Map View */}
      {showMap && (
        <div className='rounded-xl overflow-hidden'>
          {carLocations.length > 0 ? (
            <CarsMap
              cars={carLocations}
              center={lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined}
              height='400px'
            />
          ) : (
            <div className='h-[400px] bg-muted/50 rounded-xl flex flex-col items-center justify-center gap-2'>
              <MapPin className='size-8 text-muted-foreground' />
              <p className='text-muted-foreground text-sm'>No cars with location data available</p>
              <p className='text-muted-foreground/70 text-xs'>
                Cars will appear on the map when partners add their locations
              </p>
            </div>
          )}
        </div>
      )}

      {/* Listings Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {data.items.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            showTotalPrice={!!(startDate && endDate)}
            totalDays={
              startDate && endDate
                ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                : undefined
            }
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center items-center gap-2 pt-8'>
          <Button variant='outline' size='sm' onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
            <ChevronLeft className='size-4' />
            Previous
          </Button>
          <div className='flex items-center gap-1'>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handlePageChange(pageNum)}
                  className='w-10'
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button variant='outline' size='sm' onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>
            Next
            <ChevronRight className='size-4' />
          </Button>
        </div>
      )}
    </div>
  );
}
