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

interface DeleteAddonDialogProps {
  children: React.ReactNode;
  id: string;
  name: string;
}

export default function DeleteAddonDialog({ children, id, name }: DeleteAddonDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: deleteAddon, isPending } = useMutation(
    orpc.addons.delete.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to delete addon');
      },
      onSuccess() {
        toast.success(`Addon "${name}" deleted successfully`);

        queryClient.invalidateQueries({
          queryKey: orpc.addons.list.queryKey({ input: {} }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.addons.getStats.queryKey({ input: {} }),
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
          <DialogTitle>Delete Addon: {name}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this addon? This will soft-delete the addon and it will no longer be available
          for new bookings. Existing bookings with this addon will not be affected.
        </DialogDescription>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={() => deleteAddon({ addonId: id })} disabled={isPending}>
            {isPending ? <Loader2Icon className='size-4 animate-spin' /> : 'Delete Addon'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

