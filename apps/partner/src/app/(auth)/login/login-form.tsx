'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import FormInput from '@/components/form-input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { AtSignIcon, Loader2Icon, LockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orpc } from '@/utils/orpc';

export default function LoginForm() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await authClient.signIn.email(data, {
      onError(error) {
        console.error(error);
        toast.error(error.error?.message || 'Failed to login');
      },
      async onSuccess(result) {
        const session = await authClient.getSession({
          fetchOptions: {
            headers: {
              Authorization: `Bearer ${result.data?.accessToken}`,
            },
          },
        });

        const user = session.data?.user;

        if (!user) {
          toast.error('Invalid credentials');
          return;
        }

        const member = await orpc.members.isMemberOfAnyOrganization.call();

        if (!member) {
          toast.error('Invalid credentials');
          return;
        }

        router.push('/');
      },
    });
  });

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='space-y-3'>
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
            label='Password'
            render={(field) => (
              <InputGroup>
                <InputGroupInput id={field.name} {...field} placeholder='Enter your password' type='password' />
                <InputGroupAddon>
                  <LockIcon />
                </InputGroupAddon>
              </InputGroup>
            )}
          />

          <Button type='submit' disabled={form.formState.isSubmitting} className='mt-4'>
            {form.formState.isSubmitting ? <Loader2Icon className='w-4 h-4 animate-spin' /> : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
