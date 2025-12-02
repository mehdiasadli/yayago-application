'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { UpdateProfileInputSchema, type UpdateProfileInputType } from '@yayago-app/validators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { User, Loader2, AlertCircle, CalendarIcon, Save } from 'lucide-react';
import { AvatarUpload } from '@/components/avatar-upload';

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient();

  // Track the current avatar value separately for proper state management
  // undefined = unchanged, '' = removed, 'data:...' or 'http...' = new/existing image
  const [avatarValue, setAvatarValue] = useState<string | undefined>(undefined);

  const { data: profile, isLoading } = useQuery(orpc.users.getMyProfile.queryOptions());

  const form = useForm<UpdateProfileInputType>({
    resolver: zodResolver(UpdateProfileInputSchema),
    defaultValues: {
      name: '',
      displayUsername: '',
      bio: '',
      dateOfBirth: null,
      gender: null,
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        displayUsername: profile.displayUsername || '',
        bio: profile.bio || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
        gender: profile.gender || null,
      });
      // Reset avatar value when profile loads
      setAvatarValue(undefined);
    }
  }, [profile, form]);

  const updateMutation = useMutation(
    orpc.users.updateProfile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Profile updated successfully');
        // Reset avatar value after successful save
        setAvatarValue(undefined);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update profile');
      },
    })
  );

  const handleAvatarChange = (value: string | null) => {
    // value can be:
    // - base64 string (new image uploaded)
    // - '' (empty string - user removed the image)
    // - null (shouldn't happen normally, treat as removal)
    const newValue = value === null ? '' : value;
    setAvatarValue(newValue);
    form.setValue('image', newValue || null, { shouldDirty: true });
  };

  const onSubmit = (data: UpdateProfileInputType) => {
    // Include image in the submission
    const submitData: UpdateProfileInputType = {
      ...data,
      // Only include image if it was changed
      ...(avatarValue !== undefined && { image: avatarValue || null }),
    };
    updateMutation.mutate(submitData);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertDescription>Failed to load profile</AlertDescription>
      </Alert>
    );
  }

  // Determine what avatar to display:
  // - If avatarValue is undefined (unchanged) -> use profile.image
  // - If avatarValue is '' (removed) -> show nothing
  // - If avatarValue is a string (new upload) -> show that
  const displayAvatarValue = avatarValue === undefined ? profile.image : avatarValue;

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Profile Settings</h2>
        <p className='text-muted-foreground'>Manage your public profile information</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='size-5' />
              Profile Photo
            </CardTitle>
            <CardDescription>This will be displayed on your profile and reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-6'>
              <AvatarUpload
                value={displayAvatarValue}
                onChange={handleAvatarChange}
                fallback={profile.name?.charAt(0).toUpperCase()}
                size='lg'
                disabled={updateMutation.isPending}
              />
              <div className='space-y-1'>
                <p className='text-sm font-medium'>Upload a new photo</p>
                <p className='text-xs text-muted-foreground'>
                  Click to upload or drag and drop. JPG, PNG or WebP. Max 5MB.
                </p>
                {avatarValue !== undefined && (
                  <p className='text-xs text-amber-600'>
                    {avatarValue ? 'New photo selected' : 'Photo will be removed'} - Save to apply
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your name and personal details</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Display Name *</Label>
                <Input id='name' placeholder='Your name' {...form.register('name')} />
                {form.formState.errors.name && (
                  <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='displayUsername'>Username</Label>
                <Input id='displayUsername' placeholder='@username' {...form.register('displayUsername')} />
                {form.formState.errors.displayUsername && (
                  <p className='text-sm text-destructive'>{form.formState.errors.displayUsername.message}</p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='bio'>Bio</Label>
              <Textarea
                id='bio'
                placeholder='Tell us a bit about yourself...'
                className='resize-none'
                rows={3}
                {...form.register('bio')}
              />
              <p className='text-xs text-muted-foreground'>{form.watch('bio')?.length || 0}/500 characters</p>
            </div>

            <div className='grid sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !form.watch('dateOfBirth') && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {form.watch('dateOfBirth') ? format(new Date(form.watch('dateOfBirth')!), 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={form.watch('dateOfBirth') ? new Date(form.watch('dateOfBirth')!) : undefined}
                      onSelect={(date) => form.setValue('dateOfBirth', date || null)}
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                      captionLayout='dropdown'
                      fromYear={1940}
                      toYear={new Date().getFullYear() - 18}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='gender'>Gender</Label>
                <Select
                  value={form.watch('gender') || undefined}
                  onValueChange={(value) => form.setValue('gender', value as UpdateProfileInputType['gender'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select gender' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='male'>Male</SelectItem>
                    <SelectItem value='female'>Female</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                    <SelectItem value='prefer_not_to_say'>Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
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

function ProfileSkeleton() {
  return (
    <div className='space-y-6'>
      <div>
        <Skeleton className='h-8 w-48 mb-2' />
        <Skeleton className='h-4 w-72' />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-32' />
        </CardHeader>
        <CardContent>
          <Skeleton className='size-24 rounded-full' />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-40' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-24 w-full' />
        </CardContent>
      </Card>
    </div>
  );
}
