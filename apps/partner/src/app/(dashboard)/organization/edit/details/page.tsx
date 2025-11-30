'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orpc } from '@/utils/orpc';
import { UpdateOrgBasicInfoInputSchema, type UpdateOrgBasicInfoInputType } from '@yayago-app/validators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, X, Plus, AlertCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const SPECIALIZATION_OPTIONS = [
  'luxury', 'economy', 'sports', 'suv', 'convertible', 
  'minivan', 'electric', 'hybrid', 'commercial', 'classic',
  'exotic', 'vintage', 'off-road', 'compact', 'full-size',
  'premium', 'budget', 'long-term', 'short-term', 'chauffeur'
];

export default function EditOrganizationDetailsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [customSpec, setCustomSpec] = useState('');

  const { data: org, isLoading, error } = useQuery(
    orpc.organizations.getMyOrganization.queryOptions()
  );

  const form = useForm<UpdateOrgBasicInfoInputType>({
    resolver: zodResolver(UpdateOrgBasicInfoInputSchema),
    defaultValues: {
      name: '',
      tagline: '',
      description: '',
      foundedYear: undefined,
      specializations: [],
    },
  });

  const mutation = useMutation(
    orpc.organizations.updateBasicInfo.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ predicate: (query) => 
          Array.isArray(query.queryKey) && query.queryKey.some(k => 
            typeof k === 'string' && k.includes('organization')
          )
        });
        toast.success('Organization details updated');
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
        name: org.name,
        tagline: org.tagline || '',
        description: org.description ? JSON.stringify(org.description) : '',
        foundedYear: org.foundedYear || undefined,
        specializations: org.specializations || [],
      });
    }
  }, [org, form]);

  const onSubmit = (data: UpdateOrgBasicInfoInputType) => {
    mutation.mutate(data);
  };

  const specializations = form.watch('specializations') || [];

  const toggleSpecialization = (spec: string) => {
    const current = form.getValues('specializations') || [];
    if (current.includes(spec)) {
      form.setValue('specializations', current.filter((s) => s !== spec));
    } else {
      form.setValue('specializations', [...current, spec]);
    }
  };

  const addCustomSpecialization = () => {
    if (customSpec.trim()) {
      const normalized = customSpec.toLowerCase().trim();
      const current = form.getValues('specializations') || [];
      if (!current.includes(normalized)) {
        form.setValue('specializations', [...current, normalized]);
      }
      setCustomSpec('');
    }
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

  // Check if user is owner
  if (org.memberRole !== 'owner') {
    return (
      <div className='container py-6 max-w-2xl'>
        <Alert variant='destructive'>
          <ShieldAlert className='size-4' />
          <AlertDescription>
            Only organization owners can edit business details.
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
          <CardTitle>Edit Business Details</CardTitle>
          <CardDescription>Update your organization's basic information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Organization Name *</Label>
              <Input
                id='name'
                {...form.register('name')}
                placeholder='Enter organization name'
              />
              {form.formState.errors.name && (
                <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='tagline'>Tagline</Label>
              <Input
                id='tagline'
                {...form.register('tagline')}
                placeholder='Short description for search results'
                maxLength={200}
              />
              <p className='text-xs text-muted-foreground'>Max 200 characters</p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                {...form.register('description')}
                placeholder='Tell customers about your business'
                rows={4}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='foundedYear'>Founded Year</Label>
              <Input
                id='foundedYear'
                type='number'
                {...form.register('foundedYear', { valueAsNumber: true })}
                placeholder='2020'
                min={1900}
                max={new Date().getFullYear()}
              />
            </div>

            <div className='space-y-2'>
              <Label>Specializations</Label>
              <p className='text-xs text-muted-foreground mb-2'>
                Select the types of vehicles you specialize in, or add custom ones
              </p>
              
              {/* Common specializations */}
              <div className='flex flex-wrap gap-2 mb-3'>
                {SPECIALIZATION_OPTIONS.map((spec) => (
                  <Badge
                    key={spec}
                    variant={specializations.includes(spec) ? 'default' : 'outline'}
                    className='cursor-pointer capitalize'
                    onClick={() => toggleSpecialization(spec)}
                  >
                    {spec}
                    {specializations.includes(spec) && (
                      <X className='size-3 ml-1' />
                    )}
                  </Badge>
                ))}
              </div>

              {/* Custom specialization input */}
              <div className='flex gap-2'>
                <Input
                  placeholder='Add custom specialization'
                  value={customSpec}
                  onChange={(e) => setCustomSpec(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSpecialization();
                    }
                  }}
                />
                <Button type='button' variant='outline' onClick={addCustomSpecialization}>
                  <Plus className='size-4' />
                </Button>
              </div>

              {/* Custom specializations (ones not in the predefined list) */}
              {specializations.filter((s) => !SPECIALIZATION_OPTIONS.includes(s)).length > 0 && (
                <div className='flex flex-wrap gap-2 mt-2'>
                  <span className='text-xs text-muted-foreground'>Custom:</span>
                  {specializations
                    .filter((s) => !SPECIALIZATION_OPTIONS.includes(s))
                    .map((spec) => (
                      <Badge
                        key={spec}
                        variant='secondary'
                        className='cursor-pointer capitalize'
                        onClick={() => toggleSpecialization(spec)}
                      >
                        {spec}
                        <X className='size-3 ml-1' />
                      </Badge>
                    ))}
                </div>
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
