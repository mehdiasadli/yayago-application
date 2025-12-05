'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { ArrowLeft, CheckCircle, Clock, Building2, Loader2 } from 'lucide-react';
import { Link, useRouter } from '@/lib/navigation/navigation-client';
import { OnboardingForm } from './_components/onboarding-form';

export default function PartnerOnboardingPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Loading state
  if (sessionLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  // Not logged in - redirect to signup
  if (!session?.user) {
    router.push('/signup?callback_url=/become-a-host/onboarding');
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  // Application submitted successfully
  if (isSubmitted) {
    return (
      <div className='min-h-screen py-12'>
        <div className='container max-w-2xl mx-auto px-4'>
          <Card className='border-0 shadow-lg'>
            <CardHeader className='text-center pb-4'>
              <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10'>
                <CheckCircle className='h-10 w-10 text-primary' />
              </div>
              <CardTitle className='text-2xl'>Application Submitted!</CardTitle>
              <CardDescription className='text-base'>
                Thank you for applying to become a YayaGO partner.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='bg-muted/50 rounded-lg p-6 space-y-4'>
                <div className='flex items-start gap-3'>
                  <Clock className='h-5 w-5 text-amber-500 mt-0.5' />
                  <div>
                    <p className='font-medium'>What happens next?</p>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Our team will review your application within 2-3 business days.
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <Building2 className='h-5 w-5 text-primary mt-0.5' />
                  <div>
                    <p className='font-medium'>After approval</p>
                    <p className='text-sm text-muted-foreground mt-1'>
                      You'll receive an email notification and can then access the Partner Dashboard to complete your
                      setup, select a plan, and start listing vehicles.
                    </p>
                  </div>
                </div>
              </div>

              <div className='text-center space-y-3'>
                <p className='text-sm text-muted-foreground'>
                  Have questions? Contact us at{' '}
                  <a href='mailto:partners@yayago.com' className='text-primary hover:underline'>
                    partners@yayago.com
                  </a>
                </p>
                <Button asChild variant='outline'>
                  <Link href='/become-a-host'>
                    <ArrowLeft className='h-4 w-4 mr-2' />
                    Back to Become a Host
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Onboarding form
  return (
    <div className='min-h-screen py-8'>
      <div className='container max-w-4xl mx-auto px-4'>
        {/* Header */}
        <div className='mb-8'>
          <Button asChild variant='ghost' size='sm' className='mb-4'>
            <Link href='/become-a-host'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Link>
          </Button>
          <h1 className='text-3xl font-bold'>Partner Application</h1>
          <p className='text-muted-foreground mt-2'>
            Complete your application to become a YayaGO partner. We'll review your information and get back to you
            within 2-3 business days.
          </p>
        </div>

        <OnboardingForm onSuccess={() => setIsSubmitted(true)} />
      </div>
    </div>
  );
}

