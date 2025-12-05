'use client';

import { Button } from '@/components/ui/button';
import DatePicker from '@/components/date-picker';
import { parseAsIsoDate, parseAsString, parseAsFloat, useQueryStates } from 'nuqs';
import { addDays, format } from 'date-fns';
import { Suspense, useState, useEffect } from 'react';
import { Loader2, Map, MapPin, Navigation, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import dynamic from 'next/dynamic';
import { useRouter } from '@/lib/navigation/navigation-client';

export default function HomeHero() {
  return (
    <Suspense fallback={<HeroSkeleton />}>
      <HeroContent />
    </Suspense>
  );
}

function HeroSkeleton() {
  return (
    <section className='relative min-h-[90vh] flex items-center justify-center'>
      <div className='absolute inset-0 bg-linear-to-br from-zinc-900 to-zinc-800' />
    </section>
  );
}

function HeroContent() {
  const router = useRouter();
  const today = new Date();

  const [params, setParams] = useQueryStates({
    location: parseAsString.withDefault(''),
    lat: parseAsFloat,
    lng: parseAsFloat,
    pickup_date: parseAsIsoDate,
    dropoff_date: parseAsIsoDate,
  });

  const handleSearch = () => {
    const searchParams = new URLSearchParams();

    if (params.location) searchParams.set('location', params.location);
    if (params.lat) searchParams.set('lat', params.lat.toString());
    if (params.lng) searchParams.set('lng', params.lng.toString());
    if (params.pickup_date) searchParams.set('pickup_date', format(params.pickup_date, 'yyyy-MM-dd'));
    if (params.dropoff_date) searchParams.set('dropoff_date', format(params.dropoff_date, 'yyyy-MM-dd'));

    router.push(`/rent/cars?${searchParams.toString()}`);
  };

  return (
    <section className='relative min-h-[90vh] flex items-center justify-center overflow-hidden'>
      {/* Background Image with Overlay */}
      <div className='absolute inset-0'>
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage: `url('/images/hero-car-image.png')`,
          }}
        />
        <div className='absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70' />
        {/* Animated gradient overlay */}
        <div
          className='absolute inset-0 bg-linear-to-r from-primary/20 via-transparent to-primary/10 animate-pulse'
          style={{ animationDuration: '4s' }}
        />
      </div>

      {/* Content */}
      <div className='relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20'>
        <div className='text-center mb-12'>
          {/* Badge */}
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6'>
            <Sparkles className='h-4 w-4' />
            <span>The future of car rental is here</span>
          </div>

          {/* Main Headline */}
          <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6'>
            Find your perfect
            <span className='block mt-2 bg-linear-to-r from-primary via-primary/80 to-yellow-400 bg-clip-text text-transparent'>
              drive
            </span>
          </h1>

          {/* Subtitle */}
          <p className='text-lg sm:text-xl text-white/80 max-w-2xl mx-auto'>
            Explore the best cars from top-rated hosts. Book instantly, drive freely.
          </p>
        </div>

        {/* Search Card */}
        <div className='max-w-4xl mx-auto'>
          <div className='bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 md:p-3'>
            <div className='grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 md:gap-0'>
              {/* Location Input */}
              <LocationSearchInput
                value={params.location}
                onChange={(location, lat, lng) => {
                  setParams({ location, lat, lng });
                }}
              />

              {/* Divider */}
              <div className='hidden md:flex items-center px-2'>
                <div className='h-8 w-px bg-border' />
              </div>

              {/* Date Pickers */}
              <div className='flex items-center gap-2'>
                <div className='flex-1 md:flex-none'>
                  <DatePicker
                    buttonClassName='w-full md:w-40 h-12 rounded-xl border-0 bg-muted/50 hover:bg-muted justify-start px-3'
                    disabled={params.dropoff_date ? { after: new Date(params.dropoff_date) } : { before: today }}
                    date={params.pickup_date ? new Date(params.pickup_date) : undefined}
                    placeholder='Pickup'
                    setDate={(date) => {
                      date?.setHours(10, 0, 0, 0);
                      setParams({ pickup_date: date ?? null });
                    }}
                  />
                </div>
                <div className='flex-1 md:flex-none'>
                  <DatePicker
                    buttonClassName='w-full md:w-40 h-12 rounded-xl border-0 bg-muted/50 hover:bg-muted justify-start px-3'
                    disabled={
                      params.pickup_date ? { before: addDays(params.pickup_date, 1) } : { before: addDays(today, 1) }
                    }
                    date={params.dropoff_date ? new Date(params.dropoff_date) : undefined}
                    placeholder='Dropoff'
                    defaultMonth={params.pickup_date ? new Date(params.pickup_date) : undefined}
                    setDate={(date) => {
                      date?.setHours(10, 0, 0, 0);
                      setParams({ dropoff_date: date ?? null });
                    }}
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className='md:pl-2'>
                <button
                  onClick={handleSearch}
                  className='group relative w-full md:w-auto h-12 px-8 rounded-xl text-base font-semibold text-primary-foreground overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]'
                >
                  {/* Gradient Background */}
                  <span className='absolute inset-0 bg-linear-to-r from-primary via-primary to-primary/90' />

                  {/* Shine Effect */}
                  <span className='absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out' />

                  {/* Shadow */}
                  <span className='absolute inset-0 rounded-xl shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/40 transition-shadow duration-300' />

                  {/* Content */}
                  <span className='relative flex items-center justify-center gap-2'>
                    <Search className='h-5 w-5 transition-transform duration-300 group-hover:rotate-12' />
                    <span>Search Cars</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className='flex flex-wrap items-center justify-center gap-6 md:gap-12 mt-8 text-white/70 text-sm'>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-green-400' />
              <span>500+ Cars Available</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-blue-400' />
              <span>Instant Booking</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-yellow-400' />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className='absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent' />
    </section>
  );
}

// Location Search Component with Autocomplete, Current Location, and Map Picker
interface LocationSearchInputProps {
  value: string;
  onChange: (location: string, lat?: number, lng?: number) => void;
}

function LocationSearchInput({ value, onChange }: LocationSearchInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Only update query from external value when not focused (to avoid overwriting user input)
  useEffect(() => {
    if (!isFocused) {
      setQuery(value);
    }
  }, [value, isFocused]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey || '',
          },
          body: JSON.stringify({
            input: query,
            includedPrimaryTypes: ['locality', 'sublocality', 'neighborhood', 'airport'],
            locationBias: {
              circle: {
                center: { latitude: 25.2048, longitude: 55.2708 }, // Dubai
                radius: 100000,
              },
            },
          }),
        });

        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectPlace = async (placeId: string, mainText: string, secondaryText?: string) => {
    setIsOpen(false);
    const displayText = secondaryText ? `${mainText}, ${secondaryText}` : mainText;
    setQuery(displayText);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=location&key=${apiKey}`);
      const details = await response.json();

      if (details.location) {
        onChange(displayText, details.location.latitude, details.location.longitude);
      } else {
        onChange(displayText);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      onChange(displayText);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setIsOpen(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Show friendly text instead of coordinates
        const displayText = 'Current location';
        setQuery(displayText);
        onChange(displayText, latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
        alert('Unable to get your location. Please enable location access.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapSelect = (location: { address: string; lat: number; lng: number }) => {
    setQuery(location.address);
    onChange(location.address, location.lat, location.lng);
    setShowMapPicker(false);
    setIsOpen(false); // Close dropdown when selecting from map
  };

  const hasSuggestions = suggestions.length > 0;
  // Only show dropdown when input is focused AND (has suggestions OR is loading OR query is empty for quick actions)
  const showDropdown = isOpen && isFocused && (hasSuggestions || isLoading || query.length === 0);

  return (
    <>
      <Popover open={showDropdown}>
        <PopoverAnchor asChild>
          <div className='relative flex-1 flex items-center'>
            <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10' />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                setIsOpen(true);
              }}
              onBlur={() => {
                // Delay to allow click events on dropdown items
                setTimeout(() => {
                  setIsFocused(false);
                  setIsOpen(false);
                }, 200);
              }}
              placeholder='City, airport, or address'
              className='h-12 pl-10 pr-24 rounded-xl border-0 bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary text-base'
            />
            {/* Action buttons */}
            <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1'>
              {/* Current Location Button */}
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-lg hover:bg-primary/10'
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                title='Use current location'
              >
                {isLocating ? (
                  <Loader2 className='h-4 w-4 animate-spin text-primary' />
                ) : (
                  <Navigation className='h-4 w-4 text-primary' />
                )}
              </Button>
              {/* Map Picker Button */}
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-lg hover:bg-primary/10'
                onClick={() => {
                  setIsOpen(false);
                  setShowMapPicker(true);
                }}
                title='Pick on map'
              >
                <Map className='h-4 w-4 text-primary' />
              </Button>
            </div>
          </div>
        </PopoverAnchor>
        <PopoverContent
          className='w-(--radix-popover-trigger-width) p-0'
          align='start'
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={() => {
            setIsOpen(false);
            setIsFocused(false);
          }}
        >
          <div className='max-h-80 overflow-y-auto'>
            {/* Quick Actions when empty */}
            {query.length === 0 && !isLoading && (
              <div className='p-2 space-y-1'>
                <button
                  type='button'
                  className='w-full text-left px-3 py-2.5 hover:bg-accent rounded-lg transition-colors flex items-center gap-3'
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                >
                  <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
                    <Navigation className='h-4 w-4 text-primary' />
                  </div>
                  <div>
                    <div className='font-medium text-sm'>Use current location</div>
                    <div className='text-xs text-muted-foreground'>Find cars near you</div>
                  </div>
                </button>
                <button
                  type='button'
                  className='w-full text-left px-3 py-2.5 hover:bg-accent rounded-lg transition-colors flex items-center gap-3'
                  onClick={() => {
                    setIsOpen(false);
                    setShowMapPicker(true);
                  }}
                >
                  <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
                    <Map className='h-4 w-4 text-primary' />
                  </div>
                  <div>
                    <div className='font-medium text-sm'>Pick on map</div>
                    <div className='text-xs text-muted-foreground'>Choose exact pickup location</div>
                  </div>
                </button>
                <div className='border-t my-2' />
                <div className='px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                  Popular locations
                </div>
                {popularLocations.map((loc) => (
                  <button
                    key={loc.name}
                    type='button'
                    className='w-full text-left px-3 py-2 hover:bg-accent rounded-lg transition-colors flex items-center gap-3'
                    onClick={() => {
                      setQuery(loc.name);
                      onChange(loc.name, loc.lat, loc.lng);
                      setIsOpen(false);
                    }}
                  >
                    <MapPin className='h-4 w-4 text-muted-foreground shrink-0' />
                    <span className='text-sm'>{loc.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Search Results */}
            {query.length > 0 && (
              <div className='p-2 space-y-1'>
                {isLoading && (
                  <div className='px-3 py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Searching...</span>
                  </div>
                )}
                {!isLoading && suggestions.length === 0 && query.length >= 2 && (
                  <div className='px-3 py-4 text-center text-sm text-muted-foreground'>
                    No locations found. Try a different search.
                  </div>
                )}
                {suggestions.map((item) => {
                  const prediction = item.placePrediction;
                  if (!prediction) return null;

                  const mainText = prediction.structuredFormat?.mainText?.text || prediction.text?.text;
                  const secondaryText = prediction.structuredFormat?.secondaryText?.text;

                  return (
                    <button
                      key={prediction.placeId}
                      type='button'
                      className='w-full text-left px-3 py-2.5 hover:bg-accent rounded-lg transition-colors flex items-start gap-3'
                      onClick={() => handleSelectPlace(prediction.placeId, mainText, secondaryText)}
                    >
                      <MapPin className='h-4 w-4 mt-0.5 text-muted-foreground shrink-0' />
                      <div>
                        <div className='font-medium text-sm'>{mainText}</div>
                        {secondaryText && <div className='text-xs text-muted-foreground'>{secondaryText}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Map Picker Dialog */}
      <MapPickerDialog open={showMapPicker} onOpenChange={setShowMapPicker} onSelect={handleMapSelect} />
    </>
  );
}

// Popular locations for quick access
const popularLocations = [
  { name: 'Dubai International Airport (DXB)', lat: 25.2532, lng: 55.3657 },
  { name: 'Dubai Marina', lat: 25.0805, lng: 55.1403 },
  { name: 'Downtown Dubai', lat: 25.1972, lng: 55.2744 },
  { name: 'Palm Jumeirah', lat: 25.1124, lng: 55.139 },
];

// Map Picker Dialog Component
const LocationPicker = dynamic(() => import('@/components/maps/location-picker'), {
  ssr: false,
  loading: () => (
    <div className='h-96 bg-muted/50 rounded-xl flex items-center justify-center'>
      <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
    </div>
  ),
});

interface MapPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (location: { address: string; lat: number; lng: number }) => void;
}

function MapPickerDialog({ open, onOpenChange, onSelect }: MapPickerDialogProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='h-[80vh] sm:h-[85vh] rounded-t-3xl px-0 flex flex-col'>
        <SheetHeader className='px-4 sm:px-6 pb-2 sm:pb-4 shrink-0'>
          <SheetTitle>Pick your pickup location</SheetTitle>
        </SheetHeader>

        {/* Map container - takes remaining space */}
        <div className='flex-1 px-4 sm:px-6 min-h-0'>
          <LocationPicker
            height='100%'
            placeholder='Search or click on the map'
            onLocationSelect={(loc) => {
              setSelectedLocation({
                address: loc.address,
                lat: loc.lat,
                lng: loc.lng,
              });
            }}
          />
        </div>

        {/* Bottom action bar - fixed height, never overflow */}
        <div className='shrink-0 p-3 sm:p-4 border-t bg-background'>
          {selectedLocation ? (
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3'>
              <div className='flex-1 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-xl min-w-0'>
                <div className='h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
                  <MapPin className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs text-muted-foreground hidden sm:block'>Selected location</p>
                  <p className='text-sm font-medium truncate'>{selectedLocation.address}</p>
                </div>
              </div>
              <Button
                size='lg'
                className='h-10 sm:h-12 px-6 w-full sm:w-auto shrink-0'
                onClick={() => {
                  onSelect(selectedLocation);
                }}
              >
                Confirm Location
              </Button>
            </div>
          ) : (
            <div className='flex items-center justify-center py-2 text-sm text-muted-foreground'>
              <MapPin className='h-4 w-4 mr-2 shrink-0' />
              <span className='text-center'>Tap on the map to select</span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
