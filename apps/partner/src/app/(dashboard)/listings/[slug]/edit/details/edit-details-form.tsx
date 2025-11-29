'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, X } from 'lucide-react';
import { orpc } from '@/utils/orpc';
import FormInput from '@/components/form-input';
import type { FindOneListingOutputType } from '@yayago-app/validators';
import { useState } from 'react';

const EditDetailsSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(5000).optional().nullable(),
  tags: z.array(z.string().max(50)).max(10),
});

type EditDetailsFormValues = z.infer<typeof EditDetailsSchema>;

interface EditDetailsFormProps {
  listing: FindOneListingOutputType;
}

export default function EditDetailsForm({ listing }: EditDetailsFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState('');

  const form = useForm<EditDetailsFormValues>({
    resolver: zodResolver(EditDetailsSchema),
    defaultValues: {
      title: listing.title,
      description: listing.description || '',
      tags: listing.tags || [],
    },
  });

  const { mutate, isPending } = useMutation(
    orpc.listings.update.mutationOptions({
      onSuccess: () => {
        toast.success('Listing details updated');
        queryClient.invalidateQueries({ queryKey: ['listings'] });
        router.push(`/listings/${listing.slug}/edit`);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update listing');
      },
    })
  );

  const onSubmit = form.handleSubmit((data) => {
    mutate({
      slug: listing.slug,
      data: {
        title: data.title,
        description: data.description || null,
        tags: data.tags,
      },
    });
  });

  const tags = form.watch('tags');

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      form.setValue('tags', [...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    form.setValue(
      'tags',
      tags.filter((t) => t !== tag)
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
          <CardDescription>Update the basic information about your listing</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <FormInput
            control={form.control}
            name='title'
            label='Title'
            description='A descriptive title for your listing'
            render={(field) => <Input {...field} placeholder='e.g. BMW M5 2025 - Luxury Sedan' />}
          />

          <FormInput
            control={form.control}
            name='description'
            label='Description'
            description='Detailed description of your vehicle and rental terms'
            render={(field) => (
              <Textarea
                {...field}
                value={field.value || ''}
                placeholder='Describe your vehicle, its features, condition, and any special rental terms...'
                rows={6}
              />
            )}
          />

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Tags</label>
            <p className='text-sm text-muted-foreground'>Add tags to help renters find your listing (max 10)</p>
            <div className='flex gap-2'>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder='Type a tag and press Enter'
                className='flex-1'
              />
              <Button type='button' variant='outline' onClick={addTag} disabled={!tagInput.trim() || tags.length >= 10}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-3'>
                {tags.map((tag) => (
                  <Badge key={tag} variant='secondary' className='gap-1 pr-1'>
                    {tag}
                    <button
                      type='button'
                      onClick={() => removeTag(tag)}
                      className='ml-1 rounded-full hover:bg-destructive/20 p-0.5'
                    >
                      <X className='size-3' />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='size-4 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='size-4' />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

