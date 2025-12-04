'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsBoolean, parseAsInteger, parseAsString, parseAsIsoDate, parseAsFloat, useQueryState } from 'nuqs';
import { orpc } from '@/utils/orpc';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Filter,
  X,
  Car,
  Zap,
  DollarSign,
  Users,
  ChevronDown,
  ChevronUp,
  Star,
  Calendar,
  MapPin,
  Navigation,
  Truck,
  CalendarDays,
  Search,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the location picker to avoid SSR issues
const LocationPicker = dynamic(() => import('@/components/maps/location-picker'), {
  ssr: false,
  loading: () => <div className='h-[350px] w-full animate-pulse bg-muted rounded-xl' />,
});
import {
  VehicleClassSchema,
  VehicleBodyTypeSchema,
  VehicleFuelTypeSchema,
  VehicleTransmissionTypeSchema,
} from '@yayago-app/db/enums';
import { formatEnumValue, cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, icon, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className='pb-5'>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full py-2 text-sm font-semibold hover:text-primary transition-colors'
      >
        <span className='flex items-center gap-2.5'>
          <span className='flex items-center justify-center w-7 h-7 rounded-lg bg-muted'>
            {icon}
          </span>
          {title}
        </span>
        <span className='flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted transition-colors'>
          {isOpen ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
        </span>
      </button>
      <div className={cn('space-y-3 pt-3 transition-all', isOpen ? 'block' : 'hidden')}>
        {children}
      </div>
    </div>
  );
}

const PRICE_RANGE = { min: 0, max: 5000 };
const YEAR_RANGE = { min: 2010, max: new Date().getFullYear() + 1 };
const SEATS_RANGE = { min: 2, max: 12 };
const DOORS_RANGE = { min: 2, max: 5 };

interface ListingsFiltersProps {
  className?: string;
  onApply?: () => void;
}

export default function ListingsFilters({ className, onApply }: ListingsFiltersProps) {
  // Use nuqs for URL state management
  const [vehicleClass, setVehicleClass] = useQueryState('vehicleClass', parseAsString);
  const [bodyType, setBodyType] = useQueryState('bodyType', parseAsString);
  const [fuelType, setFuelType] = useQueryState('fuelType', parseAsString);
  const [transmissionType, setTransmissionType] = useQueryState('transmissionType', parseAsString);
  const [brandSlug, setBrandSlug] = useQueryState('brandSlug', parseAsString);
  const [modelSlug, setModelSlug] = useQueryState('modelSlug', parseAsString);
  const [minSeats, setMinSeats] = useQueryState('minSeats', parseAsInteger);
  const [maxSeats, setMaxSeats] = useQueryState('maxSeats', parseAsInteger);
  const [minDoors, setMinDoors] = useQueryState('minDoors', parseAsInteger);
  const [maxDoors, setMaxDoors] = useQueryState('maxDoors', parseAsInteger);
  const [minYear, setMinYear] = useQueryState('minYear', parseAsInteger);
  const [maxYear, setMaxYear] = useQueryState('maxYear', parseAsInteger);
  const [minPrice, setMinPrice] = useQueryState('minPrice', parseAsInteger);
  const [maxPrice, setMaxPrice] = useQueryState('maxPrice', parseAsInteger);
  const [hasInstantBooking, setHasInstantBooking] = useQueryState('hasInstantBooking', parseAsBoolean);
  const [hasNoDeposit, setHasNoDeposit] = useQueryState('hasNoDeposit', parseAsBoolean);
  const [hasFreeCancellation, setHasFreeCancellation] = useQueryState('hasFreeCancellation', parseAsBoolean);
  const [hasDelivery, setHasDelivery] = useQueryState('hasDelivery', parseAsBoolean);
  const [isFeatured, setIsFeatured] = useQueryState('isFeatured', parseAsBoolean);
  const [, setPage] = useQueryState('page', parseAsInteger);

  // Date filters - using same param names as home hero for consistency
  const [pickupDate, setPickupDate] = useQueryState('pickup_date', parseAsIsoDate);
  const [dropoffDate, setDropoffDate] = useQueryState('dropoff_date', parseAsIsoDate);

  // Location filters - using same param names as home hero
  const [locationName, setLocationName] = useQueryState('location', parseAsString);
  const [lat, setLat] = useQueryState('lat', parseAsFloat);
  const [lng, setLng] = useQueryState('lng', parseAsFloat);
  const [radius, setRadius] = useQueryState('radius', parseAsInteger);

  // Local state
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Local state for sliders (to avoid too many URL updates while dragging)
  const [localPriceRange, setLocalPriceRange] = useState([minPrice ?? PRICE_RANGE.min, maxPrice ?? PRICE_RANGE.max]);
  const [localYearRange, setLocalYearRange] = useState([minYear ?? YEAR_RANGE.min, maxYear ?? YEAR_RANGE.max]);
  const [localSeatsRange, setLocalSeatsRange] = useState([minSeats ?? SEATS_RANGE.min, maxSeats ?? SEATS_RANGE.max]);
  const [localDoorsRange, setLocalDoorsRange] = useState([minDoors ?? DOORS_RANGE.min, maxDoors ?? DOORS_RANGE.max]);

  // Sync local state with URL state
  useEffect(() => {
    setLocalPriceRange([minPrice ?? PRICE_RANGE.min, maxPrice ?? PRICE_RANGE.max]);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    setLocalYearRange([minYear ?? YEAR_RANGE.min, maxYear ?? YEAR_RANGE.max]);
  }, [minYear, maxYear]);

  useEffect(() => {
    setLocalSeatsRange([minSeats ?? SEATS_RANGE.min, maxSeats ?? SEATS_RANGE.max]);
  }, [minSeats, maxSeats]);

  useEffect(() => {
    setLocalDoorsRange([minDoors ?? DOORS_RANGE.min, maxDoors ?? DOORS_RANGE.max]);
  }, [minDoors, maxDoors]);

  // Fetch brands
  const { data: brandsData } = useQuery(
    orpc.vehicleBrands.list.queryOptions({
      input: { page: 1, take: 100 },
    })
  );

  // Fetch models when brand is selected
  const { data: modelsData } = useQuery(
    orpc.vehicleModels.list.queryOptions({
      input: { page: 1, take: 100, brandSlug: brandSlug || undefined },
    })
  );

  // Reset model when brand changes
  useEffect(() => {
    if (!brandSlug) {
      setModelSlug(null);
    }
  }, [brandSlug, setModelSlug]);

  const handleSelectChange = (setter: (value: string | null) => void) => (value: string) => {
    setter(value === 'any' ? null : value);
    setPage(null); // Reset pagination
  };

  const handlePriceCommit = (values: number[]) => {
    setMinPrice(values[0] > PRICE_RANGE.min ? values[0] : null);
    setMaxPrice(values[1] < PRICE_RANGE.max ? values[1] : null);
    setPage(null);
  };

  const handleYearCommit = (values: number[]) => {
    setMinYear(values[0] > YEAR_RANGE.min ? values[0] : null);
    setMaxYear(values[1] < YEAR_RANGE.max ? values[1] : null);
    setPage(null);
  };

  const handleSeatsCommit = (values: number[]) => {
    setMinSeats(values[0] > SEATS_RANGE.min ? values[0] : null);
    setMaxSeats(values[1] < SEATS_RANGE.max ? values[1] : null);
    setPage(null);
  };

  const handleDoorsCommit = (values: number[]) => {
    setMinDoors(values[0] > DOORS_RANGE.min ? values[0] : null);
    setMaxDoors(values[1] < DOORS_RANGE.max ? values[1] : null);
    setPage(null);
  };

  const handleCheckboxChange = (setter: (value: boolean | null) => void) => (checked: boolean | 'indeterminate') => {
    setter(checked === true ? true : null);
    setPage(null);
  };

  // Get user's current location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        setLocationName('Current location');
        if (!radius) setRadius(20); // Default 20km radius
        setIsGettingLocation(false);
        setPage(null);
      },
      () => {
        setIsGettingLocation(false);
      }
    );
  };

  const clearLocation = async () => {
    await Promise.all([setLat(null), setLng(null), setRadius(null), setLocationName(null)]);
    setPage(null);
  };

  const clearFilters = async () => {
    await Promise.all([
      setVehicleClass(null),
      setBodyType(null),
      setFuelType(null),
      setTransmissionType(null),
      setBrandSlug(null),
      setModelSlug(null),
      setMinSeats(null),
      setMaxSeats(null),
      setMinDoors(null),
      setMaxDoors(null),
      setMinYear(null),
      setMaxYear(null),
      setMinPrice(null),
      setMaxPrice(null),
      setHasInstantBooking(null),
      setHasNoDeposit(null),
      setHasFreeCancellation(null),
      setHasDelivery(null),
      setIsFeatured(null),
      setPickupDate(null),
      setDropoffDate(null),
      setLat(null),
      setLng(null),
      setRadius(null),
      setLocationName(null),
      setPage(null),
    ]);
    setLocalPriceRange([PRICE_RANGE.min, PRICE_RANGE.max]);
    setLocalYearRange([YEAR_RANGE.min, YEAR_RANGE.max]);
    setLocalSeatsRange([SEATS_RANGE.min, SEATS_RANGE.max]);
    setLocalDoorsRange([DOORS_RANGE.min, DOORS_RANGE.max]);
    onApply?.();
  };

  const hasActiveFilters =
    vehicleClass ||
    bodyType ||
    fuelType ||
    transmissionType ||
    brandSlug ||
    modelSlug ||
    minSeats ||
    maxSeats ||
    minDoors ||
    maxDoors ||
    minYear ||
    maxYear ||
    minPrice ||
    maxPrice ||
    hasInstantBooking ||
    hasNoDeposit ||
    hasFreeCancellation ||
    hasDelivery ||
    isFeatured ||
    pickupDate ||
    dropoffDate ||
    lat ||
    lng;

  const activeFilterCount = [
    vehicleClass,
    bodyType,
    fuelType,
    transmissionType,
    brandSlug,
    hasInstantBooking,
    hasNoDeposit,
    hasFreeCancellation,
    hasDelivery,
    isFeatured,
    pickupDate,
    lat,
    minPrice || maxPrice,
    minYear || maxYear,
  ].filter(Boolean).length;

  return (
    <div className={cn('bg-card rounded-2xl border shadow-sm', className)}>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-2.5'>
          <div className='flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10'>
            <SlidersHorizontal className='size-4 text-primary' />
          </div>
          <div>
            <h3 className='font-semibold'>Filters</h3>
            {activeFilterCount > 0 && (
              <p className='text-xs text-muted-foreground'>{activeFilterCount} active</p>
            )}
          </div>
        </div>
        {hasActiveFilters && (
          <Button variant='ghost' size='sm' onClick={clearFilters} className='text-muted-foreground hover:text-foreground'>
            <X className='size-3.5 mr-1' />
            Clear all
          </Button>
        )}
      </div>

      <div className='p-4 space-y-1'>
        {/* Rental Dates */}
        <FilterSection title='Rental Dates' icon={<CalendarDays className='size-4 text-muted-foreground' />}>
          <div className='grid grid-cols-2 gap-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>Pick-up</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full h-10 justify-start text-left font-normal text-sm',
                      !pickupDate && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className='mr-2 size-3.5' />
                    {pickupDate ? format(pickupDate, 'MMM d') : 'Select'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <CalendarComponent
                    mode='single'
                    selected={pickupDate || undefined}
                    onSelect={(date) => {
                      setPickupDate(date || null);
                      setPage(null);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>Drop-off</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full h-10 justify-start text-left font-normal text-sm',
                      !dropoffDate && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className='mr-2 size-3.5' />
                    {dropoffDate ? format(dropoffDate, 'MMM d') : 'Select'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <CalendarComponent
                    mode='single'
                    selected={dropoffDate || undefined}
                    onSelect={(date) => {
                      setDropoffDate(date || null);
                      setPage(null);
                    }}
                    disabled={(date) => date < (pickupDate || new Date()) || date < addDays(pickupDate || new Date(), 1)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {pickupDate && dropoffDate && (
            <div className='flex items-center justify-center px-3 py-2 rounded-lg bg-primary/5 text-sm'>
              <span className='font-medium text-primary'>
                {Math.ceil((dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          )}
        </FilterSection>

        {/* Location */}
        <FilterSection title='Location' icon={<MapPin className='size-4 text-muted-foreground' />}>
          <div className='space-y-2'>
            {/* Current location display */}
            {lat && lng && locationName && (
              <div className='flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20'>
                <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0'>
                  <MapPin className='size-4 text-primary' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>{locationName}</p>
                  <p className='text-xs text-muted-foreground'>{radius || 20} km radius</p>
                </div>
                <Button variant='ghost' size='icon' className='h-7 w-7 shrink-0' onClick={clearLocation}>
                  <X className='size-3.5' />
                </Button>
              </div>
            )}

            {!lat && (
              <>
                {/* Use my location button */}
                <Button
                  variant='outline'
                  className='w-full h-10 justify-start'
                  onClick={handleUseMyLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <Loader2 className='size-4 mr-2 animate-spin' />
                  ) : (
                    <Navigation className='size-4 mr-2' />
                  )}
                  {isGettingLocation ? 'Getting location...' : 'Use current location'}
                </Button>

                {/* Pick on map sheet */}
                <Button
                  variant='outline'
                  className='w-full h-10 justify-start'
                  onClick={() => setShowLocationPicker(true)}
                >
                  <Search className='size-4 mr-2' />
                  Search or pick on map
                </Button>
              </>
            )}

            {lat && lng && (
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <Label className='text-xs text-muted-foreground'>Search radius</Label>
                  <span className='text-xs font-medium'>{radius || 20} km</span>
                </div>
                <Slider
                  min={5}
                  max={100}
                  step={5}
                  value={[radius || 20]}
                  onValueChange={(values) => {
                    setRadius(values[0]);
                    setPage(null);
                  }}
                />
              </div>
            )}
          </div>
        </FilterSection>

        {/* Vehicle Type */}
        <FilterSection title='Vehicle Type' icon={<Car className='size-4 text-muted-foreground' />}>
          <div className='space-y-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>Brand</Label>
              <Select value={brandSlug || 'any'} onValueChange={handleSelectChange(setBrandSlug)}>
                <SelectTrigger className='w-full h-10'>
                  <SelectValue placeholder='Any brand' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='any'>Any brand</SelectItem>
                  {brandsData?.items.map((brand) => (
                    <SelectItem key={brand.slug} value={brand.slug}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {brandSlug && (
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>Model</Label>
                <Select value={modelSlug || 'any'} onValueChange={handleSelectChange(setModelSlug)}>
                  <SelectTrigger className='w-full h-10'>
                    <SelectValue placeholder='Any model' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='any'>Any model</SelectItem>
                    {modelsData?.items.map((model) => (
                      <SelectItem key={model.slug} value={model.slug}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>Class</Label>
              <Select value={vehicleClass || 'any'} onValueChange={handleSelectChange(setVehicleClass)}>
                <SelectTrigger className='w-full h-10'>
                  <SelectValue placeholder='Any class' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='any'>Any class</SelectItem>
                  {VehicleClassSchema.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {formatEnumValue(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>Body Type</Label>
              <Select value={bodyType || 'any'} onValueChange={handleSelectChange(setBodyType)}>
                <SelectTrigger className='w-full h-10'>
                  <SelectValue placeholder='Any body type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='any'>Any body type</SelectItem>
                  {VehicleBodyTypeSchema.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {formatEnumValue(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>Fuel Type</Label>
              <Select value={fuelType || 'any'} onValueChange={handleSelectChange(setFuelType)}>
                <SelectTrigger className='w-full h-10'>
                  <SelectValue placeholder='Any fuel type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='any'>Any fuel type</SelectItem>
                  {VehicleFuelTypeSchema.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {formatEnumValue(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>Transmission</Label>
              <Select value={transmissionType || 'any'} onValueChange={handleSelectChange(setTransmissionType)}>
                <SelectTrigger className='w-full h-10'>
                  <SelectValue placeholder='Any transmission' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='any'>Any transmission</SelectItem>
                  {VehicleTransmissionTypeSchema.options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {formatEnumValue(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title='Price Range' icon={<DollarSign className='size-4 text-muted-foreground' />}>
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium'>AED {localPriceRange[0]}</span>
              <span className='text-sm font-medium'>
                AED {localPriceRange[1] === PRICE_RANGE.max ? `${PRICE_RANGE.max}+` : localPriceRange[1]}
              </span>
            </div>
            <Slider
              min={PRICE_RANGE.min}
              max={PRICE_RANGE.max}
              step={50}
              value={localPriceRange}
              onValueChange={setLocalPriceRange}
              onValueCommit={handlePriceCommit}
            />
            <p className='text-xs text-muted-foreground text-center'>Per day</p>
          </div>
        </FilterSection>

        {/* Year Range */}
        <FilterSection title='Model Year' icon={<Calendar className='size-4 text-muted-foreground' />} defaultOpen={false}>
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium'>{localYearRange[0]}</span>
              <span className='text-sm font-medium'>{localYearRange[1]}</span>
            </div>
            <Slider
              min={YEAR_RANGE.min}
              max={YEAR_RANGE.max}
              step={1}
              value={localYearRange}
              onValueChange={setLocalYearRange}
              onValueCommit={handleYearCommit}
            />
          </div>
        </FilterSection>

        {/* Specs */}
        <FilterSection title='Specs' icon={<Users className='size-4 text-muted-foreground' />} defaultOpen={false}>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <Label className='text-xs text-muted-foreground'>Seats</Label>
                <span className='text-xs font-medium'>
                  {localSeatsRange[0]} - {localSeatsRange[1]}
                </span>
              </div>
              <Slider
                min={SEATS_RANGE.min}
                max={SEATS_RANGE.max}
                step={1}
                value={localSeatsRange}
                onValueChange={setLocalSeatsRange}
                onValueCommit={handleSeatsCommit}
              />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <Label className='text-xs text-muted-foreground'>Doors</Label>
                <span className='text-xs font-medium'>
                  {localDoorsRange[0]} - {localDoorsRange[1]}
                </span>
              </div>
              <Slider
                min={DOORS_RANGE.min}
                max={DOORS_RANGE.max}
                step={1}
                value={localDoorsRange}
                onValueChange={setLocalDoorsRange}
                onValueCommit={handleDoorsCommit}
              />
            </div>
          </div>
        </FilterSection>

        {/* Booking Options */}
        <FilterSection title='Booking Options' icon={<Zap className='size-4 text-muted-foreground' />}>
          <div className='space-y-2'>
            <label className='flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors'>
              <Checkbox
                id='instantBooking'
                checked={hasInstantBooking ?? false}
                onCheckedChange={handleCheckboxChange(setHasInstantBooking)}
              />
              <span className='text-sm'>Instant booking</span>
            </label>

            <label className='flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors'>
              <Checkbox
                id='noDeposit'
                checked={hasNoDeposit ?? false}
                onCheckedChange={handleCheckboxChange(setHasNoDeposit)}
              />
              <span className='text-sm'>No deposit required</span>
            </label>

            <label className='flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors'>
              <Checkbox
                id='freeCancellation'
                checked={hasFreeCancellation ?? false}
                onCheckedChange={handleCheckboxChange(setHasFreeCancellation)}
              />
              <span className='text-sm'>Free cancellation</span>
            </label>

            <label className='flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors'>
              <Checkbox
                id='hasDelivery'
                checked={hasDelivery ?? false}
                onCheckedChange={handleCheckboxChange(setHasDelivery)}
              />
              <div className='flex items-center gap-1.5'>
                <Truck className='size-3.5 text-muted-foreground' />
                <span className='text-sm'>Delivery available</span>
              </div>
            </label>

            <label className='flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors'>
              <Checkbox
                id='featured'
                checked={isFeatured ?? false}
                onCheckedChange={handleCheckboxChange(setIsFeatured)}
              />
              <div className='flex items-center gap-1.5'>
                <Star className='size-3.5 text-yellow-500 fill-yellow-500' />
                <span className='text-sm'>Featured only</span>
              </div>
            </label>
          </div>
        </FilterSection>

        {onApply && (
          <div className='pt-2'>
            <Button className='w-full h-11' onClick={onApply}>
              <Filter className='size-4 mr-2' />
              Apply Filters
            </Button>
          </div>
        )}
      </div>

      {/* Location Picker Sheet */}
      <Sheet open={showLocationPicker} onOpenChange={setShowLocationPicker}>
        <SheetContent side='bottom' className='h-[80vh] sm:h-[85vh] rounded-t-3xl px-0 flex flex-col'>
          <SheetHeader className='px-4 sm:px-6 pb-2 sm:pb-4 shrink-0'>
            <SheetTitle>Choose a location</SheetTitle>
          </SheetHeader>
          
          <div className='flex-1 px-4 sm:px-6 min-h-0'>
            <LocationPicker
              initialLocation={lat && lng ? { lat, lng } : undefined}
              onLocationSelect={(loc) => {
                setLat(loc.lat);
                setLng(loc.lng);
                setLocationName(loc.address || 'Selected location');
                if (!radius) setRadius(20);
                setPage(null);
                setShowLocationPicker(false);
              }}
              height='100%'
              placeholder='Search for a location...'
              showCurrentLocation
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export { FilterSection, PRICE_RANGE, YEAR_RANGE, SEATS_RANGE, DOORS_RANGE };
