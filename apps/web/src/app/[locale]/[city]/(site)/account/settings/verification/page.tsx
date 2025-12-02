'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import {
  IdCard,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  FileCheck,
  Info,
  ShieldCheck,
  Eye,
  Phone,
  MapPin,
  Camera,
  RefreshCw,
  Loader2,
  Lock,
} from 'lucide-react';
import { useVerification } from '@/contexts/verification-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

// Helper to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function VerificationPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery(orpc.users.getMyProfile.queryOptions());
  const { openModal } = useVerification();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showResubmitDialog, setShowResubmitDialog] = useState(false);
  const [resubmitImages, setResubmitImages] = useState<{
    licenseFront: string | null;
    licenseBack: string | null;
    selfie: string | null;
  }>({ licenseFront: null, licenseBack: null, selfie: null });

  const licenseFrontRef = useRef<HTMLInputElement>(null);
  const licenseBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  // Fetch secure document URLs
  const {
    data: documentUrls,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    ...orpc.users.getVerificationDocumentUrls.queryOptions({ input: {} }),
    enabled: !!profile && profile.driverLicenseVerificationStatus !== 'NOT_SUBMITTED',
    staleTime: 4 * 60 * 1000, // 4 minutes (refresh before 5-minute expiration)
  });

  // Resubmit mutation
  const resubmitMutation = useMutation(
    orpc.users.resubmitVerification.mutationOptions({
      onSuccess: () => {
        toast.success('Documents resubmitted! We will review them shortly.');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        setShowResubmitDialog(false);
        setResubmitImages({ licenseFront: null, licenseBack: null, selfie: null });
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to resubmit documents');
      },
    })
  );

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

  const hasSubmittedDocuments = profile.driverLicenseVerificationStatus !== 'NOT_SUBMITTED';
  const canResubmit = ['EXPIRED', 'REJECTED'].includes(verificationStatus);

  const formatCountry = () => {
    if (!profile.driverLicenseCountry) return 'Not set';
    if (profile.driverLicenseCountryCode) {
      return `${profile.driverLicenseCountry} (${profile.driverLicenseCountryCode})`;
    }
    return profile.driverLicenseCountry;
  };

  const handleFileChange = async (
    type: 'licenseFront' | 'licenseBack' | 'selfie',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setResubmitImages((prev) => ({ ...prev, [type]: base64 }));
    } catch {
      toast.error('Failed to read file');
    }
  };

  const handleResubmit = () => {
    if (!resubmitImages.licenseFront || !resubmitImages.licenseBack || !resubmitImages.selfie) {
      toast.error('Please upload all required documents');
      return;
    }

    resubmitMutation.mutate({
      licenseFrontImage: resubmitImages.licenseFront,
      licenseBackImage: resubmitImages.licenseBack,
      selfieImage: resubmitImages.selfie,
    });
  };

  const handleImageClick = (url: string | null | undefined) => {
    if (url) {
      setPreviewImage(url);
      // Refetch URLs in case they're about to expire
      refetchDocuments();
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Identity Verification</h2>
        <p className='text-muted-foreground'>Your verified identity information</p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <ShieldCheck className='size-5' />
              Verification Status
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {verificationStatus === 'APPROVED' ? (
            <div className='flex items-center gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20'>
              <FileCheck className='size-10 text-green-500' />
              <div>
                <p className='font-medium text-green-700 dark:text-green-400'>Your identity is verified</p>
                <p className='text-sm text-muted-foreground'>You can now book vehicles on YayaGO.</p>
              </div>
            </div>
          ) : verificationStatus === 'PENDING' ? (
            <div className='flex items-center gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20'>
              <Clock className='size-10 text-blue-500' />
              <div>
                <p className='font-medium text-blue-700 dark:text-blue-400'>Your documents are under review</p>
                <p className='text-sm text-muted-foreground'>
                  This usually takes 1-2 business days. We'll notify you once it's verified.
                </p>
              </div>
            </div>
          ) : verificationStatus === 'EXPIRED' ? (
            <div className='space-y-4'>
              <Alert variant='destructive'>
                <AlertTriangle className='size-4' />
                <AlertTitle>Driver License Expired</AlertTitle>
                <AlertDescription>
                  Your driver license has expired. Please upload new documents to continue booking vehicles.
                </AlertDescription>
              </Alert>
              <Button onClick={() => setShowResubmitDialog(true)} className='w-full'>
                <RefreshCw className='size-4 mr-2' />
                Update Documents
              </Button>
            </div>
          ) : verificationStatus === 'REJECTED' ? (
            <div className='space-y-4'>
              <Alert variant='destructive'>
                <XCircle className='size-4' />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>Your verification was rejected. Please submit new documents.</AlertDescription>
              </Alert>
              <Button onClick={() => setShowResubmitDialog(true)} className='w-full'>
                <RefreshCw className='size-4 mr-2' />
                Submit New Documents
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              <Alert>
                <Info className='size-4' />
                <AlertTitle>Verification Required</AlertTitle>
                <AlertDescription>
                  A verified identity is required to rent vehicles on YayaGO. Submit your documents to get verified.
                </AlertDescription>
              </Alert>
              <Button onClick={openModal} className='w-full'>
                Start Verification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verified Information */}
      {hasSubmittedDocuments && (
        <>
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='size-5' />
                Personal Information
              </CardTitle>
              <CardDescription>Information verified from your documents</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-muted-foreground'>Legal First Name</Label>
                  <Input value={profile.firstName || 'Not set'} disabled className='bg-muted' />
                </div>
                <div className='space-y-2'>
                  <Label className='text-muted-foreground'>Legal Last Name</Label>
                  <Input value={profile.lastName || 'Not set'} disabled className='bg-muted' />
                </div>
              </div>

              <div className='grid sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-muted-foreground flex items-center gap-2'>
                    <Calendar className='size-4' />
                    Date of Birth
                  </Label>
                  <Input
                    value={profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'PPP') : 'Not set'}
                    disabled
                    className='bg-muted'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-muted-foreground'>Gender</Label>
                  <Input
                    value={
                      profile.gender
                        ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).replace(/_/g, ' ')
                        : 'Not set'
                    }
                    disabled
                    className='bg-muted'
                  />
                </div>
              </div>

              {profile.phoneNumber && (
                <div className='space-y-2'>
                  <Label className='text-muted-foreground flex items-center gap-2'>
                    <Phone className='size-4' />
                    Verified Phone Number
                  </Label>
                  <Input value={profile.phoneNumber} disabled className='bg-muted' />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Driver License Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IdCard className='size-5' />
                Driver License Information
              </CardTitle>
              <CardDescription>Your driver license details</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-muted-foreground'>License Number</Label>
                  <Input value={profile.driverLicenseNumber || 'Not set'} disabled className='bg-muted font-mono' />
                </div>
                <div className='space-y-2'>
                  <Label className='text-muted-foreground flex items-center gap-2'>
                    <MapPin className='size-4' />
                    Issuing Country
                  </Label>
                  <Input value={formatCountry()} disabled className='bg-muted' />
                </div>
              </div>

              <div className='space-y-2'>
                <Label className='text-muted-foreground flex items-center gap-2'>
                  <Calendar className='size-4' />
                  License Expiry Date
                </Label>
                <Input
                  value={profile.driverLicenseExpiry ? format(new Date(profile.driverLicenseExpiry), 'PPP') : 'Not set'}
                  disabled
                  className='bg-muted'
                />
              </div>
            </CardContent>
          </Card>

          {/* Submitted Documents (Secure Access) */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Camera className='size-5' />
                Submitted Documents
                <Lock className='size-4 text-muted-foreground' />
              </CardTitle>
              <CardDescription>Documents submitted for verification (secured access)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDocuments ? (
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className='aspect-video rounded-lg' />
                  ))}
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  {/* License Front */}
                  <div className='space-y-2'>
                    <Label className='text-muted-foreground flex items-center gap-2'>
                      <IdCard className='size-4' />
                      License Front
                    </Label>
                    {documentUrls?.licenseFrontUrl ? (
                      <div
                        className='relative aspect-video rounded-lg overflow-hidden border bg-muted cursor-pointer hover:opacity-90 transition-opacity group'
                        onClick={() => handleImageClick(documentUrls.licenseFrontUrl)}
                      >
                        <img
                          src={documentUrls.licenseFrontUrl}
                          alt='License Front'
                          className='w-full h-full object-cover'
                        />
                        <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <Eye className='size-6 text-white' />
                        </div>
                      </div>
                    ) : (
                      <div className='aspect-video rounded-lg border bg-muted flex items-center justify-center text-muted-foreground text-sm'>
                        Not available
                      </div>
                    )}
                  </div>

                  {/* License Back */}
                  <div className='space-y-2'>
                    <Label className='text-muted-foreground flex items-center gap-2'>
                      <IdCard className='size-4' />
                      License Back
                    </Label>
                    {documentUrls?.licenseBackUrl ? (
                      <div
                        className='relative aspect-video rounded-lg overflow-hidden border bg-muted cursor-pointer hover:opacity-90 transition-opacity group'
                        onClick={() => handleImageClick(documentUrls.licenseBackUrl)}
                      >
                        <img
                          src={documentUrls.licenseBackUrl}
                          alt='License Back'
                          className='w-full h-full object-cover'
                        />
                        <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <Eye className='size-6 text-white' />
                        </div>
                      </div>
                    ) : (
                      <div className='aspect-video rounded-lg border bg-muted flex items-center justify-center text-muted-foreground text-sm'>
                        Not available
                      </div>
                    )}
                  </div>

                  {/* Selfie */}
                  <div className='space-y-2'>
                    <Label className='text-muted-foreground flex items-center gap-2'>
                      <User className='size-4' />
                      Selfie
                    </Label>
                    {documentUrls?.selfieUrl ? (
                      <div
                        className='relative aspect-video rounded-lg overflow-hidden border bg-muted cursor-pointer hover:opacity-90 transition-opacity group'
                        onClick={() => handleImageClick(documentUrls.selfieUrl)}
                      >
                        <img src={documentUrls.selfieUrl} alt='Selfie' className='w-full h-full object-cover' />
                        <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <Eye className='size-6 text-white' />
                        </div>
                      </div>
                    ) : (
                      <div className='aspect-video rounded-lg border bg-muted flex items-center justify-center text-muted-foreground text-sm'>
                        Not available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Info Footer */}
      <Alert>
        <Info className='size-4' />
        <AlertDescription>
          Your verified information is read-only and cannot be edited. If you need to update your information, please
          contact support or submit a new verification request.
        </AlertDescription>
      </Alert>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className='relative aspect-video'>
              <img src={previewImage} alt='Document' className='w-full h-full object-contain' />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resubmit Documents Dialog */}
      <Dialog open={showResubmitDialog} onOpenChange={setShowResubmitDialog}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <RefreshCw className='size-5' />
              Update Verification Documents
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <p className='text-sm text-muted-foreground'>
              Please upload new photos of your driver license and a selfie. Your phone number is already verified.
            </p>

            {/* License Front */}
            <div className='space-y-2'>
              <Label>Driver License (Front) *</Label>
              <input
                type='file'
                ref={licenseFrontRef}
                onChange={(e) => handleFileChange('licenseFront', e)}
                accept='image/*'
                className='hidden'
              />
              {resubmitImages.licenseFront ? (
                <div className='relative aspect-video rounded-lg overflow-hidden border bg-muted'>
                  <img src={resubmitImages.licenseFront} alt='License Front' className='w-full h-full object-cover' />
                  <Button
                    variant='outline'
                    size='sm'
                    className='absolute top-2 right-2'
                    onClick={() => licenseFrontRef.current?.click()}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div
                  className='aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors'
                  onClick={() => licenseFrontRef.current?.click()}
                >
                  <Camera className='size-8 text-muted-foreground mb-2' />
                  <span className='text-sm text-muted-foreground'>Click to upload</span>
                </div>
              )}
            </div>

            {/* License Back */}
            <div className='space-y-2'>
              <Label>Driver License (Back) *</Label>
              <input
                type='file'
                ref={licenseBackRef}
                onChange={(e) => handleFileChange('licenseBack', e)}
                accept='image/*'
                className='hidden'
              />
              {resubmitImages.licenseBack ? (
                <div className='relative aspect-video rounded-lg overflow-hidden border bg-muted'>
                  <img src={resubmitImages.licenseBack} alt='License Back' className='w-full h-full object-cover' />
                  <Button
                    variant='outline'
                    size='sm'
                    className='absolute top-2 right-2'
                    onClick={() => licenseBackRef.current?.click()}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div
                  className='aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors'
                  onClick={() => licenseBackRef.current?.click()}
                >
                  <Camera className='size-8 text-muted-foreground mb-2' />
                  <span className='text-sm text-muted-foreground'>Click to upload</span>
                </div>
              )}
            </div>

            {/* Selfie */}
            <div className='space-y-2'>
              <Label>Selfie *</Label>
              <input
                type='file'
                ref={selfieRef}
                onChange={(e) => handleFileChange('selfie', e)}
                accept='image/*'
                className='hidden'
              />
              {resubmitImages.selfie ? (
                <div className='relative aspect-video rounded-lg overflow-hidden border bg-muted'>
                  <img src={resubmitImages.selfie} alt='Selfie' className='w-full h-full object-cover' />
                  <Button
                    variant='outline'
                    size='sm'
                    className='absolute top-2 right-2'
                    onClick={() => selfieRef.current?.click()}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div
                  className='aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors'
                  onClick={() => selfieRef.current?.click()}
                >
                  <Camera className='size-8 text-muted-foreground mb-2' />
                  <span className='text-sm text-muted-foreground'>Click to upload</span>
                </div>
              )}
            </div>
          </div>

          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => setShowResubmitDialog(false)} className='flex-1'>
              Cancel
            </Button>
            <Button
              onClick={handleResubmit}
              disabled={
                !resubmitImages.licenseFront ||
                !resubmitImages.licenseBack ||
                !resubmitImages.selfie ||
                resubmitMutation.isPending
              }
              className='flex-1'
            >
              {resubmitMutation.isPending ? (
                <>
                  <Loader2 className='size-4 mr-2 animate-spin' />
                  Submitting...
                </>
              ) : (
                'Submit Documents'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-40' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid sm:grid-cols-2 gap-4'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-10 w-full' />
        </CardContent>
      </Card>
    </div>
  );
}
