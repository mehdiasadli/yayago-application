'use client';

import { MapPin } from 'lucide-react';

interface ListingsHeaderProps {
  city: string;
}

export default function ListingsHeader({ city }: ListingsHeaderProps) {
  const formattedCity = city
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 text-muted-foreground'>
        <MapPin className='size-4' />
        <span className='text-sm'>{formattedCity}</span>
      </div>
      <div>
        <h1 className='text-3xl md:text-4xl font-bold tracking-tight'>Rent a Car in {formattedCity}</h1>
        <p className='text-lg text-muted-foreground mt-2'>
          Browse through our selection of vehicles available for rent
        </p>
      </div>
    </div>
  );
}
