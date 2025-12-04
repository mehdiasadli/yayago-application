'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { UpdatePersonalInfoInputSchema, type UpdatePersonalInfoInputType } from '@yayago-app/validators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  MapPin,
  Phone,
  Loader2,
  AlertCircle,
  Save,
  UserCheck,
  CheckCircle2,
  Shield,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link } from '@/lib/navigation/navigation-client';
import { cn } from '@/lib/utils';

export default function PersonalInfoPage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery(orpc.users.getMyProfile.queryOptions());

  const form = useForm<UpdatePersonalInfoInputType>({
    resolver: zodResolver(UpdatePersonalInfoInputSchema),
    defaultValues: {
      addressLine1: '',
      addressLine2: '',
      addressCity: '',
      addressState: '',
      addressCountry: '',
      addressZipCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        addressLine1: profile.addressLine1 || '',
        addressLine2: profile.addressLine2 || '',
        addressCity: profile.addressCity || '',
        addressState: profile.addressState || '',
        addressCountry: profile.addressCountry || '',
        addressZipCode: profile.addressZipCode || '',
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || '',
      });
    }
  }, [profile, form]);

  const updateMutation = useMutation(
    orpc.users.updatePersonalInfo.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Personal information updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update personal information');
      },
    })
  );

  const onSubmit = (data: UpdatePersonalInfoInputType) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <PersonalInfoSkeleton />;
  }

  if (!profile) {
    return (
      <Alert variant='destructive' className='rounded-2xl'>
        <AlertCircle className='size-4' />
        <AlertDescription>Failed to load profile</AlertDescription>
      </Alert>
    );
  }

  const hasChanges = form.formState.isDirty;
  const isPhoneVerified = profile.phoneNumberVerified;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10'>
          <Shield className='size-6 text-primary' />
        </div>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Personal Information</h2>
          <p className='text-muted-foreground'>Manage your contact and address details</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Phone Number (Read-only) */}
        <Card className='rounded-2xl'>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                  <Phone className='size-4 text-muted-foreground' />
                </div>
                <div>
                  <CardTitle className='text-base'>Phone Number</CardTitle>
                  <CardDescription className='text-sm'>
                    Your verified contact number
                  </CardDescription>
                </div>
              </div>
              {isPhoneVerified ? (
                <Badge variant='secondary' className='gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0'>
                  <CheckCircle2 className='size-3.5' />
                  Verified
                </Badge>
              ) : (
                <Badge variant='secondary' className='gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0'>
                  <Info className='size-3.5' />
                  Not verified
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <Input
                  value={profile.phoneNumber || ''}
                  readOnly
                  disabled
                  className='h-11 bg-muted/50 text-muted-foreground'
                  placeholder='No phone number'
                />
              </div>
              <div className='flex items-center justify-between rounded-xl bg-muted/50 p-3'>
                <p className='text-sm text-muted-foreground'>
                  {isPhoneVerified 
                    ? 'Your phone number is verified and ready for booking notifications.'
                    : 'Verify your phone number to receive booking updates and notifications.'}
                </p>
                <Button variant='outline' size='sm' asChild className='shrink-0 ml-3'>
                  <Link href='/account'>
                    {isPhoneVerified ? 'Update' : 'Verify'}
                    <ExternalLink className='size-3.5 ml-1.5' />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className='rounded-2xl'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                <MapPin className='size-4 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-base'>Address</CardTitle>
                <CardDescription className='text-sm'>
                  Your billing and delivery address
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='addressLine1'>Street Address</Label>
              <Input
                id='addressLine1'
                placeholder='Street address, P.O. box'
                className='h-11'
                {...form.register('addressLine1')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='addressLine2'>
                Apartment / Suite
                <span className='text-muted-foreground font-normal ml-1.5'>(optional)</span>
              </Label>
              <Input
                id='addressLine2'
                placeholder='Apartment, suite, unit, building, floor'
                className='h-11'
                {...form.register('addressLine2')}
              />
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='addressCity'>City</Label>
                <Input
                  id='addressCity'
                  placeholder='Dubai'
                  className='h-11'
                  {...form.register('addressCity')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='addressState'>State / Province</Label>
                <Input
                  id='addressState'
                  placeholder='Dubai'
                  className='h-11'
                  {...form.register('addressState')}
                />
              </div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='addressCountry'>Country</Label>
                <Input
                  id='addressCountry'
                  placeholder='United Arab Emirates'
                  className='h-11'
                  {...form.register('addressCountry')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='addressZipCode'>ZIP / Postal Code</Label>
                <Input
                  id='addressZipCode'
                  placeholder='00000'
                  className='h-11'
                  {...form.register('addressZipCode')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className='rounded-2xl'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                <UserCheck className='size-4 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-base'>Emergency Contact</CardTitle>
                <CardDescription className='text-sm'>
                  Someone we can contact in case of emergency during your rental
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='emergencyContactName'>Contact Name</Label>
                <Input
                  id='emergencyContactName'
                  placeholder='Full name'
                  className='h-11'
                  {...form.register('emergencyContactName')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='emergencyContactPhone'>Contact Phone</Label>
                <Input
                  id='emergencyContactPhone'
                  placeholder='+971 50 123 4567'
                  className='h-11'
                  {...form.register('emergencyContactPhone')}
                />
              </div>
            </div>
            <p className='text-xs text-muted-foreground mt-3'>
              This contact will only be used in emergency situations related to your rental.
            </p>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className='flex items-center justify-between rounded-2xl border bg-card p-4'>
          <div className='text-sm'>
            {hasChanges ? (
              <span className='flex items-center gap-1.5 text-amber-600 dark:text-amber-400'>
                <div className='size-2 rounded-full bg-amber-500 animate-pulse' />
                You have unsaved changes
              </span>
            ) : (
              <span className='flex items-center gap-1.5 text-muted-foreground'>
                <CheckCircle2 className='size-4' />
                All changes saved
              </span>
            )}
          </div>
          <Button type='submit' disabled={updateMutation.isPending || !hasChanges} className='h-10'>
            {updateMutation.isPending ? (
              <>
                <Loader2 className='size-4 mr-2 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save className='size-4 mr-2' />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function PersonalInfoSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Skeleton className='size-12 rounded-2xl' />
        <div className='space-y-2'>
          <Skeleton className='h-7 w-48' />
          <Skeleton className='h-4 w-64' />
        </div>
      </div>

      {/* Phone card skeleton */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Skeleton className='size-9 rounded-xl' />
              <div className='space-y-1.5'>
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-3 w-40' />
              </div>
            </div>
            <Skeleton className='h-6 w-20 rounded-full' />
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <Skeleton className='h-11 w-full' />
            <Skeleton className='h-16 w-full rounded-xl' />
          </div>
        </CardContent>
      </Card>

      {/* Address card skeleton */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-9 rounded-xl' />
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-3 w-44' />
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-11 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-36' />
            <Skeleton className='h-11 w-full' />
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-12' />
              <Skeleton className='h-11 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-11 w-full' />
            </div>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-11 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-11 w-full' />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency contact skeleton */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-9 rounded-xl' />
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-36' />
              <Skeleton className='h-3 w-60' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-11 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-11 w-full' />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit skeleton */}
      <div className='flex items-center justify-between rounded-2xl border p-4'>
        <Skeleton className='h-5 w-36' />
        <Skeleton className='h-10 w-28' />
      </div>
    </div>
  );
}
