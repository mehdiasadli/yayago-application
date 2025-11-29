import { authClient } from '@/lib/auth-client';
import { orpc } from '@/utils/orpc';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OnboardingCard from './onboarding-card/onboarding-card';
import { Clock, CheckCircle, AlertTriangle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function OnboardingPage() {
  const headersList = await headers();
  const session = await authClient.getSession({
    fetchOptions: {
      headers: headersList,
    },
  });

  if (!session.data?.user) {
    redirect('/login');
  }

  let data;
  let statusPage: 'onboarding' | 'pending' | 'active' | 'suspended' = 'onboarding';

  try {
    data = await orpc.organizations.getOnboardingData.call();
  } catch (error: any) {
    // If FORBIDDEN, the org is not in onboarding state - check actual status
    if (error?.code === 'FORBIDDEN') {
      // Get the organization to check its status
      try {
        const { status } = await orpc.organizations.getOrganization.call();
        if (status === 'PENDING') {
          statusPage = 'pending';
        } else if (status === 'ACTIVE') {
          statusPage = 'active';
        } else if (status === 'SUSPENDED' || status === 'ARCHIVED') {
          statusPage = 'suspended';
        }
      } catch {
        redirect('/login');
      }
    } else {
      throw error;
    }
  }

  // Status pages
  if (statusPage === 'pending') {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <Card className='max-w-lg mx-auto text-center'>
          <CardHeader className='pb-4'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30'>
              <Clock className='h-8 w-8 text-amber-600 dark:text-amber-400' />
            </div>
            <CardTitle className='text-2xl'>Application Under Review</CardTitle>
            <CardDescription className='text-base'>
              Thank you for completing your onboarding! Our team is reviewing your application.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground'>
              <p>
                <strong>What to expect:</strong>
              </p>
              <ul className='list-disc list-inside mt-2 space-y-1 text-left'>
                <li>Review typically takes 2-3 business days</li>
                <li>You'll receive an email once approved</li>
                <li>If we need more information, we'll contact you</li>
              </ul>
            </div>
            <p className='text-sm text-muted-foreground'>
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

  if (statusPage === 'active') {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <Card className='max-w-lg mx-auto text-center'>
          <CardHeader className='pb-4'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
              <CheckCircle className='h-8 w-8 text-green-600 dark:text-green-400' />
            </div>
            <CardTitle className='text-2xl'>You're All Set!</CardTitle>
            <CardDescription className='text-base'>
              Your organization is active and ready to go. Start using the platform!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size='lg'>
              <Link href='/'>Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statusPage === 'suspended') {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <Card className='max-w-lg mx-auto text-center'>
          <CardHeader className='pb-4'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
              <Ban className='h-8 w-8 text-red-600 dark:text-red-400' />
            </div>
            <CardTitle className='text-2xl'>Account Suspended</CardTitle>
            <CardDescription className='text-base'>
              Your organization account has been suspended. Please contact support for assistance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Contact us at{' '}
              <a href='mailto:support@yayago.com' className='text-primary hover:underline'>
                support@yayago.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Onboarding form
  return (
    <div className='min-h-screen'>
      <Card className='max-w-5xl mx-auto my-12'>
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
          <CardDescription>
            Please fill in the following details to complete your organization's onboarding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingCard data={data!} />
        </CardContent>
      </Card>
    </div>
  );
}
