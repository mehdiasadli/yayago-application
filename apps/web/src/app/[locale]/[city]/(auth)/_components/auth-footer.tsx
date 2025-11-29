import { Link } from '@/lib/navigation/navigation-client';

export function AuthFooter() {
  return (
    <p className='mt-8 text-muted-foreground text-sm'>
      By clicking continue, you agree to our{' '}
      <Link className='underline underline-offset-4 hover:text-primary' href='/legal/terms-of-service'>
        Terms of Service
      </Link>{' '}
      and{' '}
      <Link className='underline underline-offset-4 hover:text-primary' href='/legal/privacy-policy'>
        Privacy Policy
      </Link>
    </p>
  );
}
