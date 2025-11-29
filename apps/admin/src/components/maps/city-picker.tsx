'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader, Libraries, Data } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchRichCityData, type RichCityData } from './city-utils';
import { toast } from 'sonner';

const libraries: Libraries = ['places'];

interface CityPickerProps {
  onCitySelect: (data: RichCityData) => void;
  placeholder?: string;
  initialLat?: number;
  initialLng?: number;
  countryCode?: string; // Optional: Restrict search to specific country (ISO Alpha-2)
}

export default function CityPicker({
  onCitySelect,
  placeholder = 'Search for a city...',
  initialLat = 40.4093, // Baku
  initialLng = 49.8671,
  countryCode,
}: CityPickerProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries,
  });

  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState({ lat: initialLat, lng: initialLng });

  // Search State
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Ref to track if query update comes from selection to prevent re-opening dropdown
  const isSelectionUpdate = useRef(false);

  // GeoJSON Layer
  const [geoJsonData, setGeoJsonData] = useState<any | null>(null);

  // 1. Text Search (Places API New)
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Skip fetch if this update was triggered by selection
      if (isSelectionUpdate.current) {
        isSelectionUpdate.current = false;
        return;
      }

      if (!query || query.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        const requestBody: any = {
          input: query,
          includedPrimaryTypes: ['locality'], // Strict filtering for Cities
        };

        // Add country restriction if provided
        if (countryCode) {
          requestBody.includedRegionCodes = [countryCode.toLowerCase()];
        }

        const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey || '',
          },
          body: JSON.stringify(requestBody),
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
  }, [query, countryCode]);

  // 2. Handle City Selection
  const handleSelectCity = async (placeId: string, mainText: string) => {
    isSelectionUpdate.current = true; // Mark as selection update
    setShowSuggestions(false);
    setQuery(mainText);
    setSuggestions([]); // Clear suggestions so it doesn't pop up again immediately
    setIsLoadingData(true);
    setGeoJsonData(null); // Reset previous boundary

    try {
      // Fetch everything: Coords, Languages, GeoJSON
      const richData = await fetchRichCityData(placeId);

      // Update Map View
      setCenter(richData.location);
      mapRef?.panTo(richData.location);
      mapRef?.setZoom(11); // Good zoom for cities

      // Render GeoJSON if available
      if (richData.geoJson) {
        setGeoJsonData(richData.geoJson);
      } else {
        toast.info('City boundary not found, showing marker only.');
      }

      // Pass data to parent
      onCitySelect(richData);
    } catch (error) {
      console.error('Failed to load city data', error);
      toast.error('Failed to load city data. Please try again.');
    } finally {
      setIsLoadingData(false);
    }
  };

  // 3. Load GeoJSON onto Map when available
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  // Effect to handle Data Layer updates
  useEffect(() => {
    if (mapRef && geoJsonData) {
      // Clear previous data
      mapRef.data.forEach((feature) => mapRef.data.remove(feature));

      // Add new Polygon
      mapRef.data.addGeoJson({
        type: 'Feature',
        geometry: geoJsonData,
        properties: {},
      });

      // Style it
      mapRef.data.setStyle({
        fillColor: '#3b82f6', // Blue-500
        fillOpacity: 0.2,
        strokeColor: '#2563eb', // Blue-600
        strokeWeight: 2,
        clickable: false,
      });
    } else if (mapRef) {
      // Clear if no data
      mapRef.data.forEach((feature) => mapRef.data.remove(feature));
    }
  }, [mapRef, geoJsonData]);

  if (!isLoaded) {
    return <Skeleton className='w-full h-[500px] rounded-xl' />;
  }

  return (
    <div className='relative w-full h-[500px] rounded-xl overflow-hidden group border border-border'>
      {/* Search Bar Overlay */}
      <div className='absolute top-4 left-4 right-4 z-10 flex flex-col gap-1'>
        <div className='bg-background flex gap-2 shadow-lg rounded-md p-1'>
          <div className='flex items-center justify-center w-10'>
            {isLoadingData ? (
              <Loader2 className='w-5 h-5 text-blue-600 animate-spin' />
            ) : (
              <Search className='w-5 h-5 text-gray-400' />
            )}
          </div>

          <Input
            placeholder={placeholder}
            className='border-0 focus-visible:ring-0 text-base shadow-none'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            // Only show suggestions if we have them (e.g. user clicks back into input)
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className='p-1 shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2'>
            <CardContent className='p-0'>
              {suggestions.map((item) => {
                const prediction = item.placePrediction;
                if (!prediction) return null;

                const mainText = prediction.structuredFormat?.mainText?.text || prediction.text?.text;
                const secondaryText = prediction.structuredFormat?.secondaryText?.text;

                return (
                  <button
                    key={prediction.placeId}
                    className='w-full text-left px-4 py-2 hover:bg-accent text-sm rounded-sm transition-colors'
                    onClick={() => handleSelectCity(prediction.placeId, mainText)}
                    type='button'
                  >
                    <div className='font-medium'>{mainText}</div>
                    <div className='text-xs text-gray-500'>{secondaryText}</div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={11}
        onLoad={onMapLoad}
        // Disable Click Interactions to enforce "Search Only" behavior
        onClick={() => {}}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          draggableCursor: 'default', // Don't show the hand cursor
          clickableIcons: false,
        }}
      >
        {/* Always show a marker at center to denote the city point */}
        <MarkerF position={center} />
      </GoogleMap>
    </div>
  );
}
