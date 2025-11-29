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

interface DeleteVehicleBrandDialogProps {
  children: React.ReactNode;
  slug: string;
  name: string;
}

export default function DeleteVehicleBrandDialog({ children, slug, name }: DeleteVehicleBrandDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: deleteBrand, isPending } = useMutation(
    orpc.vehicleBrands.delete.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to delete vehicle brand');
      },
      onSuccess() {
        toast.success(`Brand "${name}" deleted successfully`);
        queryClient.invalidateQueries({
          queryKey: orpc.vehicleBrands.list.queryKey({ input: {} }),
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
          <DialogTitle>Delete Brand: {name}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this vehicle brand? This will also delete all associated models.
        </DialogDescription>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={() => deleteBrand({ slug })} disabled={isPending}>
            {isPending ? <Loader2Icon className='size-4 animate-spin' /> : 'Delete Brand'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
