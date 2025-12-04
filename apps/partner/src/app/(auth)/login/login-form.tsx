'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import FormInput from '@/components/form-input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { ArrowRightIcon, Building2Icon, KeyIcon, MailIcon, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { orpc } from '@/utils/orpc';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await authClient.signIn.email(data, {
      onError(error) {
        console.error(error);
        toast.error(error.error?.message || 'Failed to login');
      },
      async onSuccess(result) {
        const session = await authClient.getSession({
          fetchOptions: {
            headers: {
              Authorization: `Bearer ${result.data?.accessToken}`,
            },
          },
        });

        const user = session.data?.user;

        if (!user) {
          toast.error('Invalid credentials');
          return;
        }

        const member = await orpc.members.isMemberOfAnyOrganization.call();

        if (!member) {
          toast.error('You are not a member of any organization');
          return;
        }

        router.push('/');
      },
    });
  });

  return (
    <div className='w-full max-w-md'>
      {/* Header */}
      <div className='mb-8 text-center'>
        <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10'>
          <Building2Icon className='h-7 w-7 text-primary' />
        </div>
        <h1 className='text-2xl font-bold tracking-tight'>Partner Portal</h1>
        <p className='mt-2 text-sm text-muted-foreground'>Sign in to manage your fleet and bookings</p>
      </div>

      {/* Form Card */}
      <div className='rounded-2xl border bg-card p-8 shadow-sm'>
        <form onSubmit={onSubmit} className='space-y-5'>
          <FormInput
            control={form.control}
            name='email'
            label='Email Address'
            render={(field) => (
              <InputGroup className='h-12'>
                <InputGroupAddon className='border-r-0 bg-muted/50'>
                  <MailIcon className='h-4 w-4 text-muted-foreground' />
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  {...field}
                  placeholder='you@company.com'
                  className='h-12 border-l-0 pl-0'
                />
              </InputGroup>
            )}
          />

          <FormInput
            control={form.control}
            name='password'
            label='Password'
            render={(field) => (
              <InputGroup className='h-12'>
                <InputGroupAddon className='border-r-0 bg-muted/50'>
                  <KeyIcon className='h-4 w-4 text-muted-foreground' />
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  {...field}
                  placeholder='Enter your password'
                  type='password'
                  className='h-12 border-l-0 pl-0'
                />
              </InputGroup>
            )}
          />

          <div className='flex items-center justify-end'>
            <Link
              href='/forgot-password'
              className='text-sm font-medium text-primary hover:text-primary/80 transition-colors'
            >
              Forgot password?
            </Link>
          </div>

          <Button type='submit' disabled={form.formState.isSubmitting} className='h-12 w-full text-base font-semibold'>
            {form.formState.isSubmitting ? (
              <Loader2Icon className='h-5 w-5 animate-spin' />
            ) : (
              <>
                Sign In
                <ArrowRightIcon className='ml-2 h-4 w-4' />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className='relative my-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-card px-2 text-muted-foreground'>New to YayaGO?</span>
          </div>
        </div>

        {/* Register CTA */}
        <div className='text-center'>
          <p className='text-sm text-muted-foreground'>
            Want to list your vehicles?{' '}
            <Link
              href={process.env.NEXT_PUBLIC_WEB_URL + '/en/dubai/become-a-host'}
              className='font-semibold text-primary hover:text-primary/80 transition-colors'
            >
              Become a Partner
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className='mt-6 text-center text-xs text-muted-foreground'>
        By signing in, you agree to our{' '}
        <Link href='/legal/terms' className='underline hover:text-foreground transition-colors'>
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href='/legal/privacy' className='underline hover:text-foreground transition-colors'>
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
