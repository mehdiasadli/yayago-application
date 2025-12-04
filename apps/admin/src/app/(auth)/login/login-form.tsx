'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import FormInput from '@/components/form-input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { ArrowRightIcon, ShieldCheckIcon, KeyIcon, MailIcon, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

        if (user.role !== 'admin' && user.role !== 'moderator') {
          toast.error('Access denied. Admin or moderator role required.');
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
          <ShieldCheckIcon className='h-7 w-7 text-primary' />
        </div>
        <h1 className='text-2xl font-bold tracking-tight'>Admin Console</h1>
        <p className='mt-2 text-sm text-muted-foreground'>Secure access to YayaGO administration</p>
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
                  placeholder='admin@yayago.com'
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

        {/* Security Notice */}
        <div className='mt-6 rounded-lg bg-muted/50 p-4'>
          <div className='flex items-start gap-3'>
            <ShieldCheckIcon className='h-5 w-5 text-muted-foreground shrink-0 mt-0.5' />
            <div className='text-xs text-muted-foreground'>
              <p className='font-medium text-foreground'>Secure Access</p>
              <p className='mt-1'>
                This portal is restricted to authorized administrators and moderators only. All activities are logged
                and monitored.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className='mt-6 text-center text-xs text-muted-foreground'>
        Protected by YayaGO Security •{' '}
        <Link href='/legal/privacy' className='underline hover:text-foreground transition-colors'>
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
