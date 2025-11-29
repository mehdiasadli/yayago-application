'use client';

import { cn } from '@/lib/utils';
import { GoogleMap, GoogleMapProps } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

export const defaultMapContainerStyle = {
  width: '100%',
  height: '100vh',
  borderRadius: '16px',
};

const defaultMapOptions = {
  zoomControl: true,
  tilt: 0,
  gestureHandling: 'auto',
  mapTypeId: 'roadmap',
};

interface MapProps extends GoogleMapProps {
  containerProps?: Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className'>;
  containerClassName?: string;
}

export default function Map({
  options = defaultMapOptions,
  mapContainerStyle = defaultMapContainerStyle,
  center,
  zoom = 10,
  containerProps,
  containerClassName,
  ...props
}: MapProps) {
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);

  useEffect(() => {
    if (window.navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }, []);

  return (
    <div className={cn('w-full h-full', containerClassName)} {...containerProps}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        options={options}
        center={center || (lat && lng ? { lat, lng } : undefined)}
        {...props}
      />
    </div>
  );
}
