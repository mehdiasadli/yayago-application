'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { ArrowLeft, CheckCircle, Clock, Building2, Loader2, Shield, Sparkles, Car } from 'lucide-react';
import { Link } from '@/lib/navigation/navigation-client';
import { OnboardingForm } from './_components/onboarding-form';

export default function PartnerOnboardingPage() {
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

  // Not logged in - show login prompt
  if (!session?.user) {
    return (
      <div className='min-h-screen relative'>
        {/* Background Pattern */}
        <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5' />
        <div className='absolute inset-0 opacity-[0.02]'>
          <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
            <defs>
              <pattern id='auth-grid' width='32' height='32' patternUnits='userSpaceOnUse'>
                <path d='M 32 0 L 0 0 0 32' fill='none' stroke='currentColor' strokeWidth='0.5' />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#auth-grid)' />
          </svg>
        </div>

        <div className='relative container max-w-lg mx-auto py-20 px-4'>
          <Card className='border-0 shadow-xl bg-card/80 backdrop-blur-sm'>
            <CardHeader className='text-center pb-4'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10'>
                <Shield className='h-8 w-8 text-primary' />
              </div>
              <CardTitle className='text-2xl'>Sign In Required</CardTitle>
              <CardDescription className='text-base'>
                Please sign in or create an account to start your partner application.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Button asChild className='w-full' size='lg'>
                <Link href='/signup?callback_url=/become-a-host/onboarding'>Create Account</Link>
              </Button>
              <Button asChild variant='outline' className='w-full' size='lg'>
                <Link href='/login?callback_url=/become-a-host/onboarding'>Sign In</Link>
              </Button>
              <div className='text-center'>
                <Button asChild variant='link' className='text-muted-foreground'>
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

  // Application submitted successfully
  if (isSubmitted) {
    return (
      <div className='min-h-screen relative'>
        {/* Background */}
        <div className='absolute inset-0 bg-gradient-to-br from-green-500/5 via-background to-primary/5' />
        <div className='absolute inset-0 opacity-[0.02]'>
          <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
            <defs>
              <pattern id='success-grid' width='32' height='32' patternUnits='userSpaceOnUse'>
                <path d='M 32 0 L 0 0 0 32' fill='none' stroke='currentColor' strokeWidth='0.5' />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#success-grid)' />
          </svg>
        </div>

        <div className='relative container max-w-2xl mx-auto py-20 px-4'>
          <Card className='border-0 shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden'>
            {/* Success Header */}
            <div className='bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white'>
              <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'>
                <CheckCircle className='h-10 w-10' />
              </div>
              <h1 className='text-2xl font-bold'>Application Submitted!</h1>
              <p className='text-green-100 mt-2'>Thank you for applying to become a YayaGO partner.</p>
            </div>

            <CardContent className='p-8 space-y-6'>
              {/* Timeline */}
              <div className='space-y-4'>
                <h3 className='font-semibold text-lg'>What happens next?</h3>
                <div className='space-y-4'>
                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600'>
                        <Clock className='h-5 w-5' />
                      </div>
                      <div className='w-0.5 h-full bg-border mt-2' />
                    </div>
                    <div className='pb-6'>
                      <p className='font-medium'>Application Review</p>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Our team will review your application within <strong>2-3 business days</strong>.
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600'>
                        <Building2 className='h-5 w-5' />
                      </div>
                      <div className='w-0.5 h-full bg-border mt-2' />
                    </div>
                    <div className='pb-6'>
                      <p className='font-medium'>Partner Dashboard Access</p>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Once approved, you'll get access to the Partner Dashboard to select a plan and complete your
                        setup.
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-4'>
                    <div className='flex flex-col items-center'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600'>
                        <Car className='h-5 w-5' />
                      </div>
                    </div>
                    <div>
                      <p className='font-medium'>Start Listing Vehicles</p>
                      <p className='text-sm text-muted-foreground mt-1'>
                        After setup, you can start listing your vehicles and accept bookings right away.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Notification */}
              <div className='p-4 rounded-xl bg-primary/5 border border-primary/20'>
                <div className='flex items-start gap-3'>
                  <Sparkles className='h-5 w-5 text-primary shrink-0 mt-0.5' />
                  <div className='text-sm'>
                    <p className='font-medium'>We'll keep you updated</p>
                    <p className='text-muted-foreground mt-1'>
                      You'll receive an email notification at <strong>{session.user.email}</strong> once your
                      application has been reviewed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className='text-center space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  Have questions? Contact us at{' '}
                  <a href='mailto:partners@yayago.com' className='text-primary hover:underline font-medium'>
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
    <div className='min-h-screen relative'>
      {/* Background */}
      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5' />
      <div className='absolute inset-0 opacity-[0.02]'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='onboarding-bg-grid' width='32' height='32' patternUnits='userSpaceOnUse'>
              <path d='M 32 0 L 0 0 0 32' fill='none' stroke='currentColor' strokeWidth='0.5' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#onboarding-bg-grid)' />
        </svg>
      </div>

      {/* Decorative blurs */}
      <div className='absolute top-20 left-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute bottom-20 right-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />

      <div className='relative container max-w-4xl mx-auto py-8 px-4'>
        {/* Header */}
        <div className='mb-8'>
          <Button asChild variant='ghost' size='sm' className='mb-4 -ml-2'>
            <Link href='/become-a-host'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Link>
          </Button>
          <div className='flex items-center gap-4'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30'>
              <Building2 className='h-7 w-7' />
            </div>
            <div>
              <h1 className='text-2xl sm:text-3xl font-bold'>Partner Application</h1>
              <p className='text-muted-foreground mt-1'>
                Complete your application to become a YayaGO partner
              </p>
            </div>
          </div>
        </div>

        <OnboardingForm onSuccess={() => setIsSubmitted(true)} />
      </div>
    </div>
  );
}
