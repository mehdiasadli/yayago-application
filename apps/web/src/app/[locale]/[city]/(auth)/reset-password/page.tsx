import { Link } from '@/lib/navigation/navigation-client';
import { AuthHeader } from '../_components/auth-header';
import ResetPasswordForm from './reset-password-form';
import { Suspense } from 'react';

export default async function ResetPasswordPage() {
  return (
    <>
      <AuthHeader title='Reset Password' description='Enter your new password.' />

      <Suspense>
        <ResetPasswordForm />
      </Suspense>

      <p className='text-center text-muted-foreground text-sm'>
        Back to{' '}
        <Link className='hover:underline hover:text-primary' href='/login'>
          Login
        </Link>
      </p>
    </>
  );
}
