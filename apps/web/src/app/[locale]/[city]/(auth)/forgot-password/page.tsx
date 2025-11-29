import { Link } from '@/lib/navigation/navigation-client';
import { AuthHeader } from '../_components/auth-header';
import ForgotPasswordForm from './forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader title='Forgot Password' description='Enter your email to reset your password.' />

      <ForgotPasswordForm />

      <p className='text-center text-muted-foreground text-sm'>
        Back to{' '}
        <Link className='hover:underline hover:text-primary' href='/login'>
          Login
        </Link>
      </p>
    </>
  );
}
