import PageHeader from '@/components/page-header';
import DashboardContent from './dashboard-content';
import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Clock, FileEdit, CheckCircle, Car, CalendarCheck, Star, BarChart3 } from 'lucide-react';

export default async function DashboardPage() {
  const headersList = await headers();

  const session = await authClient.getSession({
    fetchOptions: {
      headers: headersList,
    },
  });

  if (!session.data?.user) {
    redirect('/login');
  }

  const sessionData = session.data as any;
  const organizationStatus = sessionData?.organization?.status;
  const organizationName = sessionData?.organization?.name;
  const isActive = organizationStatus === 'ACTIVE';
  const isPending = organizationStatus === 'PENDING';
  const isRejected = organizationStatus === 'REJECTED';

  return (
    <div className='space-y-6'>
      <PageHeader
        title={`Welcome back${organizationName ? `, ${organizationName}` : ''}`}
        description={
          isActive
            ? 'Manage your listings and bookings'
            : isPending
              ? 'Your organization is pending review'
              : isRejected
                ? 'Your organization needs attention'
                : 'Welcome to your partner dashboard'
        }
      />

      {/* Status-specific content */}
      {isPending && <PendingDashboard />}
      {isRejected && <RejectedDashboard />}
      {isActive && <DashboardContent />}
    </div>
  );
}

function PendingDashboard() {
  return (
    <div className='space-y-6'>
      <Card className='border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-900/10'>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30'>
              <Clock className='size-6 text-yellow-600' />
            </div>
            <div>
              <CardTitle>Application Under Review</CardTitle>
              <CardDescription className='text-base'>
                Our team is reviewing your organization. This typically takes 2-3 business days.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='bg-white dark:bg-background rounded-lg p-4 space-y-4'>
            <h4 className='font-medium'>What happens next?</h4>
            <div className='grid gap-3 text-sm'>
              <div className='flex items-start gap-3'>
                <CheckCircle className='size-5 text-green-500 mt-0.5 shrink-0' />
                <div>
                  <p className='font-medium'>Application Submitted</p>
                  <p className='text-muted-foreground'>Your onboarding is complete</p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Clock className='size-5 text-yellow-500 mt-0.5 shrink-0 animate-pulse' />
                <div>
                  <p className='font-medium'>Under Review</p>
                  <p className='text-muted-foreground'>Our team is verifying your documents</p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <div className='size-5 rounded-full border-2 border-muted-foreground/30 mt-0.5 shrink-0' />
                <div>
                  <p className='font-medium text-muted-foreground'>Approval</p>
                  <p className='text-muted-foreground'>You'll receive an email once approved</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h3 className='font-semibold text-lg'>While You Wait</h3>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='hover:border-primary/50 transition-colors'>
          <CardHeader className='pb-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
              <Car className='size-5 text-blue-600' />
            </div>
          </CardHeader>
          <CardContent>
            <h4 className='font-medium mb-1'>Prepare Your Vehicles</h4>
            <p className='text-sm text-muted-foreground'>
              Take high-quality photos of your vehicles and gather all necessary documents.
            </p>
          </CardContent>
        </Card>

        <Card className='hover:border-primary/50 transition-colors'>
          <CardHeader className='pb-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30'>
              <CalendarCheck className='size-5 text-purple-600' />
            </div>
          </CardHeader>
          <CardContent>
            <h4 className='font-medium mb-1'>Set Your Schedule</h4>
            <p className='text-sm text-muted-foreground'>
              Plan your availability and decide on your rental terms and policies.
            </p>
          </CardContent>
        </Card>

        <Card className='hover:border-primary/50 transition-colors'>
          <CardHeader className='pb-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30'>
              <BarChart3 className='size-5 text-green-600' />
            </div>
          </CardHeader>
          <CardContent>
            <h4 className='font-medium mb-1'>Research Pricing</h4>
            <p className='text-sm text-muted-foreground'>
              Check competitor rates in your area to set competitive prices.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className='py-6'>
          <p className='text-sm text-muted-foreground text-center'>
            Have questions? Contact our support team at{' '}
            <a href='mailto:support@yayago.com' className='text-primary hover:underline'>
              support@yayago.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function RejectedDashboard() {
  return (
    <div className='space-y-6'>
      <Card className='border-destructive/30 bg-red-50/50 dark:bg-red-900/10'>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
              <FileEdit className='size-6 text-red-600' />
            </div>
            <div className='flex-1'>
              <CardTitle>Action Required</CardTitle>
              <CardDescription className='text-base'>
                Your organization application needs corrections before it can be approved.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href='/onboarding'>
                <FileEdit className='size-4' />
                Fix Issues
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Common Rejection Reasons</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div className='flex items-start gap-3'>
            <span className='size-2 rounded-full bg-muted-foreground mt-2 shrink-0' />
            <p>Incomplete or unclear business documents</p>
          </div>
          <div className='flex items-start gap-3'>
            <span className='size-2 rounded-full bg-muted-foreground mt-2 shrink-0' />
            <p>Invalid or expired trade license</p>
          </div>
          <div className='flex items-start gap-3'>
            <span className='size-2 rounded-full bg-muted-foreground mt-2 shrink-0' />
            <p>Missing contact information or address</p>
          </div>
          <div className='flex items-start gap-3'>
            <span className='size-2 rounded-full bg-muted-foreground mt-2 shrink-0' />
            <p>Unable to verify business identity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
