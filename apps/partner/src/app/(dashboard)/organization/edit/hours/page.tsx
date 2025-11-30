'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, AlertCircle, Clock, Copy, Globe, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type DayHours = {
  open: string;
  close: string;
  closed: boolean;
};

type BusinessHours = {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
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

const DEFAULT_HOURS: DayHours = {
  open: '09:00',
  close: '18:00',
  closed: false,
};

export default function EditOrganizationHoursPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: org, isLoading, error } = useQuery(
    orpc.organizations.getMyOrganization.queryOptions()
  );

  const [hours, setHours] = useState<BusinessHours>({
    monday: { ...DEFAULT_HOURS },
    tuesday: { ...DEFAULT_HOURS },
    wednesday: { ...DEFAULT_HOURS },
    thursday: { ...DEFAULT_HOURS },
    friday: { ...DEFAULT_HOURS },
    saturday: { ...DEFAULT_HOURS, closed: true },
    sunday: { ...DEFAULT_HOURS, closed: true },
  });

  const mutation = useMutation(
    orpc.organizations.updateBusinessHours.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organizations', 'getMyOrganization'] });
        toast.success('Business hours updated');
        router.push('/organization');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to update');
      },
    })
  );

  useEffect(() => {
    if (org) {
      if (org.businessHours) {
        const existingHours = org.businessHours as Partial<BusinessHours>;
        setHours((prev) => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(existingHours).map(([key, value]) => [
              key,
              { ...DEFAULT_HOURS, ...value },
            ])
          ),
        }));
      }
    }
  }, [org]);

  const handleDayChange = (day: keyof BusinessHours, field: keyof DayHours, value: string | boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const copyToAllWeekdays = (sourceDay: keyof BusinessHours) => {
    const sourceHours = hours[sourceDay];
    setHours((prev) => ({
      ...prev,
      monday: { ...sourceHours },
      tuesday: { ...sourceHours },
      wednesday: { ...sourceHours },
      thursday: { ...sourceHours },
      friday: { ...sourceHours },
    }));
    toast.success('Copied to all weekdays');
  };

  const handleSubmit = () => {
    mutation.mutate({
      businessHours: hours,
    });
  };

  if (isLoading) {
    return (
      <div className='container py-6 max-w-2xl'>
        <Skeleton className='h-8 w-48 mb-6' />
        <Skeleton className='h-96' />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className='container py-6 max-w-2xl'>
        <Alert variant='destructive'>
          <AlertCircle className='size-4' />
          <AlertDescription>Failed to load organization data</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user is owner or admin
  if (org.memberRole !== 'owner' && org.memberRole !== 'admin') {
    return (
      <div className='container py-6 max-w-2xl'>
        <Alert variant='destructive'>
          <ShieldAlert className='size-4' />
          <AlertDescription>
            Only organization owners or admins can edit business hours.
          </AlertDescription>
        </Alert>
        <Button asChild variant='outline' className='mt-4'>
          <Link href='/organization'>
            <ArrowLeft className='size-4 mr-1.5' />
            Back to Organization
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='container py-6 max-w-2xl'>
      <Button asChild variant='ghost' size='sm' className='mb-4'>
        <Link href='/organization'>
          <ArrowLeft className='size-4 mr-1.5' />
          Back to Organization
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='size-5' />
            Edit Business Hours
          </CardTitle>
          <CardDescription>Set your operating hours for each day of the week</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Timezone info from city */}
          {org.city?.timezone && (
            <div className='flex items-center gap-2 p-3 rounded-lg bg-muted/50 border'>
              <Globe className='size-4 text-muted-foreground' />
              <span className='text-sm'>
                Timezone: <span className='font-medium'>{org.city.timezone}</span>
              </span>
              <span className='text-xs text-muted-foreground'>(based on your city)</span>
            </div>
          )}

          {/* Days */}
          <div className='space-y-3'>
            {DAYS.map(({ key, label }) => {
              const dayHours = hours[key];
              return (
                <div
                  key={key}
                  className={cn(
                    'p-4 rounded-lg border',
                    dayHours.closed && 'bg-muted/50'
                  )}
                >
                  <div className='flex items-center justify-between mb-3'>
                    <span className='font-medium'>{label}</span>
                    <div className='flex items-center gap-2'>
                      <Label htmlFor={`${key}-closed`} className='text-sm text-muted-foreground'>
                        Closed
                      </Label>
                      <Switch
                        id={`${key}-closed`}
                        checked={dayHours.closed}
                        onCheckedChange={(checked) => handleDayChange(key, 'closed', checked)}
                      />
                    </div>
                  </div>
                  
                  {!dayHours.closed && (
                    <div className='flex items-center gap-3'>
                      <div className='flex-1'>
                        <Label className='text-xs text-muted-foreground'>Opens</Label>
                        <Input
                          type='time'
                          value={dayHours.open}
                          onChange={(e) => handleDayChange(key, 'open', e.target.value)}
                        />
                      </div>
                      <span className='pt-5 text-muted-foreground'>to</span>
                      <div className='flex-1'>
                        <Label className='text-xs text-muted-foreground'>Closes</Label>
                        <Input
                          type='time'
                          value={dayHours.close}
                          onChange={(e) => handleDayChange(key, 'close', e.target.value)}
                        />
                      </div>
                      {(key === 'monday' || key === 'saturday' || key === 'sunday') && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='mt-5'
                          onClick={() => copyToAllWeekdays(key)}
                          title={key === 'monday' ? 'Copy to all weekdays' : 'Copy to weekdays'}
                        >
                          <Copy className='size-4' />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className='size-4 mr-2 animate-spin' />}
              Save Hours
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
