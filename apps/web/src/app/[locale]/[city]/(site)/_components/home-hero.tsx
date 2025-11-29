'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DatePicker from '@/components/date-picker';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { SearchIcon } from 'lucide-react';
import { parseAsIsoDate, parseAsString, useQueryState } from 'nuqs';
import { addDays } from 'date-fns';
import { Suspense } from 'react';

export default function HomeHero() {
  return (
    <div>
      <Suspense>
        <HomeContent />
      </Suspense>
    </div>
  );
}

function HomeContent() {
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [pickupDate, setPickupDate] = useQueryState('pickup_date', parseAsIsoDate);
  const [dropoffDate, setDropoffDate] = useQueryState('dropoff_date', parseAsIsoDate);

  const today = new Date();

  return (
    <div className='h-screen flex items-center justify-center relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-col text-center space-y-8'>
      <Card className='max-w-5xl rounded-4xl'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Book a car</CardTitle>
          <CardDescription>Book a car for your next trip.</CardDescription>
        </CardHeader>
        <CardContent className='flex items-center gap-2 w-full '>
          <InputGroup className='rounded-full'>
            <InputGroupInput
              className='w-xl'
              placeholder='Search for your wish car'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>

          {/* PICKUP DATE */}
          <DatePicker
            buttonClassName='w-45'
            disabled={dropoffDate ? { after: new Date(dropoffDate) } : { before: today }}
            date={pickupDate ? new Date(pickupDate) : undefined}
            placeholder='Pickup Date'
            setDate={(date) => {
              date?.setHours(10, 0, 0, 0);
              setPickupDate(date ?? null);
            }}
          />

          {/* DROPOFF DATE */}
          <DatePicker
            buttonClassName='w-45'
            disabled={pickupDate ? { before: addDays(pickupDate, 1) } : { before: addDays(today, 1) }}
            date={dropoffDate ? new Date(dropoffDate) : undefined}
            placeholder='Dropoff Date'
            defaultMonth={pickupDate ? new Date(pickupDate) : undefined}
            setDate={(date) => {
              date?.setHours(10, 0, 0, 0);
              setDropoffDate(date ?? null);
            }}
          />
          <Button className='rounded-full'>Search</Button>
        </CardContent>
      </Card>
    </div>
  );
}
