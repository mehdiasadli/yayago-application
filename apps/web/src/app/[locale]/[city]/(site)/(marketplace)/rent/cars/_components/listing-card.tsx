'use client';

import { useState } from 'react';
import { Link } from '@/lib/navigation/navigation-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency, formatEnumValue, cn } from '@/lib/utils';
import {
  Car,
  Star,
  Zap,
  Users,
  Fuel,
  Cog,
  Heart,
  Building2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Gauge,
  Shield,
  CheckCircle2,
  DoorOpen,
} from 'lucide-react';
import type { ListPublicListingsOutputType } from '@yayago-app/validators';

type ListingItemType = ListPublicListingsOutputType['items'][number];

interface ListingCardProps {
  listing: ListingItemType;
}

// Simple image carousel component
function ImageCarousel({ images, alt }: { images: { url: string; alt: string | null }[]; alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50'>
        <Car className='size-20 text-muted-foreground/20' />
      </div>
    );
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className='relative w-full h-full group/carousel'>
      <img
        src={images[currentIndex].url}
        alt={images[currentIndex].alt || alt}
        className='w-full h-full object-cover transition-transform duration-500'
      />

      {/* Navigation arrows - only show if multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className='absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70'
          >
            <ChevronLeft className='size-4' />
          </button>
          <button
            onClick={goToNext}
            className='absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70'
          >
            <ChevronRight className='size-4' />
          </button>

          {/* Dots indicator */}
          <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5'>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={cn(
                  'size-2 rounded-full transition-all',
                  index === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/75'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const {
    slug,
    title,
    primaryMedia,
    vehicle,
    pricing,
    bookingDetails,
    averageRating,
    reviewCount,
    isFeatured,
    organization,
  } = listing;

  // Prepare images array (for now just primary, but ready for multiple)
  const images = primaryMedia ? [{ url: primaryMedia.url, alt: primaryMedia.alt }] : [];

  // Get vehicle class color
  const getClassColor = (vehicleClass: string) => {
    switch (vehicleClass) {
      case 'LUXURY':
        return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950';
      case 'SPORTS':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white';
      case 'PREMIUM':
        return 'bg-gradient-to-r from-violet-500 to-purple-500 text-white';
      case 'SUV':
        return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white';
      case 'ECONOMY':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default:
        return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white';
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Implement actual favorites API
  };

  return (
    <TooltipProvider>
      <Card className='group overflow-hidden bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border-border/50 hover:border-primary/20'>
        <Link href={`/rent/cars/${slug}`} className='block'>
          {/* Image Section */}
          <div className='relative aspect-[16/10] overflow-hidden'>
            <ImageCarousel images={images} alt={title} />

            {/* Gradient overlay */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none' />

            {/* Top badges */}
            <div className='absolute top-3 left-3 flex flex-wrap gap-2 z-10'>
              {isFeatured && (
                <Badge className='bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border-0 shadow-lg'>
                  <Star className='size-3 fill-current mr-1' />
                  Featured
                </Badge>
              )}
              <Badge className={cn('border-0 shadow-lg', getClassColor(vehicle.class))}>
                {formatEnumValue(vehicle.class)}
              </Badge>
            </div>

            {/* Quick features badges */}
            <div className='absolute top-3 right-12 flex gap-1.5 z-10'>
              {bookingDetails.hasInstantBooking && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg'>
                      <Zap className='size-4' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Instant Booking</TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Favorite Button */}
            <Button
              size='icon'
              variant='ghost'
              className={cn(
                'absolute top-3 right-3 size-8 rounded-full backdrop-blur-md transition-all z-10',
                isFavorite
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/20 text-white hover:bg-white/30 hover:text-red-400'
              )}
              onClick={handleFavoriteClick}
            >
              <Heart className={cn('size-4', isFavorite && 'fill-current')} />
            </Button>

            {/* Brand Logo & Year */}
            <div className='absolute bottom-3 left-3 flex items-center gap-2 z-10'>
              {vehicle.model.brand.logo && (
                <div className='size-10 rounded-lg bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg'>
                  <img
                    src={vehicle.model.brand.logo}
                    alt={vehicle.model.brand.name}
                    className='size-7 object-contain'
                  />
                </div>
              )}
              <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm'>
                <Calendar className='size-3.5 text-white/70' />
                <span className='text-white text-sm font-medium'>{vehicle.year}</span>
              </div>
            </div>

            {/* Rating badge */}
            {averageRating !== null && averageRating > 0 && (
              <div className='absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm z-10'>
                <Star className='size-4 fill-yellow-400 text-yellow-400' />
                <span className='text-white font-semibold'>{averageRating.toFixed(1)}</span>
                <span className='text-white/70 text-sm'>({reviewCount})</span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className='p-4 space-y-4'>
            {/* Title & Brand/Model */}
            <div>
              <h3 className='font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors'>{title}</h3>
              <p className='text-sm text-muted-foreground mt-0.5'>
                {vehicle.model.brand.name} {vehicle.model.name}
              </p>
            </div>

            {/* Specs Grid */}
            <div className='grid grid-cols-4 gap-2'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors'>
                    <Users className='size-4 text-primary' />
                    <span className='text-xs font-medium'>{vehicle.seats}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{vehicle.seats} Seats</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors'>
                    <Cog className='size-4 text-primary' />
                    <span className='text-xs font-medium'>{formatEnumValue(vehicle.transmissionType).slice(0, 4)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{formatEnumValue(vehicle.transmissionType)}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors'>
                    <Fuel className='size-4 text-primary' />
                    <span className='text-xs font-medium'>{formatEnumValue(vehicle.fuelType).slice(0, 4)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{formatEnumValue(vehicle.fuelType)}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors'>
                    <Gauge className='size-4 text-primary' />
                    <span className='text-xs font-medium'>{formatEnumValue(vehicle.bodyType).slice(0, 4)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{formatEnumValue(vehicle.bodyType)}</TooltipContent>
              </Tooltip>
            </div>

            {/* Divider */}
            <div className='h-px bg-border' />

            {/* Bottom section: Provider & Price */}
            <div className='flex items-center justify-between'>
              {/* Provider */}
              <div className='flex items-center gap-2'>
                <div className='size-8 rounded-full bg-primary/10 flex items-center justify-center'>
                  <Building2 className='size-4 text-primary' />
                </div>
                <div className='flex flex-col'>
                  <span className='text-xs text-muted-foreground'>Provided by</span>
                  <span className='text-sm font-medium truncate max-w-[120px]'>{organization.name}</span>
                </div>
              </div>

              {/* Price */}
              <div className='text-right'>
                <div className='flex items-baseline gap-1'>
                  <span className='text-2xl font-bold text-primary'>
                    {formatCurrency(pricing.pricePerDay, pricing.currency)}
                  </span>
                </div>
                <span className='text-xs text-muted-foreground'>per day</span>
              </div>
            </div>

            {/* Quick action hint */}
            <div className='flex items-center justify-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity'>
              <div className='flex items-center gap-1.5 text-xs text-primary font-medium'>
                <CheckCircle2 className='size-3.5' />
                Click to view details & book
              </div>
            </div>
          </div>
        </Link>
      </Card>
    </TooltipProvider>
  );
}
