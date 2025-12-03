'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, Shield, MoreHorizontal, Trash2, UserCog, Loader2, Crown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import type { CreateMemberInputType, MemberOutputType } from '@yayago-app/validators';
import { formatDistanceToNow } from 'date-fns';
import type { MemberRole } from '@/lib/page-access';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TeamContentProps {
  maxMembers: number;
  memberRole: MemberRole;
}

function getRoleColor(role: string) {
  switch (role) {
    case 'owner':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
    case 'admin':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'owner':
      return <Crown className='size-3' />;
    case 'admin':
      return <Shield className='size-3' />;
    default:
      return null;
  }
}

function CreateMemberDialog({ canAddMore, onSuccess }: { canAddMore: boolean; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreateMemberInputType>({
    defaultValues: {
      email: '',
      name: '',
      role: 'member',
      password: '',
    },
  });

  const createMutation = useMutation(
    orpc.members.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['members'] });
        toast.success('Team member added successfully');
        setOpen(false);
        form.reset();
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add team member');
      },
    })
  );

  const onSubmit = (data: CreateMemberInputType) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!canAddMore}>
          <UserPlus className='size-4' />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Create a new account for your team member. They will receive login credentials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input id='name' placeholder='John Doe' {...form.register('name', { required: 'Name is required' })} />
            {form.formState.errors.name && (
              <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='john@example.com'
              {...form.register('email', { required: 'Email is required' })}
            />
            {form.formState.errors.email && (
              <p className='text-sm text-destructive'>{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              placeholder='••••••••'
              {...form.register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />
            {form.formState.errors.password && (
              <p className='text-sm text-destructive'>{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='role'>Role</Label>
            <Select
              value={form.watch('role')}
              onValueChange={(value) => form.setValue('role', value as 'admin' | 'member')}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='admin'>Admin - Full access to manage listings and bookings</SelectItem>
                <SelectItem value='member'>Member - Can view and manage assigned listings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className='size-4 animate-spin' />}
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MemberRow({
  member,
  isOwner,
  onRoleChange,
  onRemove,
}: {
  member: MemberOutputType;
  isOwner: boolean;
  onRoleChange: (memberId: string, role: 'admin' | 'member') => void;
  onRemove: (memberId: string) => void;
}) {
  const isOwnerMember = member.role === 'owner';

  return (
    <div className='flex items-center justify-between p-4 border-b last:border-b-0'>
      <div className='flex items-center gap-4'>
        <Avatar className='size-10'>
          <AvatarImage src={member.user.image || undefined} alt={member.user.name || 'User'} />
          <AvatarFallback>
            {member.user.name?.charAt(0).toUpperCase() || member.user.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className='flex items-center gap-2'>
            <p className='font-medium'>{member.user.name || 'Unnamed'}</p>
            <Badge className={getRoleColor(member.role)} variant='secondary'>
              {getRoleIcon(member.role)}
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground'>{member.user.email}</p>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <p className='text-sm text-muted-foreground'>
          Joined {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true })}
        </p>

        {/* Only show actions for non-owner members, and only if current user is owner */}
        {isOwner && !isOwnerMember && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon'>
                <MoreHorizontal className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onRoleChange(member.id, member.role === 'admin' ? 'member' : 'admin')}>
                <UserCog className='size-4' />
                Change to {member.role === 'admin' ? 'Member' : 'Admin'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className='text-destructive focus:text-destructive'
                  >
                    <Trash2 className='size-4' />
                    Remove Member
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove {member.user.name || member.user.email} from your team? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onRemove(member.id)}
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export default function TeamContent({ maxMembers, memberRole }: TeamContentProps) {
  const queryClient = useQueryClient();
  const isOwner = memberRole === 'owner';

  const { data, isLoading, error } = useQuery(orpc.members.list.queryOptions());

  console.log(data);

  const updateRoleMutation = useMutation(
    orpc.members.updateRole.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['members'] });
        toast.success('Member role updated');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update role');
      },
    })
  );

  const removeMutation = useMutation(
    orpc.members.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['members'] });
        toast.success('Member removed');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to remove member');
      },
    })
  );

  const handleRoleChange = (memberId: string, role: 'admin' | 'member') => {
    updateRoleMutation.mutate({ memberId, role });
  };

  const handleRemove = (memberId: string) => {
    removeMutation.mutate({ memberId });
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Skeleton className='h-32' />
          <Skeleton className='h-32' />
        </div>
        <Skeleton className='h-[400px]' />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='size-4' />
        <AlertDescription>{error.message || 'Failed to load team members'}</AlertDescription>
      </Alert>
    );
  }

  const members = data?.members || [];
  const currentMembers = data?.currentMembers || 0;
  const canAddMore = data?.canAddMore || false;
  const availableSeats = maxMembers - currentMembers;

  return (
    <div className='space-y-6'>
      {/* Team Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Team Members</CardTitle>
            <Users className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{currentMembers}</div>
            <p className='text-xs text-muted-foreground mt-1'>of {maxMembers} seats used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Available Seats</CardTitle>
            <Shield className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{availableSeats}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              {canAddMore ? 'Can add more members' : 'Upgrade to add more'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage who has access to your organization</CardDescription>
          </div>
          {isOwner && (
            <CreateMemberDialog
              canAddMore={canAddMore}
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['members'] })}
            />
          )}
        </CardHeader>
        <CardContent className='p-0'>
          {members.length === 0 ? (
            <div className='min-h-[200px] flex items-center justify-center'>
              <div className='text-center text-muted-foreground'>
                <Users className='size-16 mx-auto mb-4 opacity-50' />
                <p className='text-lg font-medium'>No team members yet</p>
                <p className='text-sm'>Add your first team member to get started</p>
              </div>
            </div>
          ) : (
            <div>
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  isOwner={isOwner}
                  onRoleChange={handleRoleChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info for non-owners */}
      {!isOwner && (
        <Alert>
          <AlertCircle className='size-4' />
          <AlertDescription>Only the organization owner can add or remove team members.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
