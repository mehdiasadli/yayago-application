'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navigation, Search } from 'lucide-react';
import { reverseGeocode, type GeocodedLocation } from './geocoding';
import { getCityFromAddressComponents, getCountryFromAddressComponents } from './utils';

interface LocationPickerProps {
  onLocationSelect: (location: GeocodedLocation & { placeId?: string }) => void;
  initialLocation?: Pick<GeocodedLocation, 'lat' | 'lng'>;
  // Center on a specific city
  centerCity?: { lat: number; lng: number };
  searchTypes?: string[]; // e.g., ['locality'] for cities
  placeholder?: string;
  height?: string;
}

// Note: This component must be wrapped in MapProvider to work
export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  centerCity,
  searchTypes = [],
  placeholder = 'Search places...',
  height = '400px',
}: LocationPickerProps) {

  const defaultCenter = centerCity || initialLocation || { lat: 25.2048, lng: 55.2708 }; // Default to Dubai
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState(initialLocation || defaultCenter);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search State
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Re-center map when centerCity changes
  useEffect(() => {
    if (centerCity && mapRef) {
      mapRef.panTo(centerCity);
      setMarkerPosition(centerCity);
    }
  }, [centerCity, mapRef]);

  // Handle Map Click
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
        onLocationSelect({ ...data, placeId: undefined });
      }
    },
    [onLocationSelect]
  );

  // Handle Text Search
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

  // Handle Suggestion Select
  const handleSelectPlace = async (placeId: string, mainText: string) => {
    setSuggestions([]); // Clear suggestions immediately
    setShowSuggestions(false);
    setQuery(mainText);
    inputRef.current?.blur(); // Blur input to close dropdown

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

  return (
    <div className='relative w-full rounded-xl overflow-hidden group border border-border' style={{ height }}>
      {/* Search Bar */}
      <div className='absolute top-4 left-4 right-4 z-10 flex flex-col gap-1'>
        <div className='flex gap-2 shadow-lg bg-white dark:bg-zinc-900 rounded-md p-1'>
          <Search className='w-5 h-5 text-gray-400 my-auto ml-2' />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            className='border-0 focus-visible:ring-0 text-base shadow-none'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
          <Button
            size='icon'
            variant='ghost'
            type='button'
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
              const prediction = item.placePrediction;
              if (!prediction) return null;

              const mainText = prediction.structuredFormat?.mainText?.text || prediction.text?.text;
              const secondaryText = prediction.structuredFormat?.secondaryText?.text;

              return (
                <button
                  key={prediction.placeId}
                  className='w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm rounded-sm transition-colors'
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
