'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Camera, Pencil, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useOrgContext } from '../page';

export function OrganizationHeader() {
  const { org, canEdit } = useOrgContext();
  const queryClient = useQueryClient();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Refs for file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const updateBrandingMutation = useMutation(
    orpc.organizations.updateBranding.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey.some((k) => typeof k === 'string' && k.includes('organization')),
        });
        toast.success('Branding updated successfully');
      },
      onError: (error) => {
        console.error('Branding update error:', error);
        toast.error(error.message || 'Failed to update branding');
      },
    })
  );

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const dataUrl = await fileToBase64(file);
      await updateBrandingMutation.mutateAsync({ logo: dataUrl });
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setIsUploadingCover(true);
    try {
      const dataUrl = await fileToBase64(file);
      await updateBrandingMutation.mutateAsync({ cover: dataUrl });
    } catch (error) {
      console.error('Cover upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload cover');
    } finally {
      setIsUploadingCover(false);
      e.target.value = ''; // Reset input
    }
  };

  const getStatusBadge = () => {
    switch (org.status) {
      case 'ACTIVE':
        return (
          <Badge variant='success' className='gap-1'>
            <CheckCircle className='size-3' /> Active
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant='warning' className='gap-1'>
            <Clock className='size-3' /> Pending Review
          </Badge>
        );
      case 'SUSPENDED':
        return (
          <Badge variant='destructive' className='gap-1'>
            <AlertCircle className='size-3' /> Suspended
          </Badge>
        );
      default:
        return <Badge variant='secondary'>{org.status}</Badge>;
    }
  };

  return (
    <Card className='overflow-hidden'>
      {/* Cover Image */}
      <div className='relative h-32 sm:h-48 bg-muted'>
        {org.cover ? (
          <Image src={org.cover} alt='Cover' fill className='object-cover' priority />
        ) : (
          <div className='w-full h-full bg-linear-to-r from-primary/20 to-primary/5' />
        )}

        {canEdit && (
          <>
            <input
              ref={coverInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleCoverUpload}
              disabled={isUploadingCover}
            />
            <Button
              size='sm'
              variant='secondary'
              className='absolute bottom-3 right-3 gap-1.5'
              disabled={isUploadingCover}
              onClick={() => coverInputRef.current?.click()}
            >
              {isUploadingCover ? <Loader2 className='size-3 animate-spin' /> : <Camera className='size-3' />}
              Change Cover
            </Button>
          </>
        )}
      </div>

      <CardContent className='relative pt-0'>
        {/* Logo */}
        <div className='flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16'>
          <div className='relative'>
            <Avatar className='size-24 sm:size-32 border-4 border-background shadow-lg'>
              <AvatarImage src={org.logo || undefined} alt={org.name} />
              <AvatarFallback className='text-2xl sm:text-3xl bg-primary text-primary-foreground'>
                {org.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {canEdit && (
              <>
                <input
                  ref={logoInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo}
                />
                <Button
                  size='icon'
                  variant='secondary'
                  className='absolute bottom-0 right-0 size-8 rounded-full shadow'
                  disabled={isUploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {isUploadingLogo ? <Loader2 className='size-3 animate-spin' /> : <Pencil className='size-3' />}
                </Button>
              </>
            )}
          </div>

          <div className='flex-1 pb-4 sm:pb-2'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
              <div>
                <h1 className='text-xl sm:text-2xl font-bold flex items-center gap-2'>
                  {org.name}
                  {getStatusBadge()}
                </h1>
                {org.tagline && <p className='text-muted-foreground mt-0.5'>{org.tagline}</p>}
                <p className='text-sm text-muted-foreground mt-1 flex items-center gap-1'>
                  <Building2 className='size-3.5' />@{org.slug}
                  {org.city && (
                    <>
                      <span className='mx-1'>•</span>
                      {org.city.name}, {org.city.country.name}
                    </>
                  )}
                </p>
              </div>

              <div className='flex gap-2'>
                <p className='text-sm text-muted-foreground'>
                  <span className='font-medium text-foreground'>{org._count.listings}</span> Listings
                </p>
                <span className='text-muted-foreground'>•</span>
                <p className='text-sm text-muted-foreground'>
                  <span className='font-medium text-foreground'>{org._count.members}</span> Members
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
