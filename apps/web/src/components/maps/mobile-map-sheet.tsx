'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map, X, Car } from 'lucide-react';
import CarsMap from './cars-map';

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

interface MobileMapSheetProps {
  cars: CarLocation[];
  center?: { lat: number; lng: number };
  onCarClick?: (carId: string) => void;
  selectedCarId?: string | null;
}

export default function MobileMapSheet({ cars, center, onCarClick, selectedCarId }: MobileMapSheetProps) {
  const [open, setOpen] = useState(false);

  const handleCarClick = (carId: string) => {
    onCarClick?.(carId);
    // Keep sheet open so user can see the selection
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='outline' size='lg' className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-xl md:hidden'>
          <Map className='size-4 mr-2' />
          Map
          {cars.length > 0 && (
            <Badge variant='secondary' className='ml-2'>
              {cars.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side='bottom' className='h-[85vh] p-0'>
        <SheetHeader className='p-4 border-b'>
          <div className='flex items-center justify-between'>
            <SheetTitle className='flex items-center gap-2'>
              <Car className='size-5' />
              {cars.length} cars on map
            </SheetTitle>
            <Button variant='ghost' size='icon' onClick={() => setOpen(false)}>
              <X className='size-4' />
            </Button>
          </div>
        </SheetHeader>
        <div className='h-[calc(85vh-65px)]'>
          {open && (
            <CarsMap
              cars={cars}
              center={center}
              height='100%'
              onCarClick={handleCarClick}
              selectedCarId={selectedCarId}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

