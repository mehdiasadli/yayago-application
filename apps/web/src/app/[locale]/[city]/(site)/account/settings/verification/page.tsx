'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  CheckCircle2,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
} from 'lucide-react';
import { useVerification } from '@/contexts/verification-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
    staleTime: 4 * 60 * 1000,
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
      <Alert variant='destructive' className='rounded-2xl'>
        <AlertTriangle className='size-4' />
        <AlertDescription>Failed to load profile</AlertDescription>
      </Alert>
    );
  }

  const verificationStatus = profile.driverLicenseVerificationStatus;

  const getStatusConfig = () => {
    switch (verificationStatus) {
      case 'APPROVED':
        return {
          badge: (
            <Badge className='gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0'>
              <CheckCircle className='size-3' />
              Verified
            </Badge>
          ),
          icon: FileCheck,
          iconColor: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10 border-emerald-500/20',
          textColor: 'text-emerald-700 dark:text-emerald-400',
          title: 'Your identity is verified',
          description: 'You can now book vehicles on YayaGO.',
        };
      case 'PENDING':
        return {
          badge: (
            <Badge className='gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0'>
              <Clock className='size-3' />
              Pending Review
            </Badge>
          ),
          icon: Clock,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-500/10 border-blue-500/20',
          textColor: 'text-blue-700 dark:text-blue-400',
          title: 'Your documents are under review',
          description: "This usually takes 1-2 business days. We'll notify you once it's verified.",
        };
      case 'REJECTED':
        return {
          badge: (
            <Badge className='gap-1.5 bg-destructive/10 text-destructive border-0'>
              <XCircle className='size-3' />
              Rejected
            </Badge>
          ),
          icon: XCircle,
          iconColor: 'text-destructive',
          bgColor: 'bg-destructive/10 border-destructive/20',
          textColor: 'text-destructive',
          title: 'Verification Failed',
          description: 'Your verification was rejected. Please submit new documents.',
        };
      case 'EXPIRED':
        return {
          badge: (
            <Badge className='gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0'>
              <AlertTriangle className='size-3' />
              Expired
            </Badge>
          ),
          icon: AlertTriangle,
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-500/10 border-amber-500/20',
          textColor: 'text-amber-700 dark:text-amber-400',
          title: 'Driver License Expired',
          description: 'Your driver license has expired. Please upload new documents to continue.',
        };
      default:
        return {
          badge: (
            <Badge variant='outline' className='gap-1.5'>
              <Info className='size-3' />
              Not Submitted
            </Badge>
          ),
          icon: Info,
          iconColor: 'text-muted-foreground',
          bgColor: 'bg-muted/50 border-muted',
          textColor: 'text-foreground',
          title: 'Verification Required',
          description: 'A verified identity is required to rent vehicles on YayaGO.',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const hasSubmittedDocuments = profile.driverLicenseVerificationStatus !== 'NOT_SUBMITTED';
  const canResubmit = ['EXPIRED', 'REJECTED'].includes(verificationStatus);
  const StatusIcon = statusConfig.icon;

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
      refetchDocuments();
    }
  };

  // Info item component
  const InfoItem = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: string;
    icon?: React.ElementType;
  }) => (
    <div className='space-y-1.5'>
      <p className='text-xs text-muted-foreground flex items-center gap-1.5'>
        {Icon && <Icon className='size-3.5' />}
        {label}
      </p>
      <p className='font-medium'>{value}</p>
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10'>
          <ShieldCheck className='size-6 text-primary' />
        </div>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Identity Verification</h2>
          <p className='text-muted-foreground'>Your verified identity information</p>
        </div>
      </div>

      {/* Current Status */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                <ShieldCheck className='size-4 text-muted-foreground' />
              </div>
              <CardTitle className='text-base'>Verification Status</CardTitle>
            </div>
            {statusConfig.badge}
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn('flex items-center gap-4 rounded-xl border p-4', statusConfig.bgColor)}>
            <div className={cn('flex size-12 items-center justify-center rounded-xl bg-background/80')}>
              <StatusIcon className={cn('size-6', statusConfig.iconColor)} />
            </div>
            <div className='flex-1'>
              <p className={cn('font-medium', statusConfig.textColor)}>{statusConfig.title}</p>
              <p className='text-sm text-muted-foreground'>{statusConfig.description}</p>
            </div>
          </div>

          {(canResubmit || verificationStatus === 'NOT_SUBMITTED') && (
            <Button
              onClick={canResubmit ? () => setShowResubmitDialog(true) : openModal}
              className='w-full mt-4 h-11'
            >
              {canResubmit ? (
                <>
                  <RefreshCw className='size-4 mr-2' />
                  {verificationStatus === 'EXPIRED' ? 'Update Documents' : 'Submit New Documents'}
                </>
              ) : (
                <>
                  <ShieldCheck className='size-4 mr-2' />
                  Start Verification
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Verified Information */}
      {hasSubmittedDocuments && (
        <>
          {/* Personal Information */}
          <Card className='rounded-2xl'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                  <User className='size-4 text-muted-foreground' />
                </div>
                <div>
                  <CardTitle className='text-base'>Personal Information</CardTitle>
                  <CardDescription className='text-sm'>
                    Information verified from your documents
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='rounded-xl bg-muted/50 p-4'>
                  <InfoItem label='Legal First Name' value={profile.firstName || 'Not set'} />
                </div>
                <div className='rounded-xl bg-muted/50 p-4'>
                  <InfoItem label='Legal Last Name' value={profile.lastName || 'Not set'} />
                </div>
                <div className='rounded-xl bg-muted/50 p-4'>
                  <InfoItem
                    label='Date of Birth'
                    value={profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'PPP') : 'Not set'}
                    icon={Calendar}
                  />
                </div>
                <div className='rounded-xl bg-muted/50 p-4'>
                  <InfoItem
                    label='Gender'
                    value={
                      profile.gender
                        ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).replace(/_/g, ' ')
                        : 'Not set'
                    }
                  />
                </div>
                {profile.phoneNumber && (
                  <div className='rounded-xl bg-muted/50 p-4 sm:col-span-2'>
                    <div className='flex items-center justify-between'>
                      <InfoItem label='Phone Number' value={profile.phoneNumber} icon={Phone} />
                      {profile.phoneNumberVerified && (
                        <Badge className='gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0'>
                          <CheckCircle2 className='size-3' />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Driver License Information */}
          <Card className='rounded-2xl'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                  <IdCard className='size-4 text-muted-foreground' />
                </div>
                <div>
                  <CardTitle className='text-base'>Driver License</CardTitle>
                  <CardDescription className='text-sm'>Your driver license details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='rounded-xl bg-muted/50 p-4'>
                  <InfoItem label='License Number' value={profile.driverLicenseNumber || 'Not set'} />
                </div>
                <div className='rounded-xl bg-muted/50 p-4'>
                  <InfoItem label='Issuing Country' value={formatCountry()} icon={MapPin} />
                </div>
                <div className='rounded-xl bg-muted/50 p-4 sm:col-span-2'>
                  <InfoItem
                    label='Expiry Date'
                    value={
                      profile.driverLicenseExpiry
                        ? format(new Date(profile.driverLicenseExpiry), 'PPP')
                        : 'Not set'
                    }
                    icon={Calendar}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submitted Documents */}
          <Card className='rounded-2xl'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-muted'>
                  <Camera className='size-4 text-muted-foreground' />
                </div>
                <div className='flex-1'>
                  <CardTitle className='text-base flex items-center gap-2'>
                    Submitted Documents
                    <Lock className='size-3.5 text-muted-foreground' />
                  </CardTitle>
                  <CardDescription className='text-sm'>Secured document access</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingDocuments ? (
                <div className='grid gap-4 sm:grid-cols-3'>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className='rounded-xl border overflow-hidden'>
                      <Skeleton className='aspect-[4/3]' />
                      <div className='p-3 border-t bg-muted/30'>
                        <div className='flex items-center gap-2'>
                          <Skeleton className='size-7 rounded-lg' />
                          <div className='flex-1 space-y-1'>
                            <Skeleton className='h-4 w-24' />
                            <Skeleton className='h-3 w-20' />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='grid gap-4 sm:grid-cols-3'>
                  {/* License Front */}
                  <DocumentPreview
                    label='License Front'
                    icon={IdCard}
                    url={documentUrls?.licenseFrontUrl}
                    onClick={() => handleImageClick(documentUrls?.licenseFrontUrl)}
                  />
                  {/* License Back */}
                  <DocumentPreview
                    label='License Back'
                    icon={IdCard}
                    url={documentUrls?.licenseBackUrl}
                    onClick={() => handleImageClick(documentUrls?.licenseBackUrl)}
                  />
                  {/* Selfie */}
                  <DocumentPreview
                    label='Selfie'
                    icon={User}
                    url={documentUrls?.selfieUrl}
                    onClick={() => handleImageClick(documentUrls?.selfieUrl)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Info Footer */}
      <div className='rounded-2xl border bg-muted/30 p-4'>
        <div className='flex items-start gap-3'>
          <Info className='size-5 text-muted-foreground shrink-0 mt-0.5' />
          <p className='text-sm text-muted-foreground'>
            Your verified information is read-only and cannot be edited. If you need to update your
            information, please contact support or submit a new verification request.
          </p>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <ImagePreviewDialog 
        image={previewImage} 
        onClose={() => setPreviewImage(null)} 
      />

      {/* Resubmit Documents Dialog */}
      <Dialog open={showResubmitDialog} onOpenChange={setShowResubmitDialog}>
        <DialogContent className='max-w-lg rounded-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <RefreshCw className='size-5' />
              Update Verification Documents
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <p className='text-sm text-muted-foreground'>
              Please upload new photos of your driver license and a selfie.
            </p>

            <div className='grid gap-4'>
              <DocumentUpload
                label='Driver License (Front)'
                image={resubmitImages.licenseFront}
                inputRef={licenseFrontRef}
                onChange={(e) => handleFileChange('licenseFront', e)}
              />
              <DocumentUpload
                label='Driver License (Back)'
                image={resubmitImages.licenseBack}
                inputRef={licenseBackRef}
                onChange={(e) => handleFileChange('licenseBack', e)}
              />
              <DocumentUpload
                label='Selfie'
                image={resubmitImages.selfie}
                inputRef={selfieRef}
                onChange={(e) => handleFileChange('selfie', e)}
              />
            </div>
          </div>

          <div className='flex gap-3 pt-2'>
            <Button variant='outline' onClick={() => setShowResubmitDialog(false)} className='flex-1 h-11'>
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
              className='flex-1 h-11'
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

// Document Preview Component
function DocumentPreview({
  label,
  icon: Icon,
  url,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  url?: string | null;
  onClick: () => void;
}) {
  return (
    <div className='group/card rounded-xl border bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/30'>
      {url ? (
        <button
          type='button'
          onClick={onClick}
          className='relative w-full aspect-[4/3] overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
        >
          <img src={url} alt={label} className='w-full h-full object-cover transition-transform group-hover/card:scale-105' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
          <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity'>
            <div className='flex flex-col items-center gap-1'>
              <div className='flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'>
                <Eye className='size-5 text-white' />
              </div>
              <span className='text-xs text-white font-medium'>View</span>
            </div>
          </div>
        </button>
      ) : (
        <div className='aspect-[4/3] bg-muted flex flex-col items-center justify-center text-muted-foreground'>
          <Icon className='size-8 mb-2 opacity-30' />
          <span className='text-sm'>Not available</span>
        </div>
      )}
      <div className='p-3 border-t bg-muted/30'>
        <div className='flex items-center gap-2'>
          <div className='flex size-7 items-center justify-center rounded-lg bg-muted'>
            <Icon className='size-3.5 text-muted-foreground' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium truncate'>{label}</p>
            <p className='text-xs text-muted-foreground'>
              {url ? 'Click to preview' : 'No document'}
            </p>
          </div>
          {url && (
            <CheckCircle2 className='size-4 text-emerald-500 shrink-0' />
          )}
        </div>
      </div>
    </div>
  );
}

// Document Upload Component
function DocumentUpload({
  label,
  image,
  inputRef,
  onChange,
}: {
  label: string;
  image: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className='space-y-2'>
      <p className='text-sm font-medium'>
        {label} <span className='text-destructive'>*</span>
      </p>
      <input type='file' ref={inputRef} onChange={onChange} accept='image/*' className='hidden' />
      {image ? (
        <div className='relative aspect-video rounded-xl overflow-hidden border bg-muted'>
          <img src={image} alt={label} className='w-full h-full object-cover' />
          <Button
            variant='secondary'
            size='sm'
            className='absolute top-2 right-2'
            onClick={() => inputRef.current?.click()}
          >
            Change
          </Button>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          className='w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center hover:bg-muted/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        >
          <Upload className='size-8 text-muted-foreground mb-2' />
          <span className='text-sm text-muted-foreground'>Click to upload</span>
        </button>
      )}
    </div>
  );
}

function VerificationSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Skeleton className='size-12 rounded-2xl' />
        <div className='space-y-2'>
          <Skeleton className='h-7 w-44' />
          <Skeleton className='h-4 w-56' />
        </div>
      </div>

      {/* Status card skeleton */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Skeleton className='size-9 rounded-xl' />
              <Skeleton className='h-4 w-36' />
            </div>
            <Skeleton className='h-6 w-24 rounded-full' />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-20 w-full rounded-xl' />
        </CardContent>
      </Card>

      {/* Personal info skeleton */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-9 rounded-xl' />
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-3 w-52' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 sm:grid-cols-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-20 w-full rounded-xl' />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* License skeleton */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-9 rounded-xl' />
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-44' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 sm:grid-cols-2'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className={cn('h-20 rounded-xl', i === 2 && 'sm:col-span-2')} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents skeleton */}
      <Card className='rounded-2xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-9 rounded-xl' />
            <div className='space-y-1.5'>
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-3 w-36' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 sm:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='rounded-xl border overflow-hidden'>
                <Skeleton className='aspect-[4/3]' />
                <div className='p-3 border-t bg-muted/30'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='size-7 rounded-lg' />
                    <div className='flex-1 space-y-1'>
                      <Skeleton className='h-4 w-24' />
                      <Skeleton className='h-3 w-20' />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Image Preview Dialog with Zoom and Pan
function ImagePreviewDialog({
  image,
  onClose,
}: {
  image: string | null;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.25, 0.5);
    setZoom(newZoom);
    // Reset position if zooming out to 1 or below
    if (newZoom <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  };
  
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleClose = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    onClose();
  };

  // Mouse/Touch handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev + 0.1, 3));
    } else {
      const newZoom = Math.max(zoom - 0.1, 0.5);
      setZoom(newZoom);
      if (newZoom <= 1) {
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  const canPan = zoom > 1;

  return (
    <Dialog open={!!image} onOpenChange={() => handleClose()}>
      <DialogContent className='max-w-5xl p-0 gap-0 overflow-hidden rounded-2xl border-0 bg-zinc-950 [&>button]:hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-white/10'>
          <div className='flex items-center gap-3'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-white/10'>
              <Eye className='size-4 text-white' />
            </div>
            <div>
              <DialogTitle className='text-white text-sm font-medium'>Document Preview</DialogTitle>
              <p className='text-xs text-white/60'>
                {canPan ? 'Drag to pan • Scroll to zoom' : 'Scroll or use controls to zoom'}
              </p>
            </div>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleClose}
            className='size-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10'
          >
            <X className='size-5' />
          </Button>
        </div>

        {/* Image Container */}
        {image && (
          <div
            ref={containerRef}
            className={cn(
              'relative flex items-center justify-center p-6 min-h-[50vh] max-h-[70vh] overflow-hidden bg-zinc-900/50',
              canPan ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
          >
            <div
              className={cn(
                'select-none',
                !isDragging && 'transition-transform duration-200 ease-out'
              )}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              <img
                src={image}
                alt='Document'
                className='max-w-full max-h-[60vh] object-contain rounded-lg shadow-2xl pointer-events-none'
                draggable={false}
              />
            </div>
          </div>
        )}

        {/* Controls Footer */}
        <div className='flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/5'>
          <div className='flex items-center gap-2 text-white/60'>
            <Lock className='size-3.5' />
            <span className='text-xs'>Secured document</span>
          </div>

          {/* Zoom Controls */}
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className='size-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30'
            >
              <ZoomOut className='size-4' />
            </Button>
            
            <div className='flex items-center justify-center min-w-[60px] px-2 py-1 rounded-lg bg-white/10 text-white text-xs font-medium'>
              {Math.round(zoom * 100)}%
            </div>
            
            <Button
              variant='ghost'
              size='icon'
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className='size-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30'
            >
              <ZoomIn className='size-4' />
            </Button>

            <div className='w-px h-5 bg-white/20 mx-2' />

            <Button
              variant='ghost'
              size='icon'
              onClick={handleRotate}
              className='size-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10'
            >
              <RotateCw className='size-4' />
            </Button>

            {(zoom !== 1 || rotation !== 0 || position.x !== 0 || position.y !== 0) && (
              <>
                <div className='w-px h-5 bg-white/20 mx-2' />
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleReset}
                  className='h-8 px-3 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-xs'
                >
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
