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

interface DeletePlanDialogProps {
  children: React.ReactNode;
  slug: string;
  name: string;
}

export default function DeletePlanDialog({ children, slug, name }: DeletePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: deletePlan, isPending } = useMutation(
    orpc.subscriptionPlans.delete.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to delete plan');
      },
      onSuccess() {
        toast.success(`Plan "${name}" deleted successfully`);

        queryClient.invalidateQueries({
          queryKey: orpc.subscriptionPlans.list.queryKey({ input: {} }),
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
          <DialogTitle>Delete Plan: {name}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this plan? This action cannot be undone. Plans with active subscriptions
          cannot be deleted.
        </DialogDescription>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={() => deletePlan({ slug })} disabled={isPending}>
            {isPending ? <Loader2Icon className='size-4 animate-spin' /> : 'Delete Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

