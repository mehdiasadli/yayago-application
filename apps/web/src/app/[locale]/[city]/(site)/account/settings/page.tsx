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
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  User,
  Loader2,
  AlertCircle,
  Save,
  Camera,
  Sparkles,
  AtSign,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { AvatarUpload } from '@/components/avatar-upload';
import { cn } from '@/lib/utils';

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
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        displayUsername: profile.displayUsername || '',
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
      <Alert variant='destructive' className='rounded-2xl'>
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
  const hasChanges = form.formState.isDirty || avatarValue !== undefined;

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500/10 via-indigo-500/10 to-violet-500/10 p-6 sm:p-8'>
        {/* Decorative elements */}
        <div className='absolute top-0 right-0 size-32 rounded-full bg-blue-500/10 blur-3xl' />
        <div className='absolute bottom-0 left-0 size-24 rounded-full bg-violet-500/10 blur-2xl' />
        
        <div className='relative flex items-center gap-4'>
          <div className='flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25'>
            <User className='size-7 text-white' />
          </div>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Profile Settings</h2>
            <p className='text-muted-foreground'>
              Manage your public profile information
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Avatar Section */}
        <Card className='overflow-hidden rounded-2xl border-0 shadow-sm bg-linear-to-br from-card to-card/80'>
          <CardHeader className='border-b bg-muted/30 pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/20'>
                <Camera className='size-5 text-white' />
              </div>
              <div>
                <CardTitle className='text-lg'>Profile Photo</CardTitle>
                <CardDescription>This will be displayed on your profile and reviews</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='flex flex-col sm:flex-row items-center gap-6'>
              <div className='relative'>
                <AvatarUpload
                  value={displayAvatarValue}
                  onChange={handleAvatarChange}
                  fallback={profile.name?.charAt(0).toUpperCase()}
                  size='xl'
                  disabled={updateMutation.isPending}
                />
                {/* Status indicator */}
                {avatarValue !== undefined && (
                  <div className={cn(
                    'absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-background',
                    avatarValue ? 'bg-emerald-500' : 'bg-amber-500'
                  )}>
                    {avatarValue ? (
                      <CheckCircle2 className='size-3.5 text-white' />
                    ) : (
                      <Info className='size-3.5 text-white' />
                    )}
                  </div>
                )}
              </div>
              <div className='space-y-3 text-center sm:text-left'>
                <div>
                  <p className='font-medium'>Upload a new photo</p>
                  <p className='text-sm text-muted-foreground'>
                    Click to upload or drag and drop
                  </p>
                </div>
                <div className='flex flex-wrap items-center justify-center sm:justify-start gap-2'>
                  <span className='inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium'>
                    JPG
                  </span>
                  <span className='inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium'>
                    PNG
                  </span>
                  <span className='inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium'>
                    WebP
                  </span>
                  <span className='text-xs text-muted-foreground'>Max 5MB</span>
                </div>
                {avatarValue !== undefined && (
                  <div className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
                    avatarValue 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  )}>
                    {avatarValue ? (
                      <>
                        <Sparkles className='size-3.5' />
                        New photo selected
                      </>
                    ) : (
                      <>
                        <Info className='size-3.5' />
                        Photo will be removed
                      </>
                    )}
                    <span className='text-muted-foreground'>— Save to apply</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className='overflow-hidden rounded-2xl border-0 shadow-sm bg-linear-to-br from-card to-card/80'>
          <CardHeader className='border-b bg-muted/30 pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/20'>
                <AtSign className='size-5 text-white' />
              </div>
              <div>
                <CardTitle className='text-lg'>Basic Information</CardTitle>
                <CardDescription>Your name and username visible to others</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='grid gap-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='name' className='text-sm font-medium'>
                  Display Name <span className='text-destructive'>*</span>
                </Label>
                <div className='relative'>
                  <Input 
                    id='name' 
                    placeholder='Your full name' 
                    className='h-11 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all'
                    {...form.register('name')} 
                  />
                </div>
                {form.formState.errors.name ? (
                  <p className='text-sm text-destructive flex items-center gap-1.5'>
                    <AlertCircle className='size-3.5' />
                    {form.formState.errors.name.message}
                  </p>
                ) : (
                  <p className='text-xs text-muted-foreground'>
                    This name will be shown publicly
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='displayUsername' className='text-sm font-medium'>
                  Username
                </Label>
                <div className='relative'>
                  <div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                    @
                  </div>
                  <Input 
                    id='displayUsername' 
                    placeholder='username' 
                    className='h-11 rounded-xl bg-muted/50 border-0 pl-8 focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all'
                    {...form.register('displayUsername')} 
                  />
                </div>
                {form.formState.errors.displayUsername ? (
                  <p className='text-sm text-destructive flex items-center gap-1.5'>
                    <AlertCircle className='size-3.5' />
                    {form.formState.errors.displayUsername.message}
                  </p>
                ) : (
                  <p className='text-xs text-muted-foreground'>
                    Optional unique identifier
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className='flex items-center justify-between rounded-2xl bg-muted/30 p-4'>
          <div className='text-sm text-muted-foreground'>
            {hasChanges ? (
              <span className='flex items-center gap-1.5 text-amber-600 dark:text-amber-400'>
                <div className='size-2 rounded-full bg-amber-500 animate-pulse' />
                You have unsaved changes
              </span>
            ) : (
              <span className='flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400'>
                <CheckCircle2 className='size-4' />
                All changes saved
              </span>
            )}
          </div>
          <Button 
            type='submit' 
            disabled={updateMutation.isPending || !hasChanges}
            className='h-11 rounded-xl px-6 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all'
          >
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

function ProfileSkeleton() {
  return (
    <div className='space-y-8'>
      {/* Header skeleton */}
      <div className='rounded-2xl bg-muted/30 p-6 sm:p-8'>
        <div className='flex items-center gap-4'>
          <Skeleton className='size-14 rounded-2xl' />
          <div className='space-y-2'>
            <Skeleton className='h-7 w-48' />
            <Skeleton className='h-4 w-64' />
          </div>
        </div>
      </div>

      {/* Avatar card skeleton */}
      <Card className='rounded-2xl border-0 shadow-sm'>
        <CardHeader className='border-b bg-muted/30 pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-10 rounded-xl' />
            <div className='space-y-1.5'>
              <Skeleton className='h-5 w-28' />
              <Skeleton className='h-4 w-48' />
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='flex items-center gap-6'>
            <Skeleton className='size-32 rounded-full' />
            <div className='space-y-3'>
              <Skeleton className='h-5 w-40' />
              <Skeleton className='h-4 w-56' />
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-12 rounded-full' />
                <Skeleton className='h-6 w-12 rounded-full' />
                <Skeleton className='h-6 w-12 rounded-full' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form card skeleton */}
      <Card className='rounded-2xl border-0 shadow-sm'>
        <CardHeader className='border-b bg-muted/30 pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-10 rounded-xl' />
            <div className='space-y-1.5'>
              <Skeleton className='h-5 w-36' />
              <Skeleton className='h-4 w-52' />
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='grid gap-6 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-11 w-full rounded-xl' />
              <Skeleton className='h-3 w-40' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-11 w-full rounded-xl' />
              <Skeleton className='h-3 w-36' />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit skeleton */}
      <div className='flex items-center justify-between rounded-2xl bg-muted/30 p-4'>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='h-11 w-32 rounded-xl' />
      </div>
    </div>
  );
}
