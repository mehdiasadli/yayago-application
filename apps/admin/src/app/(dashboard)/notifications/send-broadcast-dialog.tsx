'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { SendBroadcastInputSchema, type SendBroadcastInputType } from '@yayago-app/validators';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Megaphone, Loader2, Send, Users, AlertCircle, Tag } from 'lucide-react';
import { toast } from 'sonner';

const categoryOptions = [
  { value: 'SYSTEM', label: 'System' },
  { value: 'PROMOTIONAL', label: 'Promotional' },
  { value: 'SECURITY', label: 'Security' },
] as const;

const typeOptions = [
  { value: 'SYSTEM_ANNOUNCEMENT', label: 'Announcement' },
  { value: 'SYSTEM_MAINTENANCE', label: 'Maintenance' },
  { value: 'SYSTEM_UPDATE', label: 'Update' },
  { value: 'SYSTEM_POLICY_CHANGE', label: 'Policy Change' },
  { value: 'PROMO_OFFER', label: 'Promotional Offer' },
] as const;

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
] as const;

const targetOptions = [
  { value: 'all', label: 'All Users' },
  { value: 'user', label: 'Regular Users Only' },
  { value: 'partner', label: 'Partners Only' },
  { value: 'admin', label: 'Admins Only' },
  { value: 'moderator', label: 'Moderators Only' },
] as const;

export default function SendBroadcastDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<SendBroadcastInputType>({
    resolver: zodResolver(SendBroadcastInputSchema) as any,
    defaultValues: {
      title: '',
      body: '',
      actionUrl: '',
      actionLabel: '',
      targetRole: 'all',
      priority: 'MEDIUM',
      category: 'SYSTEM',
      type: 'SYSTEM_ANNOUNCEMENT',
      sendEmail: false,
      sendPush: true,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SendBroadcastInputType) => orpc.notifications.sendBroadcast.call(data),
    onSuccess: (result) => {
      toast.success(`Broadcast sent to ${result.notificationCount} user(s)`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send broadcast');
    },
  });

  const onSubmit = (data: SendBroadcastInputType) => {
    mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Megaphone className='size-4' />
          Send Broadcast
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Megaphone className='size-5' />
            Send Broadcast Notification
          </DialogTitle>
          <DialogDescription>
            Send a notification to multiple users at once. Choose your target audience and compose your message.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Title */}
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder='Notification title...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Body */}
            <FormField
              control={form.control}
              name='body'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Write your notification message...' rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              {/* Category */}
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <Tag className='size-4 text-muted-foreground mr-2' />
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              {/* Priority */}
              <FormField
                control={form.control}
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <AlertCircle className='size-4 text-muted-foreground mr-2' />
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Target Role */}
              <FormField
                control={form.control}
                name='targetRole'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <Users className='size-4 text-muted-foreground mr-2' />
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {targetOptions.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action URL (optional) */}
            <FormField
              control={form.control}
              name='actionUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='https://...' {...field} />
                  </FormControl>
                  <FormDescription>Link to open when user clicks the notification</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Label (optional) */}
            {form.watch('actionUrl') && (
              <FormField
                control={form.control}
                name='actionLabel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action Button Label (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='Learn More' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className='pt-4'>
              <Button type='button' variant='outline' onClick={() => setOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className='size-4 animate-spin' />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className='size-4' />
                    Send Broadcast
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
