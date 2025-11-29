'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsBoolean, parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Filter, X, Car, Zap, DollarSign, Users, ChevronDown, ChevronUp, Star, Calendar } from 'lucide-react';
import {
  VehicleClassSchema,
  VehicleBodyTypeSchema,
  VehicleFuelTypeSchema,
  VehicleTransmissionTypeSchema,
} from '@yayago-app/db/enums';
import { formatEnumValue } from '@/lib/utils';
import { useState } from 'react';

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, icon, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className='border-b last:border-b-0 pb-4 last:pb-0'>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors'
      >
        <span className='flex items-center gap-2'>
          {icon}
          {title}
        </span>
        {isOpen ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
      </button>
      {isOpen && <div className='space-y-4 pt-2'>{children}</div>}
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
  const [isFeatured, setIsFeatured] = useQueryState('isFeatured', parseAsBoolean);
  const [, setPage] = useQueryState('page', parseAsInteger);

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
      setIsFeatured(null),
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
    isFeatured;

  return (
    <Card className={className}>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Filter className='size-4' />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant='ghost' size='sm' onClick={clearFilters}>
              <X className='size-3 mr-1' />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Vehicle Type */}
        <FilterSection title='Vehicle Type' icon={<Car className='size-4' />}>
          <div className='space-y-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>Brand</Label>
              <Select value={brandSlug || 'any'} onValueChange={handleSelectChange(setBrandSlug)}>
                <SelectTrigger>
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
                  <SelectTrigger>
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
                <SelectTrigger>
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
                <SelectTrigger>
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
                <SelectTrigger>
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
                <SelectTrigger>
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
        <FilterSection title='Price Range' icon={<DollarSign className='size-4' />}>
          <div className='space-y-4'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>AED {localPriceRange[0]}</span>
              <span className='text-muted-foreground'>
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
            <p className='text-xs text-muted-foreground'>Per day</p>
          </div>
        </FilterSection>

        {/* Year Range */}
        <FilterSection title='Model Year' icon={<Calendar className='size-4' />} defaultOpen={false}>
          <div className='space-y-4'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>{localYearRange[0]}</span>
              <span className='text-muted-foreground'>{localYearRange[1]}</span>
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
        <FilterSection title='Specs' icon={<Users className='size-4' />} defaultOpen={false}>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between text-sm mb-2'>
                <Label className='text-xs text-muted-foreground'>Seats</Label>
                <span className='text-muted-foreground text-xs'>
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

            <div>
              <div className='flex justify-between text-sm mb-2'>
                <Label className='text-xs text-muted-foreground'>Doors</Label>
                <span className='text-muted-foreground text-xs'>
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
        <FilterSection title='Booking Options' icon={<Zap className='size-4' />}>
          <div className='space-y-3'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='instantBooking'
                checked={hasInstantBooking ?? false}
                onCheckedChange={handleCheckboxChange(setHasInstantBooking)}
              />
              <Label htmlFor='instantBooking' className='text-sm cursor-pointer'>
                Instant booking
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='noDeposit'
                checked={hasNoDeposit ?? false}
                onCheckedChange={handleCheckboxChange(setHasNoDeposit)}
              />
              <Label htmlFor='noDeposit' className='text-sm cursor-pointer'>
                No deposit required
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='freeCancellation'
                checked={hasFreeCancellation ?? false}
                onCheckedChange={handleCheckboxChange(setHasFreeCancellation)}
              />
              <Label htmlFor='freeCancellation' className='text-sm cursor-pointer'>
                Free cancellation
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='featured'
                checked={isFeatured ?? false}
                onCheckedChange={handleCheckboxChange(setIsFeatured)}
              />
              <Label htmlFor='featured' className='text-sm cursor-pointer flex items-center gap-1'>
                <Star className='size-3 text-yellow-500' />
                Featured only
              </Label>
            </div>
          </div>
        </FilterSection>

        <Separator />

        {onApply && (
          <Button className='w-full' onClick={onApply}>
            Apply Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export { FilterSection, PRICE_RANGE, YEAR_RANGE, SEATS_RANGE, DOORS_RANGE };
