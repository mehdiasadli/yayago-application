'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader, Libraries } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navigation, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { reverseGeocode, type GeocodedLocation } from './geocoding';
import { getCityFromAddressComponents, getCountryFromAddressComponents } from './utils';

const libraries: Libraries = ['places'];

interface LocationPickerProps {
  onLocationSelect: (location: GeocodedLocation & { placeId?: string }) => void;
  initialLocation?: Pick<GeocodedLocation, 'lat' | 'lng'>;
  // New Prop: Restrict search results
  searchTypes?: string[]; // e.g., ['locality'] for cities
  placeholder?: string;
}

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  searchTypes = [], // Default to all
  placeholder = 'Search places...',
}: LocationPickerProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries,
  });

  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState(initialLocation || { lat: 40.4093, lng: 49.8671 });

  // Search State
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 1. Handle Map Click
  const onMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      setMarkerPosition({ lat, lng });
      setShowSuggestions(false);

      const data = await reverseGeocode(lat, lng, 'en');
      if (data) {
        setQuery(data.address);
        onLocationSelect({ ...data, placeId: undefined }); // Click doesn't always have a placeId
      }
    },
    [onLocationSelect]
  );

  // 2. Handle Text Search (Places API New via REST)
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
            // Map legacy types to new types if necessary, or use passed types
            includedPrimaryTypes: searchTypes.map((t) => (t === '(cities)' ? 'locality' : t)),
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
  }, [query, markerPosition, searchTypes]);

  // 3. Handle Suggestion Select (Places API New via REST)
  const handleSelectPlace = async (placeId: string, mainText: string) => {
    setShowSuggestions(false);
    setQuery(mainText);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      // Fetch details: location, address components, formatted address
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?fields=location,formattedAddress,addressComponents&languageCode=en&key=${apiKey}`
      );
      const details = await response.json();

      if (details.location) {
        const lat = details.location.latitude;
        const lng = details.location.longitude;

        setMarkerPosition({ lat, lng });
        mapRef?.panTo({ lat, lng });
        mapRef?.setZoom(12);

        // Map New API address components to Old API format for utility compatibility
        // New: { longText, shortText, types }
        // Old: { long_name, short_name, types }
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

  if (!isLoaded) {
    return <Skeleton className='w-full h-[500px] rounded-xl' />;
  }

  return (
    <div className='relative w-full h-[500px] rounded-xl overflow-hidden group border border-border'>
      {/* Search Bar */}
      <div className='absolute top-4 left-4 right-4 z-10 flex flex-col gap-1'>
        <div className='flex gap-2 shadow-lg bg-white rounded-md p-1'>
          <Search className='w-5 h-5 text-gray-400 my-auto ml-2' />
          <Input
            placeholder={placeholder}
            className='border-0 focus-visible:ring-0 text-base shadow-none'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
          />
          <Button
            size='icon'
            variant='ghost'
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  const { latitude, longitude } = pos.coords;
                  setMarkerPosition({ lat: latitude, lng: longitude });
                  mapRef?.panTo({ lat: latitude, lng: longitude });
                });
              }
            }}
          >
            <Navigation className='h-4 w-4 text-blue-600' />
          </Button>
        </div>

        {/* Suggestions List */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className='p-1 shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2'>
            {suggestions.map((item) => {
              // New API response structure
              const prediction = item.placePrediction;
              if (!prediction) return null;

              const mainText = prediction.structuredFormat?.mainText?.text || prediction.text?.text;
              const secondaryText = prediction.structuredFormat?.secondaryText?.text;

              return (
                <button
                  key={prediction.placeId}
                  className='w-full text-left px-4 py-2 hover:bg-gray-100 text-sm rounded-sm transition-colors'
                  onClick={() => handleSelectPlace(prediction.placeId, mainText)}
                  type='button'
                >
                  <div className='font-medium'>{mainText}</div>
                  <div className='text-xs text-gray-500'>{secondaryText}</div>
                </button>
              );
            })}
          </Card>
        )}
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={markerPosition}
        zoom={12}
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
