'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Pencil, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrgContext } from '../page';

type DayHours = {
  open?: string;
  close?: string;
  closed?: boolean;
};

type BusinessHours = {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
};

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

const formatTime = (time?: string) => {
  if (!time) return '--:--';
  return time;
};

export function OrganizationBusinessHours() {
  const { org, canEditLimited } = useOrgContext();
  const businessHours = org.businessHours as BusinessHours | null;
  const hasHours = businessHours && Object.keys(businessHours).length > 0;

  // Check if today is open
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof BusinessHours;
  const todayHours = businessHours?.[today];
  const isOpenNow = todayHours && !todayHours.closed && todayHours.open && todayHours.close;

  // Get timezone from city
  const timezone = org.city?.timezone;

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='size-4' />
            Business Hours
          </CardTitle>
          <CardDescription>When your business is open</CardDescription>
        </div>
        <div className='flex items-center gap-2'>
          {hasHours && (
            <Badge variant={isOpenNow ? 'success' : 'secondary'}>
              {isOpenNow ? 'Open Now' : 'Closed'}
            </Badge>
          )}
          {canEditLimited && (
            <Button asChild variant='outline' size='sm'>
              <Link href='/organization/edit/hours'>
                <Pencil className='size-3 mr-1.5' />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasHours ? (
          <div className='space-y-4'>
            {/* Timezone from city */}
            {timezone && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b'>
                <Globe className='size-3.5' />
                Timezone: {timezone}
              </div>
            )}

            {/* Weekly Hours */}
            <div className='grid gap-2'>
              {DAYS.map(({ key, label }) => {
                const dayHours = businessHours[key];
                const isClosed = dayHours?.closed || (!dayHours?.open && !dayHours?.close);
                const isToday = key === today;

                return (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center justify-between py-2 px-3 rounded-lg',
                      isToday && 'bg-primary/5 border border-primary/20',
                      isClosed && 'text-muted-foreground'
                    )}
                  >
                    <span className={cn('text-sm', isToday && 'font-medium')}>
                      {label}
                      {isToday && (
                        <Badge variant='outline' className='ml-2 text-xs'>Today</Badge>
                      )}
                    </span>
                    <span className={cn('text-sm font-mono', isClosed && 'italic')}>
                      {isClosed ? (
                        'Closed'
                      ) : (
                        <>
                          {formatTime(dayHours?.open)} - {formatTime(dayHours?.close)}
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className='text-center py-6'>
            <Clock className='size-8 mx-auto mb-2 text-muted-foreground opacity-50' />
            <p className='text-sm text-muted-foreground'>
              No business hours configured yet
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              Add your operating hours so customers know when you're available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
