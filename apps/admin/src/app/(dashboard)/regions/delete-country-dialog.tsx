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

interface DeleteCountryDialogProps {
  children: React.ReactNode;
  code: string;
}

export default function DeleteCountryDialog({ children, code }: DeleteCountryDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: deleteCountry, isPending } = useMutation(
    orpc.countries.delete.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to delete country');
      },
      onSuccess() {
        toast.success('Country deleted successfully');

        queryClient.invalidateQueries({
          queryKey: orpc.countries.list.queryKey({ input: {} }),
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
          <DialogTitle>Delete This Country</DialogTitle>
        </DialogHeader>
        <DialogDescription>Are you sure you want to delete this country?</DialogDescription>
        <DialogFooter>
          <Button variant='destructive' onClick={() => deleteCountry({ code })} disabled={isPending}>
            {isPending ? <Loader2Icon className='size-4 animate-spin' /> : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
