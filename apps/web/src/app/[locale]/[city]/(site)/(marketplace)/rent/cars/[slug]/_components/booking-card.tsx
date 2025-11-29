'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
  Zap,
  Shield,
  Clock,
  Gauge,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Info,
  Star,
  Loader2,
} from 'lucide-react';
import { format, differenceInDays, addDays, isBefore } from 'date-fns';
import { orpc } from '@/utils/orpc';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

interface PricingData {
  currency: string;
  pricePerHour: number | null;
  pricePerDay: number;
  pricePerThreeDays: number | null;
  pricePerWeek: number | null;
  pricePerMonth: number | null;
  weekendPricePerDay: number | null;
  depositAmount: number | null;
  securityDepositRequired: boolean;
  securityDepositAmount: number | null;
  cancellationPolicy: string;
  taxRate: number | null;
}

interface BookingDetailsData {
  hasInstantBooking: boolean;
  minAge: number;
  maxAge: number;
  minRentalDays: number;
  maxRentalDays: number | null;
  mileageUnit: string;
  maxMileagePerDay: number | null;
  maxMileagePerRental: number | null;
  minNoticeHours: number | null;
}

interface BookingCardProps {
  listingSlug: string;
  pricing: PricingData;
  bookingDetails: BookingDetailsData;
  averageRating: number | null;
  reviewCount: number;
}

export default function BookingCard({
  listingSlug,
  pricing,
  bookingDetails,
  averageRating,
  reviewCount,
}: BookingCardProps) {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  const [startDate, setStartDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 4));
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  // Check availability using API
  const {
    data: availability,
    isLoading: isCheckingAvailability,
    refetch: recheckAvailability,
  } = useQuery({
    ...orpc.bookings.checkAvailability.queryOptions({
      input: {
        listingSlug,
        startDate: startDate!,
        endDate: endDate!,
      },
    }),
    enabled: !!startDate && !!endDate,
  });

  // Calculate price using API
  const {
    data: priceCalculation,
    isLoading: isCalculatingPrice,
  } = useQuery({
    ...orpc.bookings.calculatePrice.queryOptions({
      input: {
        listingSlug,
        startDate: startDate!,
        endDate: endDate!,
      },
    }),
    enabled: !!startDate && !!endDate && availability?.available,
  });

  // Create booking mutation
  const { mutate: createBooking, isPending: isCreatingBooking } = useMutation(
    orpc.bookings.create.mutationOptions({
      onSuccess: (data) => {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create booking');
      },
    })
  );

  // Recalculate when dates change
  useEffect(() => {
    if (startDate && endDate) {
      recheckAvailability();
    }
  }, [startDate, endDate, recheckAvailability]);

  const minDate = addDays(new Date(), Math.ceil((bookingDetails.minNoticeHours || 24) / 24));
  const days = startDate && endDate ? differenceInDays(endDate, startDate) : 0;
  const isValidBooking = availability?.available && days >= bookingDetails.minRentalDays;

  const handleBooking = () => {
    if (!session?.user) {
      // Redirect to login with callback
      const currentUrl = window.location.href;
      router.push(`/login?callback_url=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Please select dates');
      return;
    }

    if (!availability?.available) {
      toast.error(availability?.reason || 'Selected dates are not available');
      return;
    }

    // Create booking and get Stripe checkout URL
    createBooking({
      listingSlug,
      startDate,
      endDate,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      pickupType: 'MEET_AT_LOCATION',
      dropoffType: 'MEET_AT_LOCATION',
      successUrl: `${window.location.origin}/bookings/success`,
      cancelUrl: window.location.href,
    });
  };

  const isLoading = isCheckingAvailability || isCalculatingPrice || isCreatingBooking;

  return (
    <div className='space-y-4'>
      {/* Main Booking Card */}
      <Card className='shadow-xl border-2'>
        <CardHeader className='pb-4'>
          <div className='flex items-end justify-between'>
            <div>
              <div className='flex items-baseline gap-1'>
                <span className='text-4xl font-bold text-primary'>
                  {formatCurrency(pricing.pricePerDay, pricing.currency)}
                </span>
                <span className='text-muted-foreground text-lg'>/ day</span>
              </div>
              {pricing.weekendPricePerDay && pricing.weekendPricePerDay !== pricing.pricePerDay && (
                <p className='text-sm text-muted-foreground mt-1'>
                  Weekend: {formatCurrency(pricing.weekendPricePerDay, pricing.currency)}/day
                </p>
              )}
            </div>
            {averageRating !== null && averageRating > 0 && (
              <div className='flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full'>
                <Star className='size-4 fill-yellow-400 text-yellow-400' />
                <span className='font-semibold'>{averageRating.toFixed(1)}</span>
                <span className='text-muted-foreground text-sm'>({reviewCount})</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Date Selection */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Pick-up Date</label>
              <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal h-12',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 size-4 text-primary' />
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Select date'}
                    <ChevronDown className='ml-auto size-4 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      if (date && endDate && isBefore(endDate, addDays(date, bookingDetails.minRentalDays))) {
                        setEndDate(addDays(date, bookingDetails.minRentalDays));
                      }
                      setIsStartOpen(false);
                    }}
                    disabled={(date) => isBefore(date, minDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Return Date</label>
              <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal h-12',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 size-4 text-primary' />
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'Select date'}
                    <ChevronDown className='ml-auto size-4 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setIsEndOpen(false);
                    }}
                    disabled={(date) =>
                      isBefore(date, startDate ? addDays(startDate, bookingDetails.minRentalDays) : minDate)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Duration badge */}
          {days > 0 && (
            <div className='flex items-center justify-center'>
              <Badge variant='secondary' className='px-4 py-1.5 text-sm'>
                {days} {days === 1 ? 'day' : 'days'} rental
              </Badge>
            </div>
          )}

          {/* Availability Status */}
          {startDate && endDate && (
            <div>
              {isCheckingAvailability ? (
                <div className='flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg text-sm'>
                  <Loader2 className='size-4 animate-spin' />
                  <span>Checking availability...</span>
                </div>
              ) : availability && !availability.available ? (
                <Alert variant='destructive'>
                  <AlertCircle className='size-4' />
                  <AlertDescription>{availability.reason}</AlertDescription>
                </Alert>
              ) : availability?.available ? (
                <div className='flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm'>
                  <CheckCircle2 className='size-4 flex-shrink-0' />
                  <span>These dates are available!</span>
                </div>
              ) : null}
            </div>
          )}

          <Separator />

          {/* Price Breakdown - Use API data */}
          {priceCalculation && isValidBooking && (
            <div className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>
                  {formatCurrency(priceCalculation.dailyRate, priceCalculation.currency)} × {priceCalculation.totalDays}{' '}
                  days
                </span>
                <span className='font-medium'>{formatCurrency(priceCalculation.basePrice, priceCalculation.currency)}</span>
              </div>

              {priceCalculation.taxAmount > 0 && (
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Tax ({priceCalculation.taxRate}%)</span>
                  <span className='font-medium'>{formatCurrency(priceCalculation.taxAmount, priceCalculation.currency)}</span>
                </div>
              )}

              <Separator />

              <div className='flex justify-between'>
                <span className='font-semibold'>Rental Total</span>
                <span className='font-bold text-lg'>{formatCurrency(priceCalculation.totalPrice, priceCalculation.currency)}</span>
              </div>

              {priceCalculation.securityDeposit > 0 && (
                <>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground flex items-center gap-1'>
                      <Shield className='size-3.5' />
                      Security Deposit (refundable)
                    </span>
                    <span className='font-medium'>
                      {formatCurrency(priceCalculation.securityDeposit, priceCalculation.currency)}
                    </span>
                  </div>

                  <div className='flex justify-between pt-2 border-t'>
                    <span className='font-semibold'>Total Due at Checkout</span>
                    <span className='font-bold text-xl text-primary'>
                      {formatCurrency(priceCalculation.grandTotal, priceCalculation.currency)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Fallback local calculation if API hasn't loaded yet */}
          {!priceCalculation && days >= bookingDetails.minRentalDays && (
            <div className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>
                  {formatCurrency(pricing.pricePerDay, pricing.currency)} × {days} days
                </span>
                <span className='font-medium'>{formatCurrency(pricing.pricePerDay * days, pricing.currency)}</span>
              </div>
            </div>
          )}

          {/* Book Button */}
          <Button className='w-full h-14 text-lg font-semibold' size='lg' disabled={!isValidBooking || isLoading} onClick={handleBooking}>
            {isLoading ? (
              <>
                <Loader2 className='size-5 mr-2 animate-spin' />
                {isCreatingBooking ? 'Creating booking...' : 'Loading...'}
              </>
            ) : bookingDetails.hasInstantBooking ? (
              <>
                <Zap className='size-5 mr-2' />
                Book Instantly
              </>
            ) : (
              <>
                <CalendarIcon className='size-5 mr-2' />
                Request to Book
              </>
            )}
          </Button>

          <p className='text-xs text-center text-muted-foreground'>
            {!session?.user
              ? 'You need to sign in to book this vehicle'
              : bookingDetails.hasInstantBooking
                ? 'Your booking will be confirmed after payment'
                : 'The host will respond to your request within 24 hours'}
          </p>
        </CardContent>
      </Card>

      {/* Quick Info Card */}
      <Card>
        <CardContent className='py-4'>
          <div className='space-y-3'>
            <div className='flex items-center gap-3 text-sm'>
              <div className='size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
                <CheckCircle2 className='size-4 text-emerald-600' />
              </div>
              <div>
                <p className='font-medium'>Free Cancellation</p>
                <p className='text-xs text-muted-foreground'>
                  Policy: {pricing.cancellationPolicy.toLowerCase().replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            <Separator />

            <div className='flex items-center gap-3 text-sm'>
              <div className='size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
                <Clock className='size-4 text-blue-600' />
              </div>
              <div>
                <p className='font-medium'>Advance Notice</p>
                <p className='text-xs text-muted-foreground'>
                  Book at least {bookingDetails.minNoticeHours || 24} hours before pickup
                </p>
              </div>
            </div>

            {bookingDetails.maxMileagePerDay && (
              <>
                <Separator />
                <div className='flex items-center gap-3 text-sm'>
                  <div className='size-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center'>
                    <Gauge className='size-4 text-amber-600' />
                  </div>
                  <div>
                    <p className='font-medium'>Mileage Included</p>
                    <p className='text-xs text-muted-foreground'>
                      {bookingDetails.maxMileagePerDay} {bookingDetails.mileageUnit}/day included
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alternative Pricing */}
      {(pricing.pricePerWeek || pricing.pricePerMonth) && (
        <Card>
          <CardContent className='py-4'>
            <div className='flex items-center gap-2 mb-3'>
              <Info className='size-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Longer rentals, better rates</span>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              {pricing.pricePerWeek && (
                <div className='p-3 bg-muted/50 rounded-lg text-center'>
                  <p className='text-lg font-bold'>{formatCurrency(pricing.pricePerWeek, pricing.currency)}</p>
                  <p className='text-xs text-muted-foreground'>Weekly rate</p>
                </div>
              )}
              {pricing.pricePerMonth && (
                <div className='p-3 bg-muted/50 rounded-lg text-center'>
                  <p className='text-lg font-bold'>{formatCurrency(pricing.pricePerMonth, pricing.currency)}</p>
                  <p className='text-xs text-muted-foreground'>Monthly rate</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
