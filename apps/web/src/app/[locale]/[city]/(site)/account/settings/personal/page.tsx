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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, MapPin, Phone, Loader2, AlertCircle, Save, UserCheck } from 'lucide-react';
import { useEffect } from 'react';

export default function PersonalInfoPage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery(orpc.users.getMyProfile.queryOptions());

  const form = useForm<UpdatePersonalInfoInputType>({
    resolver: zodResolver(UpdatePersonalInfoInputSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
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

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
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
      <Alert variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertDescription>Failed to load profile</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Personal Information</h2>
        <p className='text-muted-foreground'>Manage your contact and address details</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Legal Name */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='size-5' />
              Legal Name
            </CardTitle>
            <CardDescription>
              This should match your official ID for verification purposes
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstName'>First Name</Label>
                <Input
                  id='firstName'
                  placeholder='John'
                  {...form.register('firstName')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName'>Last Name</Label>
                <Input
                  id='lastName'
                  placeholder='Doe'
                  {...form.register('lastName')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Phone className='size-5' />
              Contact Information
            </CardTitle>
            <CardDescription>
              How we can reach you about your bookings
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='phoneNumber'>Phone Number</Label>
              <Input
                id='phoneNumber'
                placeholder='+971 50 123 4567'
                {...form.register('phoneNumber')}
              />
              <p className='text-xs text-muted-foreground'>
                Include country code for international format
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MapPin className='size-5' />
              Address
            </CardTitle>
            <CardDescription>
              Your billing and delivery address
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='addressLine1'>Address Line 1</Label>
              <Input
                id='addressLine1'
                placeholder='Street address, P.O. box'
                {...form.register('addressLine1')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='addressLine2'>Address Line 2</Label>
              <Input
                id='addressLine2'
                placeholder='Apartment, suite, unit, building, floor, etc.'
                {...form.register('addressLine2')}
              />
            </div>
            <div className='grid sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='addressCity'>City</Label>
                <Input
                  id='addressCity'
                  placeholder='Dubai'
                  {...form.register('addressCity')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='addressState'>State / Province</Label>
                <Input
                  id='addressState'
                  placeholder='Dubai'
                  {...form.register('addressState')}
                />
              </div>
            </div>
            <div className='grid sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='addressCountry'>Country</Label>
                <Input
                  id='addressCountry'
                  placeholder='United Arab Emirates'
                  {...form.register('addressCountry')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='addressZipCode'>ZIP / Postal Code</Label>
                <Input
                  id='addressZipCode'
                  placeholder='00000'
                  {...form.register('addressZipCode')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <UserCheck className='size-5' />
              Emergency Contact
            </CardTitle>
            <CardDescription>
              Someone we can contact in case of emergency during your rental
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='emergencyContactName'>Contact Name</Label>
                <Input
                  id='emergencyContactName'
                  placeholder='Jane Doe'
                  {...form.register('emergencyContactName')}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='emergencyContactPhone'>Contact Phone</Label>
                <Input
                  id='emergencyContactPhone'
                  placeholder='+971 50 123 4567'
                  {...form.register('emergencyContactPhone')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className='flex justify-end'>
          <Button type='submit' disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className='size-4 mr-2 animate-spin' />
            ) : (
              <Save className='size-4 mr-2' />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

function PersonalInfoSkeleton() {
  return (
    <div className='space-y-6'>
      <div>
        <Skeleton className='h-8 w-48 mb-2' />
        <Skeleton className='h-4 w-72' />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className='h-5 w-32' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

