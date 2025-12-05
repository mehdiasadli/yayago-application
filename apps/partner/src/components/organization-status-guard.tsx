'use client';

import { useRouter } from 'next/navigation';
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
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';

export type OrganizationStatus =
  | 'DRAFT'
  | 'ONBOARDING'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'ARCHIVED';

interface OrganizationStatusGuardProps {
  status: OrganizationStatus;
  memberRole: string;
  rejectionReason?: string | null;
  banReason?: string | null;
  hasSubscription?: boolean;
  needsPlanSelection?: boolean;
  children: React.ReactNode;
  context: 'dashboard' | 'onboarding' | 'plan-selection';
}

export default function OrganizationStatusGuard({
  status,
  memberRole,
  rejectionReason,
  banReason,
  hasSubscription = true,
  needsPlanSelection = false,
  children,
  context,
}: OrganizationStatusGuardProps) {
  const router = useRouter();
  const isOwner = memberRole === 'owner';

  // Dashboard context logic
  if (context === 'dashboard') {
    // DRAFT or ONBOARDING - redirect to onboarding (owner) or show waiting (member)
    if (status === 'DRAFT' || status === 'ONBOARDING') {
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

    // PENDING_APPROVAL - Show pending review banner with limited access
    if (status === 'PENDING_APPROVAL') {
      return (
        <div className='min-h-[80vh] flex items-center justify-center p-8'>
          <Card className='max-w-lg w-full'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20'>
                <Clock className='size-8 text-amber-600' />
              </div>
              <CardTitle>Application Under Review</CardTitle>
              <CardDescription>
                Thank you for completing your application! Our team is reviewing your submission.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground'>
                <p>
                  <strong>What to expect:</strong>
                </p>
                <ul className='list-disc list-inside mt-2 space-y-1'>
                  <li>Review typically takes 2-3 business days</li>
                  <li>You'll receive an email once approved</li>
                  <li>If we need more information, we'll contact you</li>
                </ul>
              </div>
              <p className='text-sm text-muted-foreground text-center'>
                Have questions? Contact us at{' '}
                <a href='mailto:partners@yayago.com' className='text-primary hover:underline'>
                  partners@yayago.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    // APPROVED - Check if needs plan selection
    if (status === 'APPROVED') {
      // If needs plan selection, redirect to plan selection
      if (needsPlanSelection && isOwner) {
        return (
          <div className='min-h-[80vh] flex items-center justify-center p-8'>
            <Card className='max-w-lg w-full'>
              <CardHeader className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
                  <CheckCircle className='size-8 text-green-600' />
                </div>
                <CardTitle>Application Approved!</CardTitle>
                <CardDescription>
                  Congratulations! Your partner application has been approved. Select a plan to start your 14-day free trial.
                </CardDescription>
              </CardHeader>
              <CardContent className='text-center'>
                <Button asChild size='lg'>
                  <Link href='/plan-selection'>
                    <CreditCard className='size-4 mr-2' />
                    Select a Plan
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Full access
      return <>{children}</>;
    }

    // REJECTED - Show rejection reason and link to fix
    if (status === 'REJECTED') {
      return (
        <div className='min-h-[80vh] flex items-center justify-center p-8'>
          <Card className='max-w-lg w-full border-destructive'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
                <XCircle className='size-8 text-red-600' />
              </div>
              <CardTitle className='text-destructive'>Application Not Approved</CardTitle>
              <CardDescription>
                Unfortunately, your application was not approved. Please review the feedback below.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {rejectionReason && (
                <div className='p-4 bg-destructive/10 rounded-lg'>
                  <p className='text-sm font-medium'>Reason:</p>
                  <p className='text-sm text-muted-foreground mt-1'>{rejectionReason}</p>
                </div>
              )}
              {isOwner && (
                <div className='text-center'>
                  <Button asChild>
                    <Link href='/onboarding'>
                      <FileEdit className='size-4 mr-2' />
                      Update & Resubmit
                    </Link>
                  </Button>
                </div>
              )}
              <p className='text-sm text-muted-foreground text-center'>
                Need help? Contact us at{' '}
                <a href='mailto:partners@yayago.com' className='text-primary hover:underline'>
                  partners@yayago.com
                </a>
              </p>
            </CardContent>
          </Card>
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
    if (status === 'PENDING_APPROVAL' || status === 'APPROVED') {
      return (
        <div className='min-h-[80vh] flex items-center justify-center p-8'>
          <Card className='max-w-lg w-full'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
                <CheckCircle className='size-8 text-green-600' />
              </div>
              <CardTitle>{status === 'APPROVED' ? 'Already Approved!' : 'Already Submitted!'}</CardTitle>
              <CardDescription>
                {status === 'APPROVED'
                  ? 'Your organization is approved. You can access the full dashboard.'
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

    // DRAFT, ONBOARDING, REJECTED - can access onboarding
    if (status === 'DRAFT' || status === 'ONBOARDING' || status === 'REJECTED') {
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

  // Plan selection context
  if (context === 'plan-selection') {
    // Only approved organizations can access plan selection
    if (status !== 'APPROVED') {
      return (
        <div className='min-h-[80vh] flex items-center justify-center p-8'>
          <Card className='max-w-lg w-full'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20'>
                <AlertTriangle className='size-8 text-yellow-600' />
              </div>
              <CardTitle>Plan Selection Unavailable</CardTitle>
              <CardDescription>
                {status === 'PENDING_APPROVAL'
                  ? 'Your application is still under review. You can select a plan once approved.'
                  : 'Please complete the application process first.'}
              </CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
              <Button asChild variant='outline'>
                <Link href='/'>Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <>{children}</>;
  }

  // Default fallback
  return <>{children}</>;
}
