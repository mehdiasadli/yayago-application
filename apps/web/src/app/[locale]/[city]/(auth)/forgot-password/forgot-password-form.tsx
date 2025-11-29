'use client';

import FormInput from '@/components/form-input';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { authClient } from '@/lib/auth-client';
import { useAbsoluteUrl, useRouter } from '@/lib/navigation/navigation-client';
import { AtSignIcon, Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      email: '',
    },
  });
  const getAbsoluteUrl = useAbsoluteUrl();

  const onSubmit = form.handleSubmit(async (data) => {
    await authClient.requestPasswordReset(
      { ...data, redirectTo: getAbsoluteUrl('/reset-password') },
      {
        onError(error) {
          toast.error(error.error?.message || 'Failed to request password reset');
        },
        onSuccess() {
          toast.success('Password reset email sent. Check your email for the reset link.');
          router.push('/login');
        },
      }
    );
  });

  return (
    <form className='space-y-3' onSubmit={onSubmit}>
      <FormInput
        control={form.control}
        name='email'
        label='Email'
        render={(field) => (
          <InputGroup>
            <InputGroupInput id={field.name} {...field} placeholder='Enter your email' />
            <InputGroupAddon>
              <AtSignIcon />
            </InputGroupAddon>
          </InputGroup>
        )}
      />

      <Button className='w-full' disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2Icon className='size-4 animate-spin' /> : 'Continue'}
      </Button>
    </form>
  );
}
