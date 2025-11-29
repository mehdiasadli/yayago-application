'use client';

import { orpc } from '@/utils/orpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { Loader2Icon } from 'lucide-react';

interface DeleteVehicleModelDialogProps {
  children: React.ReactNode;
  slug: string;
  name: string;
  brandSlug: string;
}

export default function DeleteVehicleModelDialog({ children, slug, name, brandSlug }: DeleteVehicleModelDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: deleteModel, isPending } = useMutation(
    orpc.vehicleModels.delete.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to delete model');
      },
      onSuccess() {
        toast.success(`Model "${name}" deleted successfully`);
        queryClient.invalidateQueries({
          queryKey: orpc.vehicleModels.list.queryKey({ input: { brandSlug } }),
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
          <DialogTitle>Delete Model: {name}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this vehicle model? This action cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={() => deleteModel({ slug })} disabled={isPending}>
            {isPending ? <Loader2Icon className='size-4 animate-spin' /> : 'Delete Model'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
