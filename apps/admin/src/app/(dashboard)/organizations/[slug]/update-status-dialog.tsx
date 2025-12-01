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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { orpc } from '@/utils/orpc';
import { toast } from 'sonner';
import { Loader2Icon, CheckCircle, XCircle, Ban, Archive } from 'lucide-react';
import { OrganizationStatus } from '@yayago-app/db/enums';
import { formatEnumValue } from '@/lib/utils';

interface UpdateOrganizationStatusDialogProps {
  children: React.ReactNode;
  slug: string;
  currentStatus: OrganizationStatus;
}

type StatusAction = {
  status: OrganizationStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant: 'primary' | 'destructive' | 'secondary' | 'outline';
  requiresReason: boolean;
};

const getAvailableActions = (currentStatus: OrganizationStatus): StatusAction[] => {
  const actions: StatusAction[] = [];

  if (currentStatus === 'PENDING') {
    actions.push({
      status: 'ACTIVE',
      label: 'Approve',
      description: 'Approve this organization and activate their account',
      icon: <CheckCircle className='size-4' />,
      variant: 'primary',
      requiresReason: false,
    });
    actions.push({
      status: 'REJECTED',
      label: 'Reject',
      description: 'Reject this application and require corrections',
      icon: <XCircle className='size-4' />,
      variant: 'destructive',
      requiresReason: true,
    });
  }

  if (currentStatus === 'ACTIVE') {
    actions.push({
      status: 'SUSPENDED',
      label: 'Suspend',
      description: 'Temporarily suspend this organization',
      icon: <Ban className='size-4' />,
      variant: 'destructive',
      requiresReason: true,
    });
    actions.push({
      status: 'ARCHIVED',
      label: 'Archive',
      description: 'Archive this organization permanently',
      icon: <Archive className='size-4' />,
      variant: 'secondary',
      requiresReason: false,
    });
  }

  if (currentStatus === 'SUSPENDED') {
    actions.push({
      status: 'ACTIVE',
      label: 'Reactivate',
      description: 'Reactivate this organization',
      icon: <CheckCircle className='size-4' />,
      variant: 'primary',
      requiresReason: false,
    });
  }

  if (currentStatus === 'REJECTED') {
    actions.push({
      status: 'ACTIVE',
      label: 'Approve',
      description: 'Approve after corrections have been made',
      icon: <CheckCircle className='size-4' />,
      variant: 'primary',
      requiresReason: false,
    });
  }

  return actions;
};

export default function UpdateOrganizationStatusDialog({
  children,
  slug,
  currentStatus,
}: UpdateOrganizationStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrganizationStatus | null>(null);
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const availableActions = getAvailableActions(currentStatus);
  const selectedAction = availableActions.find((a) => a.status === selectedStatus);

  const { mutateAsync: updateStatus, isPending } = useMutation(
    orpc.organizations.updateStatus.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to update organization status');
      },
      onSuccess(data) {
        toast.success(`Organization status updated to ${formatEnumValue(data.status)}`);
        queryClient.invalidateQueries({
          queryKey: orpc.organizations.findOne.queryKey({ input: { slug } }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.organizations.list.queryKey({ input: { page: 1, take: 10 } }),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.organizations.getPendingCount.queryKey({}),
        });
        setOpen(false);
      },
    })
  );

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setOpen(false);
      setSelectedStatus(null);
      setReason('');
    } else {
      setOpen(true);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatus) return;

    if (selectedAction?.requiresReason && !reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    await updateStatus({
      slug,
      status: selectedStatus,
      reason: reason.trim() || undefined,
    });
  };

  if (availableActions.length === 0) {
    return <>{children}</>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Update Organization Status</DialogTitle>
          <DialogDescription>
            Current status: <strong>{formatEnumValue(currentStatus)}</strong>. Select a new status below.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <RadioGroup
            value={selectedStatus || ''}
            onValueChange={(value) => setSelectedStatus(value as OrganizationStatus)}
            className='space-y-3'
          >
            {availableActions.map((action) => (
              <div
                key={action.status}
                className='flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5'
              >
                <RadioGroupItem value={action.status} id={action.status} className='mt-1' />
                <Label htmlFor={action.status} className='flex-1 cursor-pointer'>
                  <div className='flex items-center gap-2'>
                    {action.icon}
                    <span className='font-medium'>{action.label}</span>
                  </div>
                  <p className='text-sm text-muted-foreground mt-1'>{action.description}</p>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedAction?.requiresReason && (
            <div className='space-y-2'>
              <Label htmlFor='reason'>Reason (required)</Label>
              <Textarea
                id='reason'
                placeholder={`Please explain why you are ${selectedAction.label.toLowerCase()}ing this organization...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={selectedAction?.variant || 'primary'}
            onClick={handleSubmit}
            disabled={isPending || !selectedStatus || (selectedAction?.requiresReason && !reason.trim())}
          >
            {isPending ? <Loader2Icon className='size-4 animate-spin' /> : selectedAction?.label || 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

