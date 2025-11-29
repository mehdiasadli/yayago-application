import { Button } from '@/components/ui/button';
import { AuthHeader } from '../_components/auth-header';
import { ChevronLeftIcon } from 'lucide-react';
import { createLoader, parseAsString } from 'nuqs/server';
import { Link } from '@/lib/navigation/navigation-client';

interface VerifyPageProps extends PageProps<'/[locale]/[city]/verify'> {}

const loadSearchParams = createLoader({
  email: parseAsString.withDefault(''),
  callbackURL: parseAsString.withDefault(''),
});

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const parsedSearchParams = await loadSearchParams(searchParams);

  return (
    <>
      <AuthHeader
        title='Verify your email'
        description="Verification has been sent to your email address. Check your email address (if you don't see it, check your spam folder). Click the link in the email to verify your email address."
      />

      <Button asChild variant='outline'>
        <Link href={`/login?callback_url=${parsedSearchParams.callbackURL}&email=${parsedSearchParams.email}`}>
          <ChevronLeftIcon />
          Back to login
        </Link>
      </Button>
    </>
  );
}
