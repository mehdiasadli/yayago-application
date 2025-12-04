'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Shield,
  AlertCircle,
  Calendar,
  Sparkles,
  BadgeCheck,
  Clock,
  Mail,
  Phone,
  Crown,
} from 'lucide-react';
import { format } from 'date-fns';
import { useVerification } from '@/contexts/verification-context';
import { cn } from '@/lib/utils';

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
  const { isVerified, isPending, openModal, isLoading: isVerificationLoading } = useVerification();

  return (
    <div className='relative overflow-hidden rounded-2xl border bg-card shadow-xl'>
      {/* Background with animated gradient */}
      <div className='absolute inset-0 overflow-hidden'>
        {/* Base gradient */}
        <div className='absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent' />
        
        {/* Animated floating orbs */}
        <div className='absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse' />
        <div className='absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-violet-500/15 blur-3xl animate-pulse [animation-delay:1s]' />
        <div className='absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl animate-pulse [animation-delay:2s]' />
        
        {/* Grid pattern overlay */}
        <div 
          className='absolute inset-0 opacity-[0.03]'
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
        
        {/* Bottom fade */}
        <div className='absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent' />
      </div>

      {/* Content */}
      <div className='relative px-4 sm:px-6 py-6'>
        {/* Main row: Avatar + User Info */}
        <div className='flex items-center gap-5 sm:gap-6'>
          {/* Avatar */}
          <div className='relative shrink-0'>
            <Avatar className='size-24 sm:size-28 ring-4 ring-card/50 shadow-2xl'>
              <AvatarImage src={user.image ?? undefined} alt={user.name} className='object-cover' />
              <AvatarFallback className='text-2xl sm:text-3xl font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Verification badge on avatar */}
            {isVerified && (
              <div className='absolute -bottom-1 -right-1 p-1.5 rounded-full bg-card shadow-lg ring-2 ring-card'>
                <BadgeCheck className='size-5 text-emerald-500 fill-emerald-500/20' />
              </div>
            )}
          </div>

          {/* User info */}
          <div className='flex-1 min-w-0'>
            {/* Name and badges */}
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>{user.name}</h1>
              
              {/* Role badges */}
              {user.role === 'admin' && (
                <Badge className='gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm'>
                  <Crown className='size-3' />
                  Admin
                </Badge>
              )}
              {user.role === 'moderator' && (
                <Badge className='gap-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-sm'>
                  <Shield className='size-3' />
                  Moderator
                </Badge>
              )}
            </div>
            
            <p className='text-muted-foreground font-medium mt-1'>
              @{user.displayUsername || user.username || 'username'}
            </p>

            {/* User details */}
            <div className='mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground'>
              <div className='flex items-center gap-1.5'>
                <Calendar className='size-4' />
                <span>Joined {memberSince}</span>
              </div>
              
              {user.email && (
                <div className='flex items-center gap-1.5'>
                  <Mail className='size-4' />
                  <span className='truncate max-w-[200px]'>{user.email}</span>
                  {user.emailVerified && (
                    <CheckCircle className='size-3.5 text-emerald-500' />
                  )}
                </div>
              )}
              
              {user.phoneNumber && (
                <div className='flex items-center gap-1.5'>
                  <Phone className='size-4' />
                  <span>{user.phoneNumber}</span>
                  {user.phoneNumberVerified && (
                    <CheckCircle className='size-3.5 text-emerald-500' />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification status section */}
        <div className='mt-6 pt-5 border-t border-border/50'>
          <div className='flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
            {/* Verification badges */}
            <div className='flex flex-wrap gap-2'>
              {/* Identity Verification Status */}
              {!isVerificationLoading && (
                isVerified ? (
                  <Badge variant='outline' className='gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'>
                    <BadgeCheck className='size-3.5' />
                    Identity Verified
                  </Badge>
                ) : isPending ? (
                  <Badge variant='outline' className='gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'>
                    <Clock className='size-3.5' />
                    Verification Pending
                  </Badge>
                ) : (
                  <Badge 
                    variant='outline' 
                    className='gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors'
                    onClick={openModal}
                  >
                    <Sparkles className='size-3.5' />
                    Verify Identity
                  </Badge>
                )
              )}
              
              {/* Email Status */}
              <Badge 
                variant='outline' 
                className={cn(
                  'gap-1.5 px-3 py-1.5',
                  user.emailVerified 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                )}
              >
                {user.emailVerified ? (
                  <CheckCircle className='size-3.5' />
                ) : (
                  <AlertCircle className='size-3.5' />
                )}
                Email {user.emailVerified ? 'Verified' : 'Unverified'}
              </Badge>
              
              {/* Phone Status */}
              {user.phoneNumber && (
                <Badge 
                  variant='outline' 
                  className={cn(
                    'gap-1.5 px-3 py-1.5',
                    user.phoneNumberVerified 
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                  )}
                >
                  {user.phoneNumberVerified ? (
                    <CheckCircle className='size-3.5' />
                  ) : (
                    <AlertCircle className='size-3.5' />
                  )}
                  Phone {user.phoneNumberVerified ? 'Verified' : 'Unverified'}
                </Badge>
              )}
            </div>

            {/* Verification CTA */}
            {!isVerificationLoading && !isVerified && !isPending && (
              <Button
                onClick={openModal}
                size='sm'
                className='gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25'
              >
                <BadgeCheck className='size-4' />
                Complete Verification
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
