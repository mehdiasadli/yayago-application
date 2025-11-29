'use client';

import FormInput from '@/components/form-input';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { authClient } from '@/lib/auth-client';
import { useRouter } from '@/lib/navigation/navigation-client';
import { AtSignIcon, Loader2Icon, LockIcon } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function ResetPasswordForm() {
  const [token] = useQueryState('token');
  const [error] = useQueryState('error');

  const router = useRouter();
  const form = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    if (!token || token.trim() === '') {
      toast.error('Invalid token');
      return;
    }

    const { confirmPassword, ...rest } = data;

    if (confirmPassword !== rest.newPassword) {
      form.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }

    await authClient.resetPassword(
      { ...rest, token },
      {
        onError(error) {
          toast.error(error.error?.message || 'Failed to reset password');
        },
        onSuccess() {
          toast.success('Password reset successfully. Redirecting to login...');

          setTimeout(() => {
            router.push('/login');
          }, 500);
        },
      }
    );
  });

  if (error === 'INVALID_TOKEN') {
    return (
      <div className='text-center text-destructive text-sm'>
        The link is invalid or expired. Try to start over again.
      </div>
    );
  }

  return (
    <form className='space-y-3' onSubmit={onSubmit}>
      <FormInput
        control={form.control}
        name='newPassword'
        label='New Password'
        render={(field) => (
          <InputGroup>
            <InputGroupInput id={field.name} {...field} placeholder='Enter your new password' type='password' />
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
          </InputGroup>
        )}
      />

      <FormInput
        control={form.control}
        name='confirmPassword'
        label='Confirm Password'
        render={(field) => (
          <InputGroup>
            <InputGroupInput id={field.name} {...field} placeholder='Confirm your new password' type='password' />
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
          </InputGroup>
        )}
      />

      <Button className='w-full' disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2Icon className='size-4 animate-spin' /> : 'Reset Password'}
      </Button>
    </form>
  );
}
