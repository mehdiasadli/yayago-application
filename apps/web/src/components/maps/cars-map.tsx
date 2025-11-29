'use client';

import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader, Libraries } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, MapPin, X } from 'lucide-react';
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

  // Calculate center from cars if not provided
  const mapCenter = useMemo(() => {
    if (center) return center;
    if (cars.length === 0) return { lat: 25.2048, lng: 55.2708 }; // Default to Dubai

    const avgLat = cars.reduce((sum, car) => sum + car.lat, 0) / cars.length;
    const avgLng = cars.reduce((sum, car) => sum + car.lng, 0) / cars.length;
    return { lat: avgLat, lng: avgLng };
  }, [cars, center]);

  // Fit bounds to show all cars
  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMapRef(map);
      if (cars.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        cars.forEach((car) => bounds.extend({ lat: car.lat, lng: car.lng }));
        map.fitBounds(bounds, { padding: 50 });
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
        {cars.map((car) => (
          <MarkerF
            key={car.id}
            position={{ lat: car.lat, lng: car.lng }}
            onClick={() => handleMarkerClick(car)}
            icon={{
              url:
                selectedCarId === car.id || selectedCar?.id === car.id
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
              scaledSize: new google.maps.Size(
                selectedCarId === car.id || selectedCar?.id === car.id ? 40 : 32,
                selectedCarId === car.id || selectedCar?.id === car.id ? 40 : 32
              ),
            }}
          />
        ))}

        {/* Info Window for selected car */}
        {selectedCar && (
          <InfoWindowF
            position={{ lat: selectedCar.lat, lng: selectedCar.lng }}
            onCloseClick={() => setSelectedCar(null)}
            options={{ pixelOffset: new google.maps.Size(0, -35) }}
          >
            <div className='w-56 p-0 rounded-lg overflow-hidden'>
              {selectedCar.primaryImage && (
                <div className='relative h-28 w-full'>
                  <Image src={selectedCar.primaryImage} alt={selectedCar.title} fill className='object-cover' />
                </div>
              )}
              <div className='p-3'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs text-muted-foreground'>
                    {selectedCar.brand} {selectedCar.model}
                  </span>
                  <span className='text-xs text-muted-foreground'>{selectedCar.year}</span>
                </div>
                <h3 className='font-semibold text-sm line-clamp-1'>{selectedCar.title}</h3>
                <div className='flex items-center justify-between mt-2'>
                  <div>
                    <span className='font-bold text-primary'>
                      {selectedCar.currency} {selectedCar.pricePerDay}
                    </span>
                    <span className='text-xs text-muted-foreground'>/day</span>
                  </div>
                  {selectedCar.hasInstantBooking && (
                    <Badge variant='secondary' className='text-xs'>
                      Instant
                    </Badge>
                  )}
                </div>
                <Link href={`/rent/cars/${selectedCar.slug}`}>
                  <Button size='sm' className='w-full mt-2'>
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
