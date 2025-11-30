'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orpc } from '@/utils/orpc';
import { UpdateOrgSocialMediaInputSchema, type UpdateOrgSocialMediaInputType } from '@yayago-app/validators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, AlertCircle, Share2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const socialFields = [
  { key: 'facebookUrl', label: 'Facebook', placeholder: 'https://facebook.com/yourpage', icon: 'F' },
  { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/yourprofile', icon: 'I' },
  { key: 'twitterUrl', label: 'X (Twitter)', placeholder: 'https://x.com/yourhandle', icon: 'X' },
  { key: 'linkedinUrl', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourcompany', icon: 'in' },
  { key: 'youtubeUrl', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel', icon: 'YT' },
  { key: 'tiktokUrl', label: 'TikTok', placeholder: 'https://tiktok.com/@yourprofile', icon: 'TT' },
] as const;

export default function EditOrganizationSocialPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: org, isLoading, error } = useQuery(
    orpc.organizations.getMyOrganization.queryOptions()
  );

  const form = useForm<UpdateOrgSocialMediaInputType>({
    resolver: zodResolver(UpdateOrgSocialMediaInputSchema),
    defaultValues: {
      facebookUrl: '',
      instagramUrl: '',
      twitterUrl: '',
      linkedinUrl: '',
      youtubeUrl: '',
      tiktokUrl: '',
    },
  });

  const mutation = useMutation(
    orpc.organizations.updateSocialMedia.mutationOptions({
      onSuccess: () => {
        // Invalidate all organization queries to ensure fresh data
        queryClient.invalidateQueries({ predicate: (query) => 
          Array.isArray(query.queryKey) && query.queryKey.some(k => 
            typeof k === 'string' && k.includes('organization')
          )
        });
        toast.success('Social media links updated');
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
        facebookUrl: org.facebookUrl || '',
        instagramUrl: org.instagramUrl || '',
        twitterUrl: org.twitterUrl || '',
        linkedinUrl: org.linkedinUrl || '',
        youtubeUrl: org.youtubeUrl || '',
        tiktokUrl: org.tiktokUrl || '',
      });
    }
  }, [org, form]);

  const onSubmit = (data: UpdateOrgSocialMediaInputType) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className='container py-6 max-w-2xl'>
        <Skeleton className='h-8 w-48 mb-6' />
        <Skeleton className='h-96' />
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

  // Check if user is owner or admin
  if (org.memberRole !== 'owner' && org.memberRole !== 'admin') {
    return (
      <div className='container py-6 max-w-2xl'>
        <Alert variant='destructive'>
          <ShieldAlert className='size-4' />
          <AlertDescription>
            Only organization owners or admins can edit social media.
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
          <CardTitle className='flex items-center gap-2'>
            <Share2 className='size-5' />
            Edit Social Media
          </CardTitle>
          <CardDescription>Add your social media profiles to increase visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {socialFields.map((field) => (
              <div key={field.key} className='space-y-2'>
                <Label htmlFor={field.key} className='flex items-center gap-2'>
                  <span className='w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-bold'>
                    {field.icon}
                  </span>
                  {field.label}
                </Label>
                <Input
                  id={field.key}
                  type='url'
                  {...form.register(field.key)}
                  placeholder={field.placeholder}
                />
                {form.formState.errors[field.key] && (
                  <p className='text-sm text-destructive'>
                    {form.formState.errors[field.key]?.message}
                  </p>
                )}
              </div>
            ))}

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

