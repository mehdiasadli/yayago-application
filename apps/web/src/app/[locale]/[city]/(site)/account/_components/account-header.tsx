'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
  username?: string | null | undefined;
  displayUsername?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  phoneNumberVerified?: boolean | null | undefined;
  banned: boolean | null | undefined;
  role?: string | null | undefined;
  banReason?: string | null | undefined;
  banExpires?: Date | null | undefined;
};

export default function AccountHeader({ user }: { user: User }) {
  const memberSince = format(new Date(user.createdAt), 'MMMM yyyy');

  return (
    <Card className='overflow-hidden'>
      {/* Cover gradient */}
      <div className='h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5' />

      <CardContent className='relative pb-6'>
        {/* Avatar - positioned to overlap cover */}
        <div className='absolute -top-12 left-6'>
          <Avatar className='size-24 ring-4 ring-background shadow-xl'>
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className='text-2xl font-bold bg-primary text-primary-foreground'>
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* User Info - offset for avatar */}
        <div className='pt-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold'>{user.name}</h1>
              {user.emailVerified && (
                <CheckCircle className='size-5 text-green-500' aria-label='Verified' />
              )}
              {user.role === 'admin' && (
                <Badge variant='default' className='gap-1'>
                  <Shield className='size-3' />
                  Admin
                </Badge>
              )}
              {user.role === 'moderator' && (
                <Badge variant='secondary' className='gap-1'>
                  <Shield className='size-3' />
                  Moderator
                </Badge>
              )}
            </div>
            <p className='text-muted-foreground'>@{user.displayUsername || user.username}</p>
            <p className='text-sm text-muted-foreground mt-1'>
              Member since {memberSince}
            </p>
          </div>

          {/* Verification Status */}
          <div className='flex flex-wrap gap-2'>
            <Badge variant={user.emailVerified ? 'outline' : 'secondary'} className='gap-1'>
              {user.emailVerified ? (
                <CheckCircle className='size-3 text-green-500' />
              ) : (
                <AlertCircle className='size-3 text-amber-500' />
              )}
              Email {user.emailVerified ? 'Verified' : 'Unverified'}
            </Badge>
            {user.phoneNumber && (
              <Badge variant={user.phoneNumberVerified ? 'outline' : 'secondary'} className='gap-1'>
                {user.phoneNumberVerified ? (
                  <CheckCircle className='size-3 text-green-500' />
                ) : (
                  <AlertCircle className='size-3 text-amber-500' />
                )}
                Phone {user.phoneNumberVerified ? 'Verified' : 'Unverified'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
