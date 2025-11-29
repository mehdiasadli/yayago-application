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

interface DeleteFeatureDialogProps {
  children: React.ReactNode;
  featureId: string;
  planSlug: string;
}

export default function DeleteFeatureDialog({ children, featureId, planSlug }: DeleteFeatureDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: deleteFeature, isPending } = useMutation(
    orpc.subscriptionPlans.deleteFeature.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to delete feature');
      },
      onSuccess() {
        toast.success('Feature deleted successfully');
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
          <DialogTitle>Delete Feature</DialogTitle>
        </DialogHeader>
        <DialogDescription>Are you sure you want to delete this feature from the plan?</DialogDescription>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={() => deleteFeature({ id: featureId })} disabled={isPending}>
            {isPending ? <Loader2Icon className='size-4 animate-spin' /> : 'Delete Feature'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

