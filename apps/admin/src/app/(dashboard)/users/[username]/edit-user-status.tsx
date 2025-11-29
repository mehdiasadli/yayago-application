'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { orpc } from '@/utils/orpc';
import { toast } from 'sonner';
import { Loader2Icon, Ban, CheckCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface EditUserStatusProps {
  username: string;
  currentUsername: string;
  children: React.ReactNode;
  initialBanned: boolean;
  initialBanExpires?: Date | null;
  initialBanReason?: string | null;
}

export default function EditUserStatus({
  username,
  currentUsername,
  children,
  initialBanned,
  initialBanExpires,
  initialBanReason,
}: EditUserStatusProps) {
  const [open, setOpen] = useState(false);
  const [banReason, setBanReason] = useState(initialBanReason || '');
  const [banExpires, setBanExpires] = useState<string>(
    initialBanExpires ? new Date(initialBanExpires).toISOString().slice(0, 16) : ''
  );
  const [isPermanent, setIsPermanent] = useState(!initialBanExpires);
  const queryClient = useQueryClient();

  const { mutateAsync: banUser, isPending: isBanning } = useMutation(
    orpc.users.banUser.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to ban user');
      },
      onSuccess() {
        toast.success('User has been banned');
        queryClient.invalidateQueries({
          queryKey: orpc.users.findOne.queryKey({ input: { username } }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.users.list.queryKey({ input: { page: 1, take: 10 } }),
        });
        setOpen(false);
      },
    })
  );

  const { mutateAsync: unbanUser, isPending: isUnbanning } = useMutation(
    orpc.users.unbanUser.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to unban user');
      },
      onSuccess() {
        toast.success('User has been unbanned');
        queryClient.invalidateQueries({
          queryKey: orpc.users.findOne.queryKey({ input: { username } }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.users.list.queryKey({ input: { page: 1, take: 10 } }),
        });
        setOpen(false);
      },
    })
  );

  const isPending = isBanning || isUnbanning;

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setOpen(false);
    } else {
      setBanReason(initialBanReason || '');
      setBanExpires(initialBanExpires ? new Date(initialBanExpires).toISOString().slice(0, 16) : '');
      setIsPermanent(!initialBanExpires);
      setOpen(true);
    }
  };

  const handleBan = async () => {
    if (currentUsername === username) {
      toast.error('You cannot ban yourself');
      return;
    }

    await banUser({
      username,
      reason: banReason || undefined,
      expiresAt: isPermanent ? undefined : banExpires ? new Date(banExpires) : undefined,
    });
  };

  const handleUnban = async () => {
    if (currentUsername === username) {
      toast.error('You cannot unban yourself');
      return;
    }

    await unbanUser({ username });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger disabled={currentUsername === username} asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {initialBanned ? (
              <>
                <CheckCircle className='size-5 text-success' />
                Unban User
              </>
            ) : (
              <>
                <Ban className='size-5 text-destructive' />
                Ban User
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {initialBanned
              ? "This will restore the user's access to the platform."
              : 'This will prevent the user from accessing the platform.'}
          </DialogDescription>
        </DialogHeader>

        {!initialBanned && (
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='reason'>Reason (optional)</Label>
              <Textarea
                id='reason'
                placeholder='Enter the reason for banning this user...'
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className='flex items-center gap-2'>
              <Switch id='permanent' checked={isPermanent} onCheckedChange={setIsPermanent} />
              <Label htmlFor='permanent'>Permanent ban</Label>
            </div>

            {!isPermanent && (
              <div className='space-y-2'>
                <Label htmlFor='expires'>Ban expires at</Label>
                <Input
                  id='expires'
                  type='datetime-local'
                  value={banExpires}
                  onChange={(e) => setBanExpires(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          {initialBanned ? (
            <Button variant='primary' onClick={handleUnban} disabled={isPending}>
              {isUnbanning ? <Loader2Icon className='size-4 animate-spin' /> : 'Unban User'}
            </Button>
          ) : (
            <Button variant='destructive' onClick={handleBan} disabled={isPending}>
              {isBanning ? <Loader2Icon className='size-4 animate-spin' /> : 'Ban User'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
