'use client';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { AtSignIcon, Loader2Icon, LockIcon } from 'lucide-react';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { useForm } from 'react-hook-form';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import FormInput from '@/components/form-input';
import { FieldLabel } from '@/components/ui/field';
import { Link, useRouter } from '@/lib/navigation/navigation-client';

export default function LoginForm() {
  const [initialEmail] = useQueryState('email');
  const [initialRememberMe] = useQueryState('remember_me', parseAsBoolean);
  const [callbackURL] = useQueryState('callback_url');
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: initialEmail || '',
      rememberMe: initialRememberMe || false,
      password: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await authClient.signIn.email(data, {
      onError(error) {
        toast.error(error.error?.message || 'Failed to sign in');
      },
      onSuccess() {
        toast.success('Signed in successfully');
        console.log(callbackURL);
        router.push(callbackURL || '/');
      },
    });
  });

  return (
    <form className='space-y-3' onSubmit={onSubmit}>
      <p className='text-start text-muted-foreground text-xs'>Enter your credentials to sign in</p>

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

      <FormInput
        control={form.control}
        name='password'
        render={(field) => (
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between gap-2'>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <Link className='ml-auto text-sm text-muted-foreground hover:underline' href='/forgot-password'>
                Forgot password?
              </Link>
            </div>
            <InputGroup>
              <InputGroupInput id={field.name} {...field} placeholder='Enter your password' type='password' />
              <InputGroupAddon>
                <LockIcon />
              </InputGroupAddon>
            </InputGroup>
          </div>
        )}
      />

      <Button className='w-full' disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2Icon className='size-4 animate-spin' /> : 'Continue'}
      </Button>
    </form>
  );
}
