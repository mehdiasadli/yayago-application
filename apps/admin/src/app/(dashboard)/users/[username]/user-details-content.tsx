'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import EditUserStatus from './edit-user-status';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EditRole from './edit-role';
import { formatEnumValue } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { UserRole } from '@yayago-app/db/enums';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import UserVerificationSection from './user-verification-section';

interface UserDetailsContentProps {
  username: string;
}

function getRoleBadgeVariant(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'destructive' as const;
    case 'moderator':
      return 'warning' as const;
    default:
      return 'secondary' as const;
  }
}

export default function UserDetailsContent({ username }: UserDetailsContentProps) {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery(
    orpc.users.findOne.queryOptions({
      input: { username },
    })
  );

  const { data: session, isPending } = authClient.useSession();

  if (isLoading || isPending) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-48 w-full' />
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-destructive'>Error: {error.message}</CardContent>
      </Card>
    );
  }

  if (!user || !session?.user) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>User not found</CardContent>
      </Card>
    );
  }

  const canEditStatus = session.user.username !== username;
  const canEditRole = session.user.username !== username;

  return (
    <div className='space-y-6'>
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Avatar className='size-16'>
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className='bg-primary/10 text-primary text-xl font-bold'>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className='text-2xl font-bold'>{user.name}</h2>
                <p className='text-muted-foreground font-normal'>@{user.username}</p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {canEditRole ? (
                <EditRole
                  username={user.username}
                  initialRole={user.role}
                  currentUsername={session.user.username!}
                  currentRole={session.user.role as UserRole}
                >
                  <Badge variant={getRoleBadgeVariant(user.role)} className='cursor-pointer gap-1 px-3 py-1'>
                    <Shield className='size-3' />
                    {formatEnumValue(user.role)}
                  </Badge>
                </EditRole>
              ) : (
                <Badge variant={getRoleBadgeVariant(user.role)} className='gap-1 px-3 py-1'>
                  <Shield className='size-3' />
                  {formatEnumValue(user.role)}
                </Badge>
              )}

              {canEditStatus ? (
                <EditUserStatus
                  username={user.username}
                  currentUsername={session.user.username!}
                  initialBanned={user.banned ?? false}
                  initialBanExpires={user.banExpires}
                  initialBanReason={user.banReason}
                >
                  <Badge
                    variant={user.banned ? 'destructive' : 'success'}
                    appearance='outline'
                    className='cursor-pointer gap-1 px-3 py-1'
                  >
                    {user.banned ? <Ban className='size-3' /> : <CheckCircle className='size-3' />}
                    {user.banned ? 'Banned' : 'Active'}
                  </Badge>
                </EditUserStatus>
              ) : (
                <Badge
                  variant={user.banned ? 'destructive' : 'success'}
                  appearance='outline'
                  className='gap-1 px-3 py-1'
                >
                  {user.banned ? <Ban className='size-3' /> : <CheckCircle className='size-3' />}
                  {user.banned ? 'Banned' : 'Active'}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Email */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Mail className='size-5 text-muted-foreground mt-0.5' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm text-muted-foreground'>Email</p>
                <p className='font-medium truncate'>{user.email}</p>
                <Badge
                  variant={user.emailVerified ? 'success' : 'warning'}
                  appearance='outline'
                  className='mt-1 text-xs'
                >
                  {user.emailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>

            {/* Phone */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Phone className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Phone</p>
                <p className='font-medium'>{user.phoneNumber || '—'}</p>
                {user.phoneNumber && (
                  <Badge
                    variant={user.phoneNumberVerified ? 'success' : 'warning'}
                    appearance='outline'
                    className='mt-1 text-xs'
                  >
                    {user.phoneNumberVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                )}
              </div>
            </div>

            {/* Joined */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Calendar className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Joined</p>
                <p className='font-medium'>{format(user.createdAt, 'd MMM yyyy')}</p>
                <p className='text-xs text-muted-foreground'>{format(user.createdAt, 'HH:mm')}</p>
              </div>
            </div>

            {/* Last Updated */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Clock className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Last Updated</p>
                <p className='font-medium'>{format(user.updatedAt, 'd MMM yyyy')}</p>
                <p className='text-xs text-muted-foreground'>{format(user.updatedAt, 'HH:mm')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ban Info Card (if banned) */}
      {user.banned && (
        <Card className='border-destructive/50 bg-destructive/5'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg text-destructive'>
              <AlertTriangle className='size-5' />
              Account Banned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {user.banReason && (
                <div>
                  <p className='text-sm text-muted-foreground'>Reason</p>
                  <p className='font-medium'>{user.banReason}</p>
                </div>
              )}
              {user.banExpires && (
                <div>
                  <p className='text-sm text-muted-foreground'>Expires</p>
                  <p className='font-medium'>{format(user.banExpires, 'd MMM yyyy, HH:mm')}</p>
                </div>
              )}
              {!user.banExpires && (
                <div>
                  <Badge variant='destructive'>Permanent Ban</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <User className='size-5' />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between py-2 border-b'>
                <span className='text-muted-foreground'>Username</span>
                <span className='font-mono font-medium'>@{user.username}</span>
              </div>
              <div className='flex items-center justify-between py-2 border-b'>
                <span className='text-muted-foreground'>Role</span>
                <Badge variant={getRoleBadgeVariant(user.role)}>{formatEnumValue(user.role)}</Badge>
              </div>
              <div className='flex items-center justify-between py-2'>
                <span className='text-muted-foreground'>Status</span>
                <Badge variant={user.banned ? 'destructive' : 'success'} appearance='outline'>
                  {user.banned ? 'Banned' : 'Active'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Info */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <CreditCard className='size-5' />
              Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between py-2 border-b'>
                <span className='text-muted-foreground'>Stripe Customer ID</span>
                <span className='font-mono text-sm'>{user.stripeCustomerId || '—'}</span>
              </div>
              {user.stripeCustomerId && (
                <Button variant='outline' size='sm' asChild>
                  <a
                    href={`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    View in Stripe Dashboard
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Identity Verification Section */}
      <UserVerificationSection user={user} />
    </div>
  );
}
