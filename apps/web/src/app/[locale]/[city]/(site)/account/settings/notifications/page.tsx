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
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryConfig = [
  {
    key: 'bookingEnabled',
    label: 'Booking Updates',
    description: 'Confirmations, reminders, and status changes',
    icon: Car,
  },
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

type PriorityConfigItem = {
  key: 'High' | 'Medium' | 'Low';
  label: string;
  description: string;
};

const priorityConfig: PriorityConfigItem[] = [
  { key: 'High', label: 'High Priority', description: 'Important and urgent notifications' },
  { key: 'Medium', label: 'Medium Priority', description: 'Regular updates and reminders' },
  { key: 'Low', label: 'Low Priority', description: 'General updates and suggestions' },
];

export default function NotificationsSettingsPage() {
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery(orpc.notifications.getPreferences.queryOptions({ input: {} }));

  const form = useForm<UpdateNotificationPreferencesInputType>({
    defaultValues: {
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
      emailForHigh: true,
      emailForMedium: true,
      emailForLow: false,
      pushForHigh: true,
      pushForMedium: true,
      pushForLow: false,
      smsForHigh: false,
      smsForMedium: false,
      smsForLow: false,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
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
    mutationFn: (data: UpdateNotificationPreferencesInputType) => orpc.notifications.updatePreferences.call(data),
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
      <Alert variant='destructive' className='rounded-2xl'>
        <AlertCircle className='size-4' />
        <AlertDescription>Failed to load notification preferences</AlertDescription>
      </Alert>
    );
  }

  const hasChanges = form.formState.isDirty;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10'>
          <Bell className='size-6 text-primary' />
        </div>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Notification Preferences</h2>
          <p className='text-muted-foreground'>Choose what notifications you want to receive</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Notification Categories */}
        <Card className='rounded-2xl'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                <Bell className='size-4 text-muted-foreground' />
              </div>
              <div>
                <CardTitle className='text-base'>Notification Categories</CardTitle>
                <CardDescription className='text-sm'>
                  Choose which types of notifications you want to receive
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3 sm:grid-cols-2'>
              {categoryConfig.map((category) => {
                const isEnabled = form.watch(category.key as keyof UpdateNotificationPreferencesInputType) as boolean;
                return (
                  <div
                    key={category.key}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-3 transition-colors',
                      isEnabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                    )}
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className={cn(
                          'flex size-8 items-center justify-center rounded-lg',
                          isEnabled ? 'bg-primary/10' : 'bg-muted'
                        )}
                      >
                        <category.icon className={cn('size-4', isEnabled ? 'text-primary' : 'text-muted-foreground')} />
                      </div>
                      <div>
                        <Label htmlFor={category.key} className='text-sm font-medium cursor-pointer'>
                          {category.label}
                        </Label>
                        <p className='text-xs text-muted-foreground'>{category.description}</p>
                      </div>
                    </div>
                    <Switch
                      id={category.key}
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        form.setValue(category.key as keyof UpdateNotificationPreferencesInputType, checked, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Channels */}
        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Email */}
          <Card className='rounded-2xl'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                  <Mail className='size-4 text-muted-foreground' />
                </div>
                <div>
                  <CardTitle className='text-base'>Email</CardTitle>
                  <CardDescription className='text-xs'>By priority level</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              {priorityConfig.map((priority) => {
                const key = `emailFor${priority.key}` as keyof UpdateNotificationPreferencesInputType;
                const isEnabled = form.watch(key) as boolean;
                return (
                  <div key={priority.key} className='flex items-center justify-between'>
                    <Label htmlFor={key} className='text-sm cursor-pointer'>
                      {priority.label}
                    </Label>
                    <Switch
                      id={key}
                      checked={isEnabled}
                      onCheckedChange={(checked) => form.setValue(key, checked, { shouldDirty: true })}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Push */}
          <Card className='rounded-2xl'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                  <Bell className='size-4 text-muted-foreground' />
                </div>
                <div>
                  <CardTitle className='text-base'>Push</CardTitle>
                  <CardDescription className='text-xs'>Browser & mobile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              {priorityConfig.map((priority) => {
                const key = `pushFor${priority.key}` as keyof UpdateNotificationPreferencesInputType;
                const isEnabled = form.watch(key) as boolean;
                return (
                  <div key={priority.key} className='flex items-center justify-between'>
                    <Label htmlFor={key} className='text-sm cursor-pointer'>
                      {priority.label}
                    </Label>
                    <Switch
                      id={key}
                      checked={isEnabled}
                      onCheckedChange={(checked) => form.setValue(key, checked, { shouldDirty: true })}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* SMS */}
          <Card className='rounded-2xl'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                  <Smartphone className='size-4 text-muted-foreground' />
                </div>
                <div>
                  <CardTitle className='text-base'>SMS</CardTitle>
                  <CardDescription className='text-xs'>Text messages</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              {priorityConfig.slice(0, 2).map((priority) => {
                const key = `smsFor${priority.key}` as keyof UpdateNotificationPreferencesInputType;
                const isEnabled = form.watch(key) as boolean;
                return (
                  <div key={priority.key} className='flex items-center justify-between'>
                    <Label htmlFor={key} className='text-sm cursor-pointer'>
                      {priority.label}
                    </Label>
                    <Switch
                      id={key}
                      checked={isEnabled}
                      onCheckedChange={(checked) => form.setValue(key, checked, { shouldDirty: true })}
                    />
                  </div>
                );
              })}
              <p className='text-xs text-muted-foreground pt-1'>Standard rates may apply</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Settings */}
        <div className='grid gap-6 sm:grid-cols-2'>
          {/* Quiet Hours */}
          <Card className='rounded-2xl'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                  <Moon className='size-4 text-muted-foreground' />
                </div>
                <div>
                  <CardTitle className='text-base'>Quiet Hours</CardTitle>
                  <CardDescription className='text-xs'>Pause non-urgent notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='quietHoursEnabled' className='text-sm cursor-pointer'>
                  Enable Quiet Hours
                </Label>
                <Switch
                  id='quietHoursEnabled'
                  checked={form.watch('quietHoursEnabled')}
                  onCheckedChange={(checked) => form.setValue('quietHoursEnabled', checked, { shouldDirty: true })}
                />
              </div>

              {form.watch('quietHoursEnabled') && (
                <div className='grid grid-cols-2 gap-3 pt-2'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='quietHoursStart' className='text-xs text-muted-foreground'>
                      Start
                    </Label>
                    <Input
                      id='quietHoursStart'
                      type='time'
                      className='h-10'
                      value={form.watch('quietHoursStart') || '22:00'}
                      onChange={(e) => form.setValue('quietHoursStart', e.target.value, { shouldDirty: true })}
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='quietHoursEnd' className='text-xs text-muted-foreground'>
                      End
                    </Label>
                    <Input
                      id='quietHoursEnd'
                      type='time'
                      className='h-10'
                      value={form.watch('quietHoursEnd') || '08:00'}
                      onChange={(e) => form.setValue('quietHoursEnd', e.target.value, { shouldDirty: true })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Digest */}
          <Card className='rounded-2xl'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                  <Inbox className='size-4 text-muted-foreground' />
                </div>
                <div>
                  <CardTitle className='text-base'>Email Digest</CardTitle>
                  <CardDescription className='text-xs'>Receive a summary instead</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='emailDigestEnabled' className='text-sm cursor-pointer'>
                  Enable Digest
                </Label>
                <Switch
                  id='emailDigestEnabled'
                  checked={form.watch('emailDigestEnabled')}
                  onCheckedChange={(checked) => form.setValue('emailDigestEnabled', checked, { shouldDirty: true })}
                />
              </div>

              {form.watch('emailDigestEnabled') && (
                <div className='space-y-1.5 pt-2'>
                  <Label htmlFor='emailDigestFrequency' className='text-xs text-muted-foreground'>
                    Frequency
                  </Label>
                  <Select
                    value={form.watch('emailDigestFrequency') || 'daily'}
                    onValueChange={(value) =>
                      form.setValue('emailDigestFrequency', value as 'daily' | 'weekly', { shouldDirty: true })
                    }
                  >
                    <SelectTrigger id='emailDigestFrequency' className='h-10'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='daily'>Daily</SelectItem>
                      <SelectItem value='weekly'>Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Skeleton className='size-12 rounded-2xl' />
        <div className='space-y-2'>
          <Skeleton className='h-7 w-52' />
          <Skeleton className='h-4 w-72' />
        </div>
      </div>

      {/* Categories skeleton */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-9 rounded-xl' />
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-36' />
              <Skeleton className='h-3 w-56' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid gap-3 sm:grid-cols-2'>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className='flex items-center justify-between rounded-xl border p-3'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='size-8 rounded-lg' />
                  <div className='space-y-1'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-3 w-32' />
                  </div>
                </div>
                <Skeleton className='h-5 w-9 rounded-full' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery channels skeleton */}
      <div className='grid gap-6 lg:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className='rounded-2xl'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-3'>
                <Skeleton className='size-9 rounded-xl' />
                <div className='space-y-1'>
                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-3 w-24' />
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className='flex items-center justify-between'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-5 w-9 rounded-full' />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional settings skeleton */}
      <div className='grid gap-6 sm:grid-cols-2'>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className='rounded-2xl'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-3'>
                <Skeleton className='size-9 rounded-xl' />
                <div className='space-y-1'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-3 w-36' />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-5 w-9 rounded-full' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit skeleton */}
      <div className='flex items-center justify-between rounded-2xl border p-4'>
        <Skeleton className='h-5 w-36' />
        <Skeleton className='h-10 w-32' />
      </div>
    </div>
  );
}
