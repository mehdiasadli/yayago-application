'use client';

import { GoogleIcon } from './social-icons';
import { authClient } from '@/lib/auth-client';
import { ActionButton } from '@/components/action-button';
import { useRouter } from '@/lib/navigation/navigation-client';

export function SocialButtons() {
  const router = useRouter();

  async function handleGoogleSignIn() {
    const result = await authClient.signIn.social({
      provider: 'google',
      callbackURL: process.env.NEXT_PUBLIC_APP_URL,
    });

    if (result.error) {
      return { error: result.error.message };
    }

    return { data: result.data };
  }

  return (
    <div className='space-y-2'>
      <ActionButton
        variant='outline'
        className='w-full'
        size='lg'
        type='button'
        onAction={handleGoogleSignIn}
        onSuccess={() => router.refresh()}
        showSuccessToast={false}
      >
        <GoogleIcon />
        Continue with Google
      </ActionButton>
    </div>
  );
}
