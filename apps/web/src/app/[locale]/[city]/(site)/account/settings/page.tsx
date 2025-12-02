'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DropdownNavProps, DropdownProps } from 'react-day-picker';
import { orpc } from '@/utils/orpc';
import { UpdateProfileInputSchema, type UpdateProfileInputType } from '@yayago-app/validators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// Helper for custom calendar dropdowns
const handleCalendarChange = (_value: string | number, _e: React.ChangeEventHandler<HTMLSelectElement>) => {
  const _event = {
    target: {
      value: String(_value),
    },
  } as React.ChangeEvent<HTMLSelectElement>;
  _e(_event);
};

// Custom calendar dropdown components for better month/year selection
const CalendarDropdown = (props: DropdownProps) => {
  return (
    <Select
      onValueChange={(value) => {
        if (props.onChange) {
          handleCalendarChange(value, props.onChange);
        }
      }}
      value={String(props.value)}
    >
      <SelectTrigger className='h-8 w-fit font-medium first:grow'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className='max-h-[min(26rem,var(--radix-select-content-available-height))]'>
        {props.options?.map((option) => (
          <SelectItem disabled={option.disabled} key={option.value} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const CalendarDropdownNav = (props: DropdownNavProps) => {
  return <div className='flex w-full items-center gap-2'>{props.children}</div>;
};

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient();

  // Track the current avatar value separately for proper state management
  // undefined = unchanged, '' = removed, 'data:...' or 'http...' = new/existing image
  const [avatarValue, setAvatarValue] = useState<string | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: profile, isLoading } = useQuery(orpc.users.getMyProfile.queryOptions());

  const form = useForm<UpdateProfileInputType>({
    resolver: zodResolver(UpdateProfileInputSchema),
    defaultValues: {
      name: '',
      displayUsername: '',
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

  const handleDateSelect = (date: Date | undefined) => {
    form.setValue('dateOfBirth', date || null, { shouldDirty: true });
    setCalendarOpen(false);
  };

  const handleGenderChange = (value: string) => {
    form.setValue('gender', value as UpdateProfileInputType['gender'], { shouldDirty: true });
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

  const selectedDate = form.watch('dateOfBirth');

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

            <div className='grid sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Date of Birth</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {selectedDate ? format(new Date(selectedDate), 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={selectedDate ? new Date(selectedDate) : undefined}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        const today = new Date();
                        const minAge = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate());
                        return date > minAge || date < new Date('1900-01-01');
                      }}
                      captionLayout='dropdown'
                      hideNavigation
                      classNames={{
                        month_caption: 'mx-0',
                      }}
                      components={{
                        Dropdown: CalendarDropdown,
                        DropdownNav: CalendarDropdownNav,
                      }}
                      startMonth={new Date(1940, 0)}
                      endMonth={new Date(new Date().getFullYear() - 14, 11)}
                      defaultMonth={selectedDate ? new Date(selectedDate) : new Date(2000, 0)}
                    />
                  </PopoverContent>
                </Popover>
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
        </CardContent>
      </Card>
    </div>
  );
}
