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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Bell,
  Mail,
  Smartphone,
  Loader2,
  AlertCircle,
  Save,
  Car,
  Star,
  DollarSign,
  Heart,
  Shield,
  Gift,
  Settings,
  Building2,
  Lock,
  Moon,
  Inbox,
} from 'lucide-react';

const categoryConfig = [
  { key: 'bookingEnabled', label: 'Booking Updates', description: 'Confirmations, reminders, and status changes', icon: Car },
  { key: 'listingEnabled', label: 'Listing Activity', description: 'When your favorites have updates', icon: Car },
  { key: 'reviewEnabled', label: 'Reviews', description: 'When you receive new reviews', icon: Star },
  { key: 'financialEnabled', label: 'Payments', description: 'Payment confirmations and receipts', icon: DollarSign },
  { key: 'favoriteEnabled', label: 'Favorites', description: 'Price drops and availability updates', icon: Heart },
  { key: 'verificationEnabled', label: 'Verification', description: 'Account verification status', icon: Shield },
  { key: 'organizationEnabled', label: 'Organization', description: 'Team and membership updates', icon: Building2 },
  { key: 'systemEnabled', label: 'System', description: 'Platform announcements and updates', icon: Settings },
  { key: 'promotionalEnabled', label: 'Promotions', description: 'Special offers and discounts', icon: Gift },
  { key: 'securityEnabled', label: 'Security', description: 'Login alerts and security updates', icon: Lock },
] as const;

export default function NotificationsSettingsPage() {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading, error } = useQuery(
    orpc.notifications.getPreferences.queryOptions({ input: {} })
  );

  const form = useForm<UpdateNotificationPreferencesInputType>({
    defaultValues: {
      // Categories
      bookingEnabled: true,
      listingEnabled: true,
      reviewEnabled: true,
      organizationEnabled: true,
      financialEnabled: true,
      favoriteEnabled: true,
      verificationEnabled: true,
      systemEnabled: true,
      promotionalEnabled: false,
      securityEnabled: true,
      // Email by priority
      emailForHigh: true,
      emailForMedium: true,
      emailForLow: false,
      // Push by priority
      pushForHigh: true,
      pushForMedium: true,
      pushForLow: false,
      // SMS by priority
      smsForHigh: false,
      smsForMedium: false,
      smsForLow: false,
      // Quiet hours
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      // Digest
      emailDigestEnabled: false,
      emailDigestFrequency: 'daily',
    },
  });

  useEffect(() => {
    if (preferences) {
      form.reset({
        bookingEnabled: preferences.bookingEnabled,
        listingEnabled: preferences.listingEnabled,
        reviewEnabled: preferences.reviewEnabled,
        organizationEnabled: preferences.organizationEnabled,
        financialEnabled: preferences.financialEnabled,
        favoriteEnabled: preferences.favoriteEnabled,
        verificationEnabled: preferences.verificationEnabled,
        systemEnabled: preferences.systemEnabled,
        promotionalEnabled: preferences.promotionalEnabled,
        securityEnabled: preferences.securityEnabled,
        emailForHigh: preferences.emailForHigh,
        emailForMedium: preferences.emailForMedium,
        emailForLow: preferences.emailForLow,
        pushForHigh: preferences.pushForHigh,
        pushForMedium: preferences.pushForMedium,
        pushForLow: preferences.pushForLow,
        smsForHigh: preferences.smsForHigh,
        smsForMedium: preferences.smsForMedium,
        smsForLow: preferences.smsForLow,
        quietHoursEnabled: preferences.quietHoursEnabled,
        quietHoursStart: preferences.quietHoursStart || '22:00',
        quietHoursEnd: preferences.quietHoursEnd || '08:00',
        emailDigestEnabled: preferences.emailDigestEnabled,
        emailDigestFrequency: preferences.emailDigestFrequency || 'daily',
      });
    }
  }, [preferences, form]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateNotificationPreferencesInputType) =>
      orpc.notifications.updatePreferences.call(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification preferences updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update preferences');
    },
  });

  const onSubmit = (data: UpdateNotificationPreferencesInputType) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertDescription>Failed to load notification preferences</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Notification Preferences</h2>
        <p className='text-muted-foreground'>Choose what notifications you want to receive</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Notification Categories */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Bell className='size-5' />
              Notification Categories
            </CardTitle>
            <CardDescription>Choose which types of notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {categoryConfig.map((category, index) => (
              <div key={category.key}>
                {index > 0 && <Separator className='my-4' />}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='size-9 rounded-lg bg-muted flex items-center justify-center'>
                      <category.icon className='size-4 text-muted-foreground' />
                    </div>
                    <div className='space-y-0.5'>
                      <Label htmlFor={category.key} className='font-medium'>
                        {category.label}
                      </Label>
                      <p className='text-sm text-muted-foreground'>{category.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={category.key}
                    checked={form.watch(category.key as keyof UpdateNotificationPreferencesInputType) as boolean}
                    onCheckedChange={(checked) =>
                      form.setValue(category.key as keyof UpdateNotificationPreferencesInputType, checked)
                    }
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Email Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Mail className='size-5' />
              Email Notifications
            </CardTitle>
            <CardDescription>Control when we send you emails based on notification priority</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='emailForHigh' className='font-medium'>
                  High Priority
                </Label>
                <p className='text-sm text-muted-foreground'>Important updates like booking confirmations</p>
              </div>
              <Switch
                id='emailForHigh'
                checked={form.watch('emailForHigh')}
                onCheckedChange={(checked) => form.setValue('emailForHigh', checked)}
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='emailForMedium' className='font-medium'>
                  Medium Priority
                </Label>
                <p className='text-sm text-muted-foreground'>Regular updates and reminders</p>
              </div>
              <Switch
                id='emailForMedium'
                checked={form.watch('emailForMedium')}
                onCheckedChange={(checked) => form.setValue('emailForMedium', checked)}
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='emailForLow' className='font-medium'>
                  Low Priority
                </Label>
                <p className='text-sm text-muted-foreground'>General updates and suggestions</p>
              </div>
              <Switch
                id='emailForLow'
                checked={form.watch('emailForLow')}
                onCheckedChange={(checked) => form.setValue('emailForLow', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Bell className='size-5' />
              Push Notifications
            </CardTitle>
            <CardDescription>Control browser and mobile push notifications</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='pushForHigh' className='font-medium'>
                  High Priority
                </Label>
                <p className='text-sm text-muted-foreground'>Urgent notifications</p>
              </div>
              <Switch
                id='pushForHigh'
                checked={form.watch('pushForHigh')}
                onCheckedChange={(checked) => form.setValue('pushForHigh', checked)}
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='pushForMedium' className='font-medium'>
                  Medium Priority
                </Label>
                <p className='text-sm text-muted-foreground'>Regular push notifications</p>
              </div>
              <Switch
                id='pushForMedium'
                checked={form.watch('pushForMedium')}
                onCheckedChange={(checked) => form.setValue('pushForMedium', checked)}
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='pushForLow' className='font-medium'>
                  Low Priority
                </Label>
                <p className='text-sm text-muted-foreground'>Non-urgent notifications</p>
              </div>
              <Switch
                id='pushForLow'
                checked={form.watch('pushForLow')}
                onCheckedChange={(checked) => form.setValue('pushForLow', checked)}
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
            <CardDescription>Text message notifications (standard rates may apply)</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='smsForHigh' className='font-medium'>
                  High Priority Only
                </Label>
                <p className='text-sm text-muted-foreground'>Only critical updates via SMS</p>
              </div>
              <Switch
                id='smsForHigh'
                checked={form.watch('smsForHigh')}
                onCheckedChange={(checked) => form.setValue('smsForHigh', checked)}
              />
            </div>

            <Separator />

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='smsForMedium' className='font-medium'>
                  Medium Priority
                </Label>
                <p className='text-sm text-muted-foreground'>Regular SMS updates</p>
              </div>
              <Switch
                id='smsForMedium'
                checked={form.watch('smsForMedium')}
                onCheckedChange={(checked) => form.setValue('smsForMedium', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Moon className='size-5' />
              Quiet Hours
            </CardTitle>
            <CardDescription>Pause non-urgent notifications during specific hours</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='quietHoursEnabled' className='font-medium'>
                  Enable Quiet Hours
                </Label>
                <p className='text-sm text-muted-foreground'>Only urgent notifications during these hours</p>
              </div>
              <Switch
                id='quietHoursEnabled'
                checked={form.watch('quietHoursEnabled')}
                onCheckedChange={(checked) => form.setValue('quietHoursEnabled', checked)}
              />
            </div>

            {form.watch('quietHoursEnabled') && (
              <>
                <Separator />
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='quietHoursStart'>Start Time</Label>
                    <Input
                      id='quietHoursStart'
                      type='time'
                      value={form.watch('quietHoursStart') || '22:00'}
                      onChange={(e) => form.setValue('quietHoursStart', e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='quietHoursEnd'>End Time</Label>
                    <Input
                      id='quietHoursEnd'
                      type='time'
                      value={form.watch('quietHoursEnd') || '08:00'}
                      onChange={(e) => form.setValue('quietHoursEnd', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Email Digest */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Inbox className='size-5' />
              Email Digest
            </CardTitle>
            <CardDescription>Receive a summary of your notifications</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='emailDigestEnabled' className='font-medium'>
                  Enable Email Digest
                </Label>
                <p className='text-sm text-muted-foreground'>Get a summary instead of individual emails</p>
              </div>
              <Switch
                id='emailDigestEnabled'
                checked={form.watch('emailDigestEnabled')}
                onCheckedChange={(checked) => form.setValue('emailDigestEnabled', checked)}
              />
            </div>

            {form.watch('emailDigestEnabled') && (
              <>
                <Separator />
                <div className='space-y-2'>
                  <Label htmlFor='emailDigestFrequency'>Frequency</Label>
                  <Select
                    value={form.watch('emailDigestFrequency') || 'daily'}
                    onValueChange={(value) => form.setValue('emailDigestFrequency', value as 'daily' | 'weekly')}
                  >
                    <SelectTrigger id='emailDigestFrequency'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='daily'>Daily</SelectItem>
                      <SelectItem value='weekly'>Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
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
      {Array.from({ length: 3 }).map((_, cardIndex) => (
        <Card key={cardIndex}>
          <CardHeader>
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-4 w-64' />
          </CardHeader>
          <CardContent className='space-y-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='size-9 rounded-lg' />
                  <div>
                    <Skeleton className='h-4 w-32 mb-1' />
                    <Skeleton className='h-3 w-48' />
                  </div>
                </div>
                <Skeleton className='h-6 w-10 rounded-full' />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
