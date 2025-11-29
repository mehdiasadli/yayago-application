'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { orpc } from '@/utils/orpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeletePriceDialogProps {
  children: React.ReactNode;
  priceId: string;
  planSlug: string;
}

export default function DeletePriceDialog({ children, priceId, planSlug }: DeletePriceDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: deletePrice, isPending } = useMutation(
    orpc.subscriptionPlans.deletePrice.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to delete price');
      },
      onSuccess() {
        toast.success('Price deleted successfully');
        queryClient.invalidateQueries({
          queryKey: orpc.subscriptionPlans.findOne.queryKey({ input: { slug: planSlug } }),
        });
        setOpen(false);
      },
    })
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Price</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this price? This will not affect existing subscriptions but new subscribers
          won't be able to use this price.
        </DialogDescription>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={() => deletePrice({ id: priceId })} disabled={isPending}>
            {isPending ? <Loader2Icon className='size-4 animate-spin' /> : 'Delete Price'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

