'use client';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlaceStatus, PlaceStatusSchema } from '@yayago-app/db/enums';
import { Label } from '@/components/ui/label';
import { formatEnumValue, makeEnumLabels } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { toast } from 'sonner';
import { Loader2Icon } from 'lucide-react';

interface EditCountryStatusProps {
  initialStatus: PlaceStatus;
  children: React.ReactNode;
  code: string;
}

export default function EditCountryStatus({ initialStatus, children, code }: EditCountryStatusProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const queryClient = useQueryClient();

  const { mutateAsync: updateCountryStatus, isPending } = useMutation(
    orpc.countries.updateStatus.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to update country status');
      },
      onSuccess(data) {
        toast.success(`Country status updated to ${formatEnumValue(data.status)}`);

        queryClient.invalidateQueries({
          queryKey: orpc.countries.findOne.queryKey({ input: { code } }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.countries.list.queryKey({ input: {} }),
        });

        onOpenChange(false);
      },
    })
  );

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setOpen(false);
    } else {
      setStatus(initialStatus);
      setOpen(true);
    }
  };

  const onSubmit = async () => {
    if (isPending) return;

    if (initialStatus === status) {
      onOpenChange(false);
      return;
    }

    await updateCountryStatus({
      code,
      status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Country Status</DialogTitle>
        </DialogHeader>
        <RadioGroup
          className='gap-0 -space-y-px rounded-md shadow-xs'
          value={status}
          onValueChange={(value) => setStatus(value as PlaceStatus)}
        >
          {makeEnumLabels(PlaceStatusSchema.options).map((item) => (
            <div
              key={item.value}
              className='relative flex flex-col gap-4 border border-input p-4 outline-none first:rounded-t-md last:rounded-b-md has-data-[state=checked]:z-10 has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-accent'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <RadioGroupItem id={`${item.value}`} value={item.value} className='after:absolute after:inset-0' />
                  <Label className='inline-flex items-start' htmlFor={`${item.value}`}>
                    {item.label}
                  </Label>
                </div>
                {item.value === initialStatus && (
                  <Badge variant='primary' appearance='light'>
                    Current
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={isPending || initialStatus === status}>
            {isPending ? <Loader2Icon className='size-4 animate-spin' /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
