'use client';

import { useJsApiLoader, Libraries } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';

const libraries: Libraries = ['geometry', 'drawing', 'places'];

export default function MapProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  if (loadError) {
    return <div className='flex items-center justify-center h-full text-muted-foreground'>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <Skeleton className='w-full h-full rounded-xl' />;
  }

  return children;
}
