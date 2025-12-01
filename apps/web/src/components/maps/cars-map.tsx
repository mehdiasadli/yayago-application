'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader, Libraries } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const libraries: Libraries = ['places'];

interface CarLocation {
  id: string;
  slug: string;
  title: string;
  lat: number;
  lng: number;
  pricePerDay: number;
  currency: string;
  primaryImage?: string | null;
  brand: string;
  model: string;
  year: number;
  hasInstantBooking: boolean;
}

interface CarsMapProps {
  cars: CarLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onCarClick?: (carId: string) => void;
  selectedCarId?: string | null;
}

export default function CarsMap({
  cars,
  center,
  zoom = 12,
  height = '500px',
  onCarClick,
  selectedCarId,
}: CarsMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries,
  });

  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [selectedCar, setSelectedCar] = useState<CarLocation | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Calculate center from cars if not provided
  const mapCenter = useMemo(() => {
    if (center) return center;
    if (cars.length === 0) return { lat: 25.2048, lng: 55.2708 }; // Default to Dubai

    const avgLat = cars.reduce((sum, car) => sum + car.lat, 0) / cars.length;
    const avgLng = cars.reduce((sum, car) => sum + car.lng, 0) / cars.length;
    return { lat: avgLat, lng: avgLng };
  }, [cars, center]);

  // Custom cluster renderer for nicer-looking clusters
  const clusterRenderer = useMemo(
    () => ({
      render: ({ count, position }: { count: number; position: google.maps.LatLng }) => {
        const color = count < 10 ? '#3b82f6' : count < 50 ? '#2563eb' : '#1d4ed8';
        const size = count < 10 ? 40 : count < 50 ? 50 : 60;

        const svg = `
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" stroke="white" stroke-width="3"/>
            <text x="${size / 2}" y="${size / 2 + 5}" text-anchor="middle" fill="white" font-size="${size / 3}px" font-weight="bold">${count}</text>
          </svg>
        `;

        return new google.maps.Marker({
          position,
          icon: {
            url: 'data:image/svg+xml,' + encodeURIComponent(svg),
            scaledSize: new google.maps.Size(size, size),
          },
          label: { text: '', color: 'transparent' },
          zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
        });
      },
    }),
    []
  );

  // Set up clustering when map and cars change
  useEffect(() => {
    if (!mapRef || cars.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Clear existing clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }

    // Create new markers
    const newMarkers = cars.map((car) => {
      const isSelected = selectedCarId === car.id || selectedCar?.id === car.id;
      const marker = new google.maps.Marker({
        position: { lat: car.lat, lng: car.lng },
        icon: {
          url: isSelected
            ? 'data:image/svg+xml,' +
              encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#2563eb" stroke="white" stroke-width="3"/>
                <path d="M12 22l2-6h12l2 6M14 22v3h2v-3m8 0v3h2v-3M14 22h12" stroke="white" stroke-width="1.5" fill="none"/>
              </svg>
            `)
            : 'data:image/svg+xml,' +
              encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#3b82f6" stroke="white" stroke-width="2"/>
                <path d="M10 18l1.5-5h9l1.5 5M11 18v2.5h1.5v-2.5m6 0v2.5h1.5v-2.5M11 18h10" stroke="white" stroke-width="1.2" fill="none"/>
              </svg>
            `),
          scaledSize: new google.maps.Size(isSelected ? 40 : 32, isSelected ? 40 : 32),
        },
      });

      marker.addListener('click', () => {
        setSelectedCar(car);
        onCarClick?.(car.id);
        mapRef?.panTo({ lat: car.lat, lng: car.lng });
      });

      return marker;
    });

    markersRef.current = newMarkers;

    // Create clusterer
    clustererRef.current = new MarkerClusterer({
      map: mapRef,
      markers: newMarkers,
      renderer: clusterRenderer,
    });

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
      markersRef.current.forEach((marker) => marker.setMap(null));
    };
  }, [mapRef, cars, selectedCarId, selectedCar?.id, onCarClick, clusterRenderer]);

  // Fit bounds to show all cars
  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMapRef(map);
      if (cars.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        cars.forEach((car) => bounds.extend({ lat: car.lat, lng: car.lng }));
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }
    },
    [cars]
  );

  const handleMarkerClick = (car: CarLocation) => {
    setSelectedCar(car);
    onCarClick?.(car.id);
    mapRef?.panTo({ lat: car.lat, lng: car.lng });
  };

  if (!isLoaded) {
    return <Skeleton className='w-full rounded-xl' style={{ height }} />;
  }

  return (
    <div className='relative w-full rounded-xl overflow-hidden border border-border' style={{ height }}>
      {/* Car count badge */}
      <div className='absolute top-3 left-3 z-10'>
        <Badge variant='secondary' className='shadow-lg bg-background/95 backdrop-blur-sm'>
          <Car className='h-3 w-3 mr-1' />
          {cars.length} cars available
        </Badge>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={zoom}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        }}
      >
        {/* Markers are handled by MarkerClusterer via useEffect */}

        {/* Info Window for selected car */}
        {selectedCar && (
          <InfoWindowF
            position={{ lat: selectedCar.lat, lng: selectedCar.lng }}
            onCloseClick={() => setSelectedCar(null)}
            options={{ pixelOffset: new google.maps.Size(0, -35) }}
          >
            <div className='w-60 p-0 rounded-lg overflow-hidden shadow-lg'>
              {selectedCar.primaryImage && (
                <div className='relative h-32 w-full'>
                  <Image src={selectedCar.primaryImage} alt={selectedCar.title} fill className='object-cover' />
                  {selectedCar.hasInstantBooking && (
                    <Badge className='absolute top-2 right-2 text-xs bg-yellow-500 text-black'>
                      <Zap className='size-3 mr-1' />
                      Instant
                    </Badge>
                  )}
                </div>
              )}
              <div className='p-3 bg-white'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs text-gray-500'>
                    {selectedCar.year} {selectedCar.brand}
                  </span>
                </div>
                <h3 className='font-semibold text-sm line-clamp-1 text-gray-900'>{selectedCar.model}</h3>
                <div className='flex items-center justify-between mt-2'>
                  <div>
                    <span className='font-bold text-blue-600 text-lg'>
                      {selectedCar.currency} {selectedCar.pricePerDay}
                    </span>
                    <span className='text-xs text-gray-500'>/day</span>
                  </div>
                </div>
                <Link href={`/rent/cars/${selectedCar.slug}`}>
                  <Button size='sm' className='w-full mt-3'>
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}
