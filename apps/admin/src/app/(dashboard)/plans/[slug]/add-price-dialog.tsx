'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orpc } from '@/utils/orpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import NumberInput from '@/components/ui/number-input';
import { useForm } from 'react-hook-form';
import { CreateSubscriptionPlanPriceInputSchema } from '@yayago-app/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/form-input';
import { Switch } from '@/components/ui/switch';

interface AddPriceDialogProps {
  children: React.ReactNode;
  planSlug: string;
}

export default function AddPriceDialog({ children, planSlug }: AddPriceDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(CreateSubscriptionPlanPriceInputSchema.omit({ planSlug: true })),
    defaultValues: {
      currency: 'aed',
      interval: 'month',
      isActive: false,
      amount: 0,
    },
  });

  const { mutate: createPrice, isPending } = useMutation(
    orpc.subscriptionPlans.createPrice.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to add price');
      },
      onSuccess() {
        toast.success('Price added successfully');
        queryClient.invalidateQueries({
          queryKey: orpc.subscriptionPlans.findOne.queryKey({ input: { slug: planSlug } }),
        });
        setOpen(false);
        resetForm();
      },
    })
  );

  function resetForm() {
    form.reset();
  }

  const onSubmit = form.handleSubmit(async (data) => {
    await createPrice({
      planSlug,
      amount: data.amount * 100, // Convert to cents
      currency: data.currency,
      interval: data.interval,
      isActive: data.isActive,
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Price</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className='space-y-4'>
          <FormInput
            control={form.control}
            name='interval'
            label='Billing Interval'
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='month'>Monthly</SelectItem>
                  <SelectItem value='year'>Yearly</SelectItem>
                </SelectContent>
              </Select>
            )}
          />

          <FormInput
            control={form.control}
            name='amount'
            label='Amount'
            render={(field) => <NumberInput {...field} minValue={0} placeholder='100' />}
          />

          <FormInput
            control={form.control}
            name='currency'
            label='Currency'
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='aed'>AED</SelectItem>
                  <SelectItem value='usd'>USD</SelectItem>
                  <SelectItem value='eur'>EUR</SelectItem>
                </SelectContent>
              </Select>
            )}
          />

          <FormInput
            control={form.control}
            name='isActive'
            render={(field) => (
              <div className='flex items-center gap-4'>
                <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                <div className='space-y-0.5'>
                  <p>Set price active.</p>
                  <p className='text-xs text-muted-foreground'>Users will be able to select this price option.</p>
                </div>
              </div>
            )}
          />

          <div className='flex justify-end gap-2 pt-4'>
            <Button type='button' variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? <Loader2Icon className='size-4 animate-spin' /> : 'Add Price'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
