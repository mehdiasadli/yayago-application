'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { type UpdateNotificationPreferencesInputType } from '@yayago-app/validators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Bell, Mail, Smartphone, Loader2, AlertCircle, Save } from 'lucide-react';

export default function NotificationsSettingsPage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery(orpc.users.getMyProfile.queryOptions());

  const form = useForm<UpdateNotificationPreferencesInputType>({
    defaultValues: {
      emailBookingConfirmation: true,
      emailBookingReminder: true,
      emailPromotions: false,
      emailNewsletter: false,
      smsBookingUpdates: false,
    },
  });

  useEffect(() => {
    if (profile?.notificationPreferences) {
      form.reset(profile.notificationPreferences);
    }
  }, [profile, form]);

  const updateMutation = useMutation(
    orpc.users.updateNotificationPreferences.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Notification preferences updated');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update preferences');
      },
    })
  );

  const onSubmit = (data: UpdateNotificationPreferencesInputType) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <NotificationsSkeleton />;
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
        <h2 className='text-2xl font-bold'>Notification Preferences</h2>
        <p className='text-muted-foreground'>Choose how you want to be notified</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Mail className='size-5' />
              Email Notifications
            </CardTitle>
            <CardDescription>Manage what emails you receive from YayaGO</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='emailBookingConfirmation' className='font-medium'>
                  Booking Confirmations
                </Label>
                <p className='text-sm text-muted-foreground'>
                  Receive confirmation emails when you book a vehicle
                </p>
              </div>
              <Switch
                id='emailBookingConfirmation'
                checked={form.watch('emailBookingConfirmation')}
                onCheckedChange={(checked) =>
                  form.setValue('emailBookingConfirmation', checked)
                }
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='emailBookingReminder' className='font-medium'>
                  Booking Reminders
                </Label>
                <p className='text-sm text-muted-foreground'>
                  Get reminders before your rental starts
                </p>
              </div>
              <Switch
                id='emailBookingReminder'
                checked={form.watch('emailBookingReminder')}
                onCheckedChange={(checked) =>
                  form.setValue('emailBookingReminder', checked)
                }
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='emailPromotions' className='font-medium'>
                  Promotional Emails
                </Label>
                <p className='text-sm text-muted-foreground'>
                  Receive special offers and discounts
                </p>
              </div>
              <Switch
                id='emailPromotions'
                checked={form.watch('emailPromotions')}
                onCheckedChange={(checked) =>
                  form.setValue('emailPromotions', checked)
                }
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='emailNewsletter' className='font-medium'>
                  Newsletter
                </Label>
                <p className='text-sm text-muted-foreground'>
                  Monthly updates about new features and tips
                </p>
              </div>
              <Switch
                id='emailNewsletter'
                checked={form.watch('emailNewsletter')}
                onCheckedChange={(checked) =>
                  form.setValue('emailNewsletter', checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Smartphone className='size-5' />
              SMS Notifications
            </CardTitle>
            <CardDescription>Text message notifications (requires verified phone)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='smsBookingUpdates' className='font-medium'>
                  Booking Updates
                </Label>
                <p className='text-sm text-muted-foreground'>
                  Receive SMS for important booking updates
                </p>
              </div>
              <Switch
                id='smsBookingUpdates'
                checked={form.watch('smsBookingUpdates')}
                onCheckedChange={(checked) =>
                  form.setValue('smsBookingUpdates', checked)
                }
                disabled={!profile.phoneNumber || !profile.phoneNumberVerified}
              />
            </div>
            {(!profile.phoneNumber || !profile.phoneNumberVerified) && (
              <p className='text-sm text-amber-600 mt-2'>
                Please add and verify your phone number to enable SMS notifications.
              </p>
            )}
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button type='submit' disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className='size-4 mr-2 animate-spin' />
            ) : (
              <Save className='size-4 mr-2' />
            )}
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className='space-y-6'>
      <div>
        <Skeleton className='h-8 w-56 mb-2' />
        <Skeleton className='h-4 w-64' />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-40' />
        </CardHeader>
        <CardContent className='space-y-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='flex items-center justify-between'>
              <div>
                <Skeleton className='h-4 w-32 mb-1' />
                <Skeleton className='h-3 w-48' />
              </div>
              <Skeleton className='h-6 w-10 rounded-full' />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

