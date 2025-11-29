'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Archive,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Mail,
  FileEdit,
} from 'lucide-react';
import Link from 'next/link';

export type OrganizationStatus =
  | 'IDLE'
  | 'ONBOARDING'
  | 'PENDING'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'ARCHIVED';

interface OrganizationStatusGuardProps {
  status: OrganizationStatus;
  memberRole: string;
  rejectionReason?: string | null;
  banReason?: string | null;
  children: React.ReactNode;
  context: 'dashboard' | 'onboarding';
}

export default function OrganizationStatusGuard({
  status,
  memberRole,
  rejectionReason,
  banReason,
  children,
  context,
}: OrganizationStatusGuardProps) {
  const router = useRouter();
  const isOwner = memberRole === 'owner';

  // Dashboard context logic
  if (context === 'dashboard') {
    // IDLE or ONBOARDING - redirect to onboarding (owner) or show waiting (member)
    if (status === 'IDLE' || status === 'ONBOARDING') {
      if (isOwner) {
        return (
          <div className='min-h-[80vh] flex items-center justify-center p-8'>
            <Card className='max-w-lg w-full'>
              <CardHeader className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20'>
                  <FileEdit className='size-8 text-yellow-600' />
                </div>
                <CardTitle>Complete Your Onboarding</CardTitle>
                <CardDescription>
                  Your organization setup is not complete. Please finish the onboarding process to access the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className='text-center'>
                <Button asChild size='lg'>
                  <Link href='/onboarding'>
                    Continue Onboarding
                    <ExternalLink className='size-4 ml-2' />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      } else {
        return (
          <div className='min-h-[80vh] flex items-center justify-center p-8'>
            <Card className='max-w-lg w-full'>
              <CardHeader className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20'>
                  <Clock className='size-8 text-blue-600' />
                </div>
                <CardTitle>Onboarding in Progress</CardTitle>
                <CardDescription>
                  The organization owner is currently completing the onboarding process. You'll be able to access the
                  dashboard once it's complete.
                </CardDescription>
              </CardHeader>
              <CardContent className='text-center'>
                <Button variant='outline' onClick={() => router.refresh()}>
                  <RefreshCw className='size-4 mr-2' />
                  Check Again
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }
    }

    // PENDING - Show pending review banner
    if (status === 'PENDING') {
      return (
        <div className='space-y-4'>
          <Alert className='border-yellow-500/50 bg-yellow-500/5'>
            <Clock className='size-4 text-yellow-600' />
            <AlertTitle className='text-yellow-600'>Pending Review</AlertTitle>
            <AlertDescription>
              Your organization is currently under review by our team. This typically takes 2-3 business days. You can
              browse the dashboard but some features may be limited.
            </AlertDescription>
          </Alert>
          {children}
        </div>
      );
    }

    // ACTIVE - Full access
    if (status === 'ACTIVE') {
      return <>{children}</>;
    }

    // REJECTED - Show rejection reason and link to fix
    if (status === 'REJECTED') {
      return (
        <div className='space-y-4'>
          <Alert variant='destructive'>
            <XCircle className='size-4' />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription className='space-y-2'>
              <p>Your organization application was not approved. Please review and address the following:</p>
              {rejectionReason && (
                <div className='mt-2 p-3 bg-destructive/10 rounded-md'>
                  <p className='font-medium'>Reason: {rejectionReason}</p>
                </div>
              )}
              {isOwner && (
                <div className='mt-3'>
                  <Button asChild variant='outline' size='sm'>
                    <Link href='/onboarding'>
                      <FileEdit className='size-4 mr-2' />
                      Fix and Resubmit
                    </Link>
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
          {children}
        </div>
      );
    }

    // SUSPENDED - Block access
    if (status === 'SUSPENDED') {
      return (
        <div className='min-h-[80vh] flex items-center justify-center p-8'>
          <Card className='max-w-lg w-full border-destructive'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
                <Ban className='size-8 text-red-600' />
              </div>
              <CardTitle className='text-destructive'>Organization Suspended</CardTitle>
              <CardDescription>
                Your organization has been suspended and you cannot access the dashboard at this time.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {banReason && (
                <div className='p-4 bg-destructive/10 rounded-lg'>
                  <p className='text-sm font-medium'>Reason:</p>
                  <p className='text-sm text-muted-foreground'>{banReason}</p>
                </div>
              )}
              <div className='text-center'>
                <Button asChild variant='outline'>
                  <a href='mailto:support@yayago.com'>
                    <Mail className='size-4 mr-2' />
                    Contact Support
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // ARCHIVED - Block access
    if (status === 'ARCHIVED') {
      return (
        <div className='min-h-[80vh] flex items-center justify-center p-8'>
          <Card className='max-w-lg w-full'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900/20'>
                <Archive className='size-8 text-gray-600' />
              </div>
              <CardTitle>Organization Archived</CardTitle>
              <CardDescription>
                This organization has been archived and is no longer active.
              </CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
              <Button asChild variant='outline'>
                <a href='mailto:support@yayago.com'>
                  <Mail className='size-4 mr-2' />
                  Contact Support
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Onboarding context logic
  if (context === 'onboarding') {
    // Already submitted or active - redirect to dashboard
    if (status === 'PENDING' || status === 'ACTIVE') {
      return (
        <div className='min-h-[80vh] flex items-center justify-center p-8'>
          <Card className='max-w-lg w-full'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
                <CheckCircle className='size-8 text-green-600' />
              </div>
              <CardTitle>{status === 'ACTIVE' ? 'Already Active!' : 'Already Submitted!'}</CardTitle>
              <CardDescription>
                {status === 'ACTIVE'
                  ? 'Your organization is active. You can access the full dashboard.'
                  : 'Your organization application has been submitted and is pending review.'}
              </CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
              <Button asChild size='lg'>
                <Link href='/'>
                  Go to Dashboard
                  <ExternalLink className='size-4 ml-2' />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // SUSPENDED or ARCHIVED - no access
    if (status === 'SUSPENDED' || status === 'ARCHIVED') {
      return (
        <div className='min-h-[80vh] flex items-center justify-center p-8'>
          <Card className='max-w-lg w-full border-destructive'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
                <AlertTriangle className='size-8 text-red-600' />
              </div>
              <CardTitle className='text-destructive'>Access Denied</CardTitle>
              <CardDescription>
                Your organization is {status.toLowerCase()} and you cannot complete onboarding.
              </CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
              <Button asChild variant='outline'>
                <a href='mailto:support@yayago.com'>
                  <Mail className='size-4 mr-2' />
                  Contact Support
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // IDLE, ONBOARDING, REJECTED - can access onboarding
    if (status === 'IDLE' || status === 'ONBOARDING' || status === 'REJECTED') {
      if (!isOwner) {
        return (
          <div className='min-h-[80vh] flex items-center justify-center p-8'>
            <Card className='max-w-lg w-full'>
              <CardHeader className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20'>
                  <Clock className='size-8 text-blue-600' />
                </div>
                <CardTitle>Owner Required</CardTitle>
                <CardDescription>
                  Only the organization owner can complete the onboarding process. Please wait for them to finish or
                  contact them for access.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        );
      }

      // Show rejection banner if applicable
      if (status === 'REJECTED') {
        return (
          <div className='space-y-4'>
            <Alert variant='destructive'>
              <XCircle className='size-4' />
              <AlertTitle>Please Address the Following Issues</AlertTitle>
              <AlertDescription>
                {rejectionReason || 'Your application needs corrections. Please review and resubmit.'}
              </AlertDescription>
            </Alert>
            {children}
          </div>
        );
      }

      return <>{children}</>;
    }
  }

  // Default fallback
  return <>{children}</>;
}

