import LoginForm from './login-form';
import { Suspense } from 'react';
import { SocialButtons } from '../_components/social-buttons';
import { AuthFooter } from '../_components/auth-footer';
import { AuthHeader } from '../_components/auth-header';
import { Link } from '@/lib/navigation/navigation-client';

export default function LoginPage() {
  return (
    <>
      <AuthHeader title='Welcome!' description='Login to your account to continue.' />

      <SocialButtons />

      <div className='flex w-full items-center justify-center'>
        <div className='h-px w-full bg-border' />
        <span className='px-2 text-muted-foreground text-xs'>OR</span>
        <div className='h-px w-full bg-border' />
      </div>

      <Suspense>
        <LoginForm />
      </Suspense>

      <p className='text-center text-muted-foreground text-sm'>
        Don't have an account?{' '}
        <Link className='hover:underline hover:text-primary' href='/signup'>
          Sign up
        </Link>
      </p>

      <AuthFooter />
    </>
  );
}
