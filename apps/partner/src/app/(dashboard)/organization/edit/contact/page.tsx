'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orpc } from '@/utils/orpc';
import { UpdateOrgContactInfoInputSchema, type UpdateOrgContactInfoInputType } from '@yayago-app/validators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, AlertCircle, Mail, Phone, Globe, MessageCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EditOrganizationContactPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: org, isLoading, error } = useQuery(orpc.organizations.getMyOrganization.queryOptions());

  const form = useForm<UpdateOrgContactInfoInputType>({
    resolver: zodResolver(UpdateOrgContactInfoInputSchema),
    defaultValues: {
      email: '',
      phoneNumber: '',
      website: '',
      whatsapp: '',
    },
  });

  const mutation = useMutation(
    orpc.organizations.updateContactInfo.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organizations', 'getMyOrganization'] });
        toast.success('Contact information updated');
        router.push('/organization');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to update');
      },
    })
  );

  useEffect(() => {
    if (org) {
      form.reset({
        email: org.email || '',
        phoneNumber: org.phoneNumber || '',
        website: org.website || '',
        whatsapp: org.whatsapp || '',
      });
    }
  }, [org, form]);

  const onSubmit = (data: UpdateOrgContactInfoInputType) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className='container py-6 max-w-2xl'>
        <Skeleton className='h-8 w-48 mb-6' />
        <Skeleton className='h-80' />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className='container py-6 max-w-2xl'>
        <Alert variant='destructive'>
          <AlertCircle className='size-4' />
          <AlertDescription>Failed to load organization data</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user is owner
  if (org.memberRole !== 'owner') {
    return (
      <div className='container py-6 max-w-2xl'>
        <Alert variant='destructive'>
          <ShieldAlert className='size-4' />
          <AlertDescription>
            Only organization owners can edit contact information.
          </AlertDescription>
        </Alert>
        <Button asChild variant='outline' className='mt-4'>
          <Link href='/organization'>
            <ArrowLeft className='size-4 mr-1.5' />
            Back to Organization
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='container py-6 max-w-2xl'>
      <Button asChild variant='ghost' size='sm' className='mb-4'>
        <Link href='/organization'>
          <ArrowLeft className='size-4 mr-1.5' />
          Back to Organization
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Contact Information</CardTitle>
          <CardDescription>Update how customers can reach you</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='email' className='flex items-center gap-2'>
                <Mail className='size-4 text-muted-foreground' />
                Email Address
              </Label>
              <Input id='email' type='email' {...form.register('email')} placeholder='contact@yourcompany.com' />
              {form.formState.errors.email && (
                <p className='text-sm text-destructive'>{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='phoneNumber' className='flex items-center gap-2'>
                <Phone className='size-4 text-muted-foreground' />
                Phone Number
              </Label>
              <Input id='phoneNumber' {...form.register('phoneNumber')} placeholder='+971 50 123 4567' />
              {form.formState.errors.phoneNumber && (
                <p className='text-sm text-destructive'>{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='whatsapp' className='flex items-center gap-2'>
                <MessageCircle className='size-4 text-muted-foreground' />
                WhatsApp Number
              </Label>
              <Input id='whatsapp' {...form.register('whatsapp')} placeholder='+971 50 123 4567' />
              <p className='text-xs text-muted-foreground'>
                Customers can contact you via WhatsApp. Include country code.
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='website' className='flex items-center gap-2'>
                <Globe className='size-4 text-muted-foreground' />
                Website
              </Label>
              <Input id='website' type='url' {...form.register('website')} placeholder='https://www.yourcompany.com' />
              {form.formState.errors.website && (
                <p className='text-sm text-destructive'>{form.formState.errors.website.message}</p>
              )}
            </div>

            <div className='flex justify-end gap-3 pt-4 border-t'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type='submit' disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className='size-4 mr-2 animate-spin' />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
