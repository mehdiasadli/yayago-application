'use client';

import { UserRole, UserRoleSchema } from '@yayago-app/db/enums';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { formatEnumValue, makeEnumLabels } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { toast } from 'sonner';
import { Loader2Icon } from 'lucide-react';

interface EditRoleProps {
  username: string;
  children: React.ReactNode;
  initialRole: UserRole;
  currentRole: UserRole;
  currentUsername: string;
}

export default function EditRole({ username, children, initialRole, currentRole, currentUsername }: EditRoleProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(initialRole);
  const queryClient = useQueryClient();

  const { mutateAsync: updateRole, isPending } = useMutation(
    orpc.users.updateRole.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to update user role');
      },
      onSuccess(data) {
        toast.success(`User role updated to ${formatEnumValue(data.role)}`);
        queryClient.invalidateQueries({
          queryKey: orpc.users.findOne.queryKey({ input: { username } }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.users.list.queryKey({ input: {} }),
        });

        onOpenChange(false);
      },
    })
  );

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setOpen(false);
    } else {
      setRole(initialRole);
      setOpen(true);
    }
  };

  const onSubmit = async () => {
    if (isPending) return;

    if (initialRole === role) {
      onOpenChange(false);
      return;
    }

    if (currentUsername === username) {
      toast.error('You are not authorized to update your own role');
      return;
    }

    if (currentRole === 'moderator' && !(initialRole === 'user' && role === 'moderator')) {
      toast.error('You can only update the role of a user to moderator');
      return;
    }

    if (currentRole === 'admin' && initialRole === 'admin') {
      toast.error('You are not authorized to update the role to admin');
      return;
    }

    await updateRole({
      username,
      role,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger disabled={currentUsername === username} asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
        </DialogHeader>
        <RadioGroup
          className='gap-0 -space-y-px rounded-md shadow-xs'
          value={role}
          onValueChange={(value) => setRole(value as UserRole)}
        >
          {makeEnumLabels(UserRoleSchema.options).map((item) => (
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
                {item.value === initialRole && (
                  <Badge variant='primary' appearance='light'>
                    Current
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button
            onClick={onSubmit}
            disabled={
              isPending ||
              initialRole === role ||
              (currentRole === 'moderator' && initialRole !== 'user') ||
              (currentRole === 'admin' && initialRole === 'admin') ||
              currentUsername === username
            }
          >
            {isPending ? <Loader2Icon className='size-4 animate-spin' /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
