'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { SubmitDriverLicenseInputSchema, type SubmitDriverLicenseInputType } from '@yayago-app/validators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  CreditCard,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
  CalendarIcon,
  Image as ImageIcon,
  FileCheck,
  Info,
} from 'lucide-react';

export default function VerificationPage() {
  const queryClient = useQueryClient();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery(orpc.users.getMyProfile.queryOptions());

  const form = useForm({
    resolver: zodResolver(SubmitDriverLicenseInputSchema),
    defaultValues: {
      licenseNumber: '',
      country: '',
      expiryDate: new Date(),
      frontImage: '',
      backImage: '',
    },
  });

  const submitMutation = useMutation(
    orpc.users.submitDriverLicense.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Driver license submitted for verification');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to submit driver license');
      },
    })
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please select an image or PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (side === 'front') {
        setFrontPreview(dataUrl);
        form.setValue('frontImage', dataUrl);
      } else {
        setBackPreview(dataUrl);
        form.setValue('backImage', dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = form.handleSubmit((data: SubmitDriverLicenseInputType) => {
    submitMutation.mutate(data);
  });

  if (isLoading) {
    return <VerificationSkeleton />;
  }

  if (!profile) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='size-4' />
        <AlertDescription>Failed to load profile</AlertDescription>
      </Alert>
    );
  }

  const verificationStatus = profile.driverLicenseVerificationStatus;

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'APPROVED':
        return (
          <Badge variant='default' className='gap-1 bg-green-500'>
            <CheckCircle className='size-3' />
            Verified
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant='secondary' className='gap-1'>
            <Clock className='size-3' />
            Pending Review
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant='destructive' className='gap-1'>
            <XCircle className='size-3' />
            Rejected
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant='destructive' className='gap-1'>
            <AlertTriangle className='size-3' />
            Expired
          </Badge>
        );
      default:
        return (
          <Badge variant='outline' className='gap-1'>
            <Info className='size-3' />
            Not Submitted
          </Badge>
        );
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Identity Verification</h2>
        <p className='text-muted-foreground'>Verify your driver's license to book vehicles</p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='size-5' />
              Driver's License Status
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {verificationStatus === 'APPROVED' ? (
            <div className='flex items-center gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20'>
              <FileCheck className='size-10 text-green-500' />
              <div>
                <p className='font-medium text-green-700 dark:text-green-400'>Your driver's license is verified</p>
                <p className='text-sm text-muted-foreground'>
                  License #{profile.driverLicenseNumber} • {profile.driverLicenseCountry} • Expires{' '}
                  {profile.driverLicenseExpiry ? format(new Date(profile.driverLicenseExpiry), 'MMM yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          ) : verificationStatus === 'PENDING' ? (
            <div className='flex items-center gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20'>
              <Clock className='size-10 text-blue-500' />
              <div>
                <p className='font-medium text-blue-700 dark:text-blue-400'>Your license is under review</p>
                <p className='text-sm text-muted-foreground'>
                  This usually takes 1-2 business days. We'll notify you once it's verified.
                </p>
              </div>
            </div>
          ) : verificationStatus === 'REJECTED' ? (
            <Alert variant='destructive'>
              <XCircle className='size-4' />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>
                Your license was rejected. Please submit a new one with clear, readable images.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className='size-4' />
              <AlertTitle>Verification Required</AlertTitle>
              <AlertDescription>
                A valid driver's license is required to rent vehicles on YayaGO. Submit your license below to get
                verified.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Submit Form (show if not approved or if rejected) */}
      {verificationStatus !== 'APPROVED' && verificationStatus !== 'PENDING' && (
        <form onSubmit={onSubmit} className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>License Details</CardTitle>
              <CardDescription>Enter your driver's license information</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='licenseNumber'>License Number *</Label>
                  <Input id='licenseNumber' placeholder='Enter license number' {...form.register('licenseNumber')} />
                  {form.formState.errors.licenseNumber && (
                    <p className='text-sm text-destructive'>{form.formState.errors.licenseNumber.message}</p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='country'>Issuing Country *</Label>
                  <Input id='country' placeholder='e.g., United Arab Emirates' {...form.register('country')} />
                  {form.formState.errors.country && (
                    <p className='text-sm text-destructive'>{form.formState.errors.country.message}</p>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Expiry Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !form.watch('expiryDate') && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {form.watch('expiryDate')
                        ? format(new Date(form.watch('expiryDate') as string), 'PPP')
                        : 'Select expiry date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={new Date(form.watch('expiryDate') as Date)}
                      onSelect={(date) => form.setValue('expiryDate', date || new Date())}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.expiryDate && (
                  <p className='text-sm text-destructive'>{form.formState.errors.expiryDate.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload License Images</CardTitle>
              <CardDescription>Take clear photos of the front and back of your license</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid sm:grid-cols-2 gap-4'>
                {/* Front Image */}
                <div className='space-y-2'>
                  <Label>Front Side *</Label>
                  <div
                    onClick={() => frontInputRef.current?.click()}
                    className={cn(
                      'relative aspect-[3/2] rounded-lg border-2 border-dashed cursor-pointer transition-colors',
                      'hover:border-primary hover:bg-primary/5',
                      frontPreview ? 'border-solid border-primary' : 'border-muted-foreground/25'
                    )}
                  >
                    {frontPreview ? (
                      <img src={frontPreview} alt='License front' className='w-full h-full object-cover rounded-lg' />
                    ) : (
                      <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                        <Upload className='size-8' />
                        <span className='text-sm'>Click to upload front</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={frontInputRef}
                    type='file'
                    accept='image/*,.pdf'
                    className='hidden'
                    onChange={(e) => handleImageUpload(e, 'front')}
                  />
                  {form.formState.errors.frontImage && (
                    <p className='text-sm text-destructive'>Front image is required</p>
                  )}
                </div>

                {/* Back Image */}
                <div className='space-y-2'>
                  <Label>Back Side (Optional)</Label>
                  <div
                    onClick={() => backInputRef.current?.click()}
                    className={cn(
                      'relative aspect-[3/2] rounded-lg border-2 border-dashed cursor-pointer transition-colors',
                      'hover:border-primary hover:bg-primary/5',
                      backPreview ? 'border-solid border-primary' : 'border-muted-foreground/25'
                    )}
                  >
                    {backPreview ? (
                      <img src={backPreview} alt='License back' className='w-full h-full object-cover rounded-lg' />
                    ) : (
                      <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                        <Upload className='size-8' />
                        <span className='text-sm'>Click to upload back</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={backInputRef}
                    type='file'
                    accept='image/*,.pdf'
                    className='hidden'
                    onChange={(e) => handleImageUpload(e, 'back')}
                  />
                </div>
              </div>

              <Alert>
                <ImageIcon className='size-4' />
                <AlertDescription>
                  Ensure images are clear, well-lit, and all text is readable. We accept JPG, PNG, or PDF files up to
                  10MB.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className='flex justify-end'>
            <Button type='submit' disabled={submitMutation.isPending} size='lg'>
              {submitMutation.isPending ? (
                <Loader2 className='size-4 mr-2 animate-spin' />
              ) : (
                <Upload className='size-4 mr-2' />
              )}
              Submit for Verification
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function VerificationSkeleton() {
  return (
    <div className='space-y-6'>
      <div>
        <Skeleton className='h-8 w-48 mb-2' />
        <Skeleton className='h-4 w-72' />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-40' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-24 w-full' />
        </CardContent>
      </Card>
    </div>
  );
}
