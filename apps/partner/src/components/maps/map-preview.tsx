'use client';

import { GoogleMap, MarkerF } from '@react-google-maps/api';

interface MapPreviewProps {
  lat: number;
  lng: number;
  height?: string;
  zoom?: number;
}

// Note: This component must be wrapped in MapProvider to work
export function MapPreview({ lat, lng, height = '200px', zoom = 15 }: MapPreviewProps) {
  return (
    <div className='relative w-full rounded-xl overflow-hidden border border-border' style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat, lng }}
        zoom={zoom}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          scrollwheel: false,
          draggable: false,
          clickableIcons: false,
        }}
      >
        <MarkerF position={{ lat, lng }} />
      </GoogleMap>
    </div>
  );
}

