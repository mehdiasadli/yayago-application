'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navigation, Search, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { reverseGeocode, type GeocodedLocation } from './geocoding';
import { getCityFromAddressComponents, getCountryFromAddressComponents } from './utils';

interface LocationPickerProps {
  onLocationSelect: (location: GeocodedLocation & { placeId?: string }) => void;
  initialLocation?: Pick<GeocodedLocation, 'lat' | 'lng'>;
  centerCity?: { lat: number; lng: number };
  countryCode?: string; // ISO 3166-1 alpha-2 country code to restrict search
  searchTypes?: string[];
  placeholder?: string;
  height?: string;
  showCurrentLocation?: boolean;
}

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  centerCity,
  countryCode,
  searchTypes = [],
  placeholder = 'Search location...',
  height = '300px',
  showCurrentLocation = true,
}: LocationPickerProps) {
  // Check if Google Maps is already loaded (by MapProvider)
  const [isLoaded, setIsLoaded] = useState(() => {
    // Initial check - if already loaded
    return typeof window !== 'undefined' && !!window.google?.maps;
  });

  useEffect(() => {
    // If already loaded, we're done
    if (isLoaded) return;

    // Check periodically if google maps becomes available (loaded by MapProvider)
    const checkLoaded = () => {
      if (typeof window !== 'undefined' && window.google?.maps) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkLoaded()) return;

    // Poll for a short time in case MapProvider is loading
    const interval = setInterval(() => {
      if (checkLoaded()) {
        clearInterval(interval);
      }
    }, 100);

    // Clean up after 5 seconds
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isLoaded]);

  const defaultCenter = centerCity || initialLocation || { lat: 25.2048, lng: 55.2708 }; // Default to Dubai
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState(initialLocation || defaultCenter);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [lastCenterCity, setLastCenterCity] = useState<{ lat: number; lng: number } | undefined>(centerCity);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Only pan to centerCity when the city actually changes (not just object reference)
  useEffect(() => {
    if (centerCity && mapRef) {
      const cityChanged = !lastCenterCity || 
        lastCenterCity.lat !== centerCity.lat || 
        lastCenterCity.lng !== centerCity.lng;
      
      if (cityChanged) {
        mapRef.panTo(centerCity);
        // Only reset marker if user hasn't interacted yet
        if (!hasUserInteracted) {
          setMarkerPosition(centerCity);
        }
        setLastCenterCity(centerCity);
      }
    }
  }, [centerCity?.lat, centerCity?.lng, mapRef, hasUserInteracted, lastCenterCity]);

  const onMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      setHasUserInteracted(true);
      setMarkerPosition({ lat, lng });
      setShowSuggestions(false);

      const data = await reverseGeocode(lat, lng, 'en');
      if (data) {
        setQuery(data.address);
        onLocationSelect({ ...data, placeId: undefined });
      }
    },
    [onLocationSelect]
  );

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        return;
      }

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
            includedPrimaryTypes: searchTypes.length > 0 
              ? searchTypes.map((t) => (t === '(cities)' ? 'locality' : t))
              : undefined,
            // Restrict to specific country if provided
            ...(countryCode && {
              includedRegionCodes: [countryCode.toUpperCase()],
            }),
            locationBias: markerPosition
              ? {
                  circle: {
                    center: { latitude: markerPosition.lat, longitude: markerPosition.lng },
                    radius: 50000,
                  },
                }
              : undefined,
          }),
        });

        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuggestions([]);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query, markerPosition, searchTypes, countryCode]);

  const handleSelectPlace = async (placeId: string, mainText: string) => {
    setShowSuggestions(false);
    setQuery(mainText);
    setHasUserInteracted(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?fields=location,formattedAddress,addressComponents&languageCode=en&key=${apiKey}`
      );
      const details = await response.json();

      if (details.location) {
        const lat = details.location.latitude;
        const lng = details.location.longitude;

        setMarkerPosition({ lat, lng });
        mapRef?.panTo({ lat, lng });
        mapRef?.setZoom(15);

        const mappedComponents = (details.addressComponents || []).map((c: any) => ({
          long_name: c.longText,
          short_name: c.shortText,
          types: c.types,
        })) as google.maps.GeocoderAddressComponent[];

        onLocationSelect({
          lat,
          lng,
          address: details.formattedAddress,
          city: getCityFromAddressComponents(mappedComponents),
          country: getCountryFromAddressComponents(mappedComponents),
          placeId: placeId,
        });
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMarkerPosition({ lat: latitude, lng: longitude });
        mapRef?.panTo({ lat: latitude, lng: longitude });
        mapRef?.setZoom(15);

        const data = await reverseGeocode(latitude, longitude, 'en');
        if (data) {
          setQuery(data.address);
          onLocationSelect({ ...data });
        }
      });
    }
  };

  if (!isLoaded) {
    return <Skeleton className='w-full rounded-xl' style={{ height }} />;
  }

  return (
    <div className='relative w-full rounded-xl overflow-hidden border border-border' style={{ height }}>
      {/* Search Bar */}
      <div className='absolute top-3 left-3 right-3 z-10 flex flex-col gap-1'>
        <div className='flex gap-2 shadow-lg bg-background/95 backdrop-blur-sm rounded-lg p-1.5'>
          <Search className='w-4 h-4 text-muted-foreground my-auto ml-2' />
          <Input
            placeholder={placeholder}
            className='border-0 focus-visible:ring-0 text-sm shadow-none h-8'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
          />
          {showCurrentLocation && (
            <Button size='icon' variant='ghost' type='button' className='h-8 w-8' onClick={useCurrentLocation}>
              <Navigation className='h-4 w-4 text-primary' />
            </Button>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <Card className='p-1 shadow-xl max-h-48 overflow-y-auto'>
            {suggestions.map((item) => {
              const prediction = item.placePrediction;
              if (!prediction) return null;

              const mainText = prediction.structuredFormat?.mainText?.text || prediction.text?.text;
              const secondaryText = prediction.structuredFormat?.secondaryText?.text;

              return (
                <button
                  key={prediction.placeId}
                  className='w-full text-left px-3 py-2 hover:bg-accent text-sm rounded-md transition-colors flex items-start gap-2'
                  onClick={() => handleSelectPlace(prediction.placeId, mainText)}
                  type='button'
                >
                  <MapPin className='h-4 w-4 mt-0.5 text-muted-foreground shrink-0' />
                  <div>
                    <div className='font-medium'>{mainText}</div>
                    {secondaryText && <div className='text-xs text-muted-foreground'>{secondaryText}</div>}
                  </div>
                </button>
              );
            })}
          </Card>
        )}
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={markerPosition}
        zoom={13}
        onLoad={(map) => setMapRef(map)}
        onClick={onMapClick}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        <MarkerF position={markerPosition} />
      </GoogleMap>
    </div>
  );
}
