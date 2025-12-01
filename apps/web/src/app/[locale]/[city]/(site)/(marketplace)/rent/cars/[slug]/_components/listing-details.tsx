'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatEnumValue, cn } from '@/lib/utils';
import {
  Car,
  Star,
  MapPin,
  Shield,
  Clock,
  Gauge,
  Building2,
  Phone,
  Mail,
  CalendarCheck,
  Info,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  User,
} from 'lucide-react';
import { Link } from '@/lib/navigation/navigation-client';
import { Skeleton } from '@/components/ui/skeleton';
import ImageGallery, { MediaItem } from './image-gallery';
import BookingCard from './booking-card';
import VehicleSpecs from './vehicle-specs';

interface ListingDetailsProps {
  slug: string;
}

export default function ListingDetails({ slug }: ListingDetailsProps) {
  const {
    data: listing,
    isLoading,
    error,
  } = useQuery(
    orpc.listings.getPublic.queryOptions({
      input: { slug },
    })
  );

  if (isLoading) {
    return <ListingDetailsSkeleton />;
  }

  if (error || !listing) {
    return (
      <div className='container mx-auto px-4 py-16 text-center'>
        <div className='max-w-md mx-auto'>
          <div className='size-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center'>
            <Car className='size-10 text-muted-foreground' />
          </div>
          <h2 className='text-2xl font-bold mb-2'>Listing Not Found</h2>
          <p className='text-muted-foreground mb-6'>
            The vehicle you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href='/rent/cars'>
              <ArrowLeft className='size-4 mr-2' />
              Browse All Vehicles
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-b from-muted/30 to-background'>
      <div className='container mx-auto px-4 py-8'>
        {/* Breadcrumb */}
        <nav className='flex items-center gap-2 text-sm text-muted-foreground mb-6'>
          <Link href='/rent/cars' className='hover:text-primary transition-colors'>
            Cars
          </Link>
          <span>/</span>
          <span className='text-foreground'>{listing.title}</span>
        </nav>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Main Content */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Image Gallery */}
            <ImageGallery
              media={listing.media.filter((m) => m.type === 'IMAGE' || m.type === 'VIDEO') as MediaItem[]}
              title={listing.title}
              isFeatured={listing.isFeatured}
              hasInstantBooking={listing.bookingDetails.hasInstantBooking}
            />

            {/* Vehicle Specs */}
            <VehicleSpecs vehicle={listing.vehicle} title={listing.title} />

            {/* Description */}
            {listing.description && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Info className='size-5' />
                    About This Vehicle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground whitespace-pre-wrap leading-relaxed'>{listing.description}</p>
                  {listing.tags.length > 0 && (
                    <div className='flex flex-wrap gap-2 mt-4'>
                      {listing.tags.map((tag) => (
                        <Badge key={tag} variant='secondary'>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Booking Rules */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <CalendarCheck className='size-5' />
                  Booking Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-6'>
                  <BookingRule
                    icon={User}
                    label='Driver Age'
                    value={`${listing.bookingDetails.minAge}-${listing.bookingDetails.maxAge} years`}
                  />
                  <BookingRule
                    icon={CalendarCheck}
                    label='Min. Rental'
                    value={`${listing.bookingDetails.minRentalDays} day(s)`}
                  />
                  {listing.bookingDetails.maxRentalDays && (
                    <BookingRule
                      icon={CalendarCheck}
                      label='Max. Rental'
                      value={`${listing.bookingDetails.maxRentalDays} days`}
                    />
                  )}
                  {listing.bookingDetails.maxMileagePerDay && (
                    <BookingRule
                      icon={Gauge}
                      label='Daily Mileage'
                      value={`${listing.bookingDetails.maxMileagePerDay} ${listing.bookingDetails.mileageUnit}`}
                    />
                  )}
                  {listing.bookingDetails.minNoticeHours && (
                    <BookingRule
                      icon={Clock}
                      label='Advance Notice'
                      value={`${listing.bookingDetails.minNoticeHours} hours`}
                    />
                  )}
                </div>

                <Separator />

                <div className='flex flex-wrap gap-4'>
                  <div className='flex items-center gap-2 text-sm'>
                    <Shield className='size-4 text-muted-foreground' />
                    <span className='text-muted-foreground'>Cancellation Policy:</span>
                    <Badge variant='outline'>{formatEnumValue(listing.pricing.cancellationPolicy)}</Badge>
                  </div>

                  {listing.pricing.securityDepositRequired && (
                    <div className='flex items-center gap-2 text-sm'>
                      <AlertTriangle className='size-4 text-amber-500' />
                      <span className='text-muted-foreground'>Security deposit required</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Host Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Building2 className='size-5' />
                  About the Host
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-start gap-4'>
                  <Avatar className='size-16 border-2 border-primary/20'>
                    <AvatarImage src={listing.organization.logo || undefined} />
                    <AvatarFallback className='bg-primary/10 text-primary text-xl'>
                      <Building2 className='size-6' />
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-lg'>{listing.organization.name}</h3>
                    {listing.organization.city && (
                      <p className='text-sm text-muted-foreground flex items-center gap-1 mt-1'>
                        <MapPin className='size-3.5' />
                        {listing.organization.city.name}, {listing.organization.city.country.name}
                      </p>
                    )}
                    {listing.organization.address && (
                      <p className='text-sm text-muted-foreground mt-1'>{listing.organization.address}</p>
                    )}
                  </div>
                </div>

                {(listing.organization.phoneNumber || listing.organization.email) && (
                  <div className='mt-4 pt-4 border-t flex flex-wrap gap-4'>
                    {listing.organization.phoneNumber && (
                      <a
                        href={`tel:${listing.organization.phoneNumber}`}
                        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors'
                      >
                        <Phone className='size-4 text-primary' />
                        <span className='text-sm font-medium'>{listing.organization.phoneNumber}</span>
                      </a>
                    )}
                    {listing.organization.email && (
                      <a
                        href={`mailto:${listing.organization.email}`}
                        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors'
                      >
                        <Mail className='size-4 text-primary' />
                        <span className='text-sm font-medium'>{listing.organization.email}</span>
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className='lg:col-span-1'>
            <div className='sticky top-4'>
              <BookingCard
                listingSlug={listing.slug}
                pricing={listing.pricing}
                bookingDetails={listing.bookingDetails}
                averageRating={listing.averageRating}
                reviewCount={listing.reviewCount}
                location={listing.location}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for booking rules
function BookingRule({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className='flex items-center gap-3'>
      <div className='size-10 rounded-lg bg-muted flex items-center justify-center'>
        <Icon className='size-5 text-muted-foreground' />
      </div>
      <div>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p className='font-medium'>{value}</p>
      </div>
    </div>
  );
}

// Loading skeleton
function ListingDetailsSkeleton() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-muted/30 to-background'>
      <div className='container mx-auto px-4 py-8'>
        <Skeleton className='h-4 w-48 mb-6' />

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-8'>
            {/* Image skeleton */}
            <Skeleton className='aspect-[16/9] rounded-2xl' />

            {/* Thumbnails skeleton */}
            <div className='flex gap-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='w-24 h-16 rounded-lg' />
              ))}
            </div>

            {/* Title skeleton */}
            <div className='space-y-4'>
              <Skeleton className='h-10 w-3/4' />
              <Skeleton className='h-6 w-1/2' />
              <div className='flex gap-2'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className='h-8 w-24 rounded-full' />
                ))}
              </div>
            </div>

            {/* Specs skeleton */}
            <div className='border rounded-xl p-6'>
              <div className='grid grid-cols-4 gap-6'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-3'>
                    <Skeleton className='size-12 rounded-xl' />
                    <div className='space-y-2'>
                      <Skeleton className='h-3 w-12' />
                      <Skeleton className='h-5 w-16' />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description skeleton */}
            <div className='border rounded-xl p-6 space-y-3'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          </div>

          <div className='lg:col-span-1'>
            <div className='border rounded-xl p-6 space-y-4'>
              <Skeleton className='h-12 w-32' />
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-14 w-full' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
