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
  AtSign,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { AvatarUpload } from '@/components/avatar-upload';
import { cn } from '@/lib/utils';

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient();

  // Track the current avatar value separately for proper state management
  const [avatarValue, setAvatarValue] = useState<string | undefined>(undefined);

  const { data: profile, isLoading } = useQuery(orpc.users.getMyProfile.queryOptions());

  const form = useForm<UpdateProfileInputType>({
    resolver: zodResolver(UpdateProfileInputSchema),
    defaultValues: {
      name: '',
      displayUsername: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        displayUsername: profile.displayUsername || '',
      });
      setAvatarValue(undefined);
    }
  }, [profile, form]);

  const updateMutation = useMutation(
    orpc.users.updateProfile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Profile updated successfully');
        setAvatarValue(undefined);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update profile');
      },
    })
  );

  const handleAvatarChange = (value: string | null) => {
    const newValue = value === null ? '' : value;
    setAvatarValue(newValue);
    form.setValue('image', newValue || null, { shouldDirty: true });
  };

  const onSubmit = (data: UpdateProfileInputType) => {
    const submitData: UpdateProfileInputType = {
      ...data,
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

  const displayAvatarValue = avatarValue === undefined ? profile.image : avatarValue;
  const hasChanges = form.formState.isDirty || avatarValue !== undefined;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10'>
          <User className='size-6 text-primary' />
        </div>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Profile Settings</h2>
          <p className='text-muted-foreground'>Manage your public profile information</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Avatar Section */}
        <Card className='rounded-2xl'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                <Camera className='size-4 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-base'>Profile Photo</CardTitle>
                <CardDescription className='text-sm'>
                  This will be displayed on your profile and reviews
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col sm:flex-row items-center gap-6'>
              <div className='relative'>
                <AvatarUpload
                  value={displayAvatarValue}
                  onChange={handleAvatarChange}
                  fallback={profile.name?.charAt(0).toUpperCase()}
                  size='xl'
                  disabled={updateMutation.isPending}
                />
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
              <div className='space-y-2 text-center sm:text-left'>
                <div>
                  <p className='font-medium'>Upload a new photo</p>
                  <p className='text-sm text-muted-foreground'>
                    Click to upload or drag and drop
                  </p>
                </div>
                <div className='flex flex-wrap items-center justify-center sm:justify-start gap-2'>
                  <span className='inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs'>
                    JPG
                  </span>
                  <span className='inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs'>
                    PNG
                  </span>
                  <span className='inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs'>
                    WebP
                  </span>
                  <span className='text-xs text-muted-foreground'>Max 5MB</span>
                </div>
                {avatarValue !== undefined && (
                  <p className={cn(
                    'text-sm',
                    avatarValue ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  )}>
                    {avatarValue ? 'New photo selected' : 'Photo will be removed'} — Save to apply
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className='rounded-2xl'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                <AtSign className='size-4 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-base'>Basic Information</CardTitle>
                <CardDescription className='text-sm'>
                  Your name and username visible to others
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='name'>
                  Display Name <span className='text-destructive'>*</span>
                </Label>
                <Input 
                  id='name' 
                  placeholder='Your full name' 
                  className='h-11'
                  {...form.register('name')} 
                />
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
                <Label htmlFor='displayUsername'>Username</Label>
                <div className='relative'>
                  <div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                    @
                  </div>
                  <Input 
                    id='displayUsername' 
                    placeholder='username' 
                    className='h-11 pl-8'
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
          <Button 
            type='submit' 
            disabled={updateMutation.isPending || !hasChanges}
            className='h-10'
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
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Skeleton className='size-12 rounded-2xl' />
        <div className='space-y-2'>
          <Skeleton className='h-7 w-40' />
          <Skeleton className='h-4 w-56' />
        </div>
      </div>

      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-9 rounded-xl' />
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3 w-48' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-6'>
            <Skeleton className='size-32 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-5 w-36' />
              <Skeleton className='h-4 w-48' />
              <div className='flex gap-2'>
                <Skeleton className='h-5 w-10 rounded-full' />
                <Skeleton className='h-5 w-10 rounded-full' />
                <Skeleton className='h-5 w-10 rounded-full' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-9 rounded-xl' />
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-44' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid gap-6 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-11 w-full' />
              <Skeleton className='h-3 w-40' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-11 w-full' />
              <Skeleton className='h-3 w-36' />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='flex items-center justify-between rounded-2xl border p-4'>
        <Skeleton className='h-5 w-36' />
        <Skeleton className='h-10 w-28' />
      </div>
    </div>
  );
}
