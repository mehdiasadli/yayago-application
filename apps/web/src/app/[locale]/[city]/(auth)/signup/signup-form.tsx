'use client';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { AtSignIcon, Loader2Icon, LockIcon, TextIcon, UserIcon } from 'lucide-react';

import { useForm } from 'react-hook-form';
import { parseAsString, useQueryState } from 'nuqs';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import FormInput from '@/components/form-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRouter } from '@/lib/navigation/navigation-client';

export default function SignupForm() {
  const [initialName] = useQueryState('name');
  const [initialEmail] = useQueryState('email');
  const [initialUsername] = useQueryState('username');
  const [callbackURL] = useQueryState('callback_url', parseAsString.withDefault('/'));

  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: initialName || '',
      email: initialEmail || '',
      username: initialUsername || '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const { confirmPassword, acceptTerms, ...rest } = data;

    if (confirmPassword !== rest.password) {
      form.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }

    if (!acceptTerms) {
      form.setError('acceptTerms', { message: 'You must accept the terms and conditions' });
      return;
    }

    await authClient.signUp.email(
      { ...rest, callbackURL },
      {
        onError(error) {
          toast.error(error.error?.message || 'Failed to sign up');
        },
        onSuccess() {
          toast.success('Signed up successfully');

          router.push('/verify?email=' + rest.email);
        },
      }
    );
  });

  return (
    <form className='space-y-4' onSubmit={onSubmit}>
      <p className='text-start text-muted-foreground text-xs'>Create your account to continue</p>
      <FormInput
        control={form.control}
        name='name'
        render={(field) => (
          <InputGroup>
            <InputGroupInput id={field.name} {...field} placeholder='Enter your name' />
            <InputGroupAddon>
              <UserIcon />
            </InputGroupAddon>
          </InputGroup>
        )}
      />

      <FormInput
        control={form.control}
        name='username'
        render={(field) => (
          <InputGroup>
            <InputGroupInput id={field.name} {...field} placeholder='Enter your username' />
            <InputGroupAddon>
              <TextIcon />
            </InputGroupAddon>
          </InputGroup>
        )}
      />

      <FormInput
        control={form.control}
        name='email'
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
          <InputGroup>
            <InputGroupInput id={field.name} {...field} placeholder='Enter your password' type='password' />
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
          </InputGroup>
        )}
      />

      <FormInput
        control={form.control}
        name='confirmPassword'
        render={(field) => (
          <InputGroup>
            <InputGroupInput id={field.name} {...field} placeholder='Confirm your password' type='password' />
            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>
          </InputGroup>
        )}
      />

      <FormInput
        control={form.control}
        name='acceptTerms'
        render={(field) => (
          <div className='flex items-center gap-2'>
            <Checkbox id={field.name} checked={field.value} onCheckedChange={field.onChange} />
            <Label htmlFor={field.name}>I accept the terms and conditions</Label>
          </div>
        )}
      />

      <Button className='w-full' disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2Icon className='size-4 animate-spin' /> : 'Continue'}
      </Button>
    </form>
  );
}
