'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Camera,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Phone,
  IdCard,
  UserCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { orpc } from '@/utils/orpc';

interface VerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

type Step = 'license-front' | 'license-back' | 'selfie' | 'phone';

const ALL_STEPS: Step[] = ['license-front', 'license-back', 'selfie', 'phone'];

const STEP_INFO: Record<Step, { title: string; description: string; icon: React.ReactNode }> = {
  'license-front': {
    title: 'Driver License (Front)',
    description: 'Take a clear photo of the front of your driver license',
    icon: <IdCard className='size-6' />,
  },
  'license-back': {
    title: 'Driver License (Back)',
    description: 'Take a clear photo of the back of your driver license',
    icon: <IdCard className='size-6' />,
  },
  selfie: {
    title: 'Selfie',
    description: 'Take a clear selfie photo of yourself',
    icon: <UserCircle className='size-6' />,
  },
  phone: {
    title: 'Phone Verification',
    description: 'Enter your phone number and verify with OTP',
    icon: <Phone className='size-6' />,
  },
};

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function VerificationModal({ open, onOpenChange, onComplete }: VerificationModalProps) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<Step>('license-front');
  const [images, setImages] = useState<Record<string, string>>({});
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile to check if phone is already verified
  const { data: profile } = useQuery({
    ...orpc.users.getMyProfile.queryOptions(),
    enabled: open, // Only fetch when modal is open
  });

  // Check if phone is already verified from profile
  const isPhoneAlreadyVerified = !!profile?.phoneNumberVerified && !!profile?.phoneNumber;
  const verifiedPhoneNumber = profile?.phoneNumber || '';

  // Determine active steps based on phone verification status
  const activeSteps = useMemo(() => {
    if (isPhoneAlreadyVerified) {
      // Skip phone step if already verified
      return ALL_STEPS.filter((step) => step !== 'phone');
    }
    return ALL_STEPS;
  }, [isPhoneAlreadyVerified]);

  // Initialize phone verification state based on profile
  useEffect(() => {
    if (isPhoneAlreadyVerified) {
      setIsPhoneVerified(true);
      setPhoneNumber(verifiedPhoneNumber);
    }
  }, [isPhoneAlreadyVerified, verifiedPhoneNumber]);

  const currentStepIndex = activeSteps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / activeSteps.length) * 100;

  // Request OTP mutation
  const requestOtpMutation = useMutation(
    orpc.users.requestVerificationOtp.mutationOptions({
      onSuccess: () => {
        setIsOtpSent(true);
        toast.success('OTP sent to your phone');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to send OTP');
      },
    })
  );

  // Verify OTP mutation
  const verifyOtpMutation = useMutation(
    orpc.users.verifyOtp.mutationOptions({
      onSuccess: () => {
        setIsPhoneVerified(true);
        toast.success('Phone number verified');
      },
      onError: (error) => {
        toast.error(error.message || 'Invalid OTP');
      },
    })
  );

  // Submit verification mutation
  const submitVerificationMutation = useMutation(
    orpc.users.submitVerification.mutationOptions({
      onSuccess: () => {
        toast.success('Verification submitted! We will review your documents shortly.');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        onOpenChange(false);
        onComplete?.();
        resetState();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to submit verification');
      },
    })
  );

  const resetState = useCallback(() => {
    setCurrentStep('license-front');
    setImages({});
    setOtp('');
    setIsOtpSent(false);
    // Don't reset phone verification state if already verified from profile
    if (!isPhoneAlreadyVerified) {
      setPhoneNumber('');
      setIsPhoneVerified(false);
    }
  }, [isPhoneAlreadyVerified]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setImages((prev) => ({ ...prev, [currentStep]: base64 }));
    } catch {
      toast.error('Failed to read file');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRequestOtp = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    requestOtpMutation.mutate({ phoneNumber });
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }
    verifyOtpMutation.mutate({ phoneNumber, otp });
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < activeSteps.length) {
      setCurrentStep(activeSteps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(activeSteps[prevIndex]);
    }
  };

  const handleSubmit = () => {
    if (!images['license-front'] || !images['license-back'] || !images['selfie']) {
      toast.error('Please upload all required photos');
      return;
    }

    // Use verified phone number (either from profile or newly verified)
    const phoneToSubmit = isPhoneAlreadyVerified ? verifiedPhoneNumber : phoneNumber;

    if (!isPhoneVerified || !phoneToSubmit) {
      toast.error('Phone verification is required');
      return;
    }

    submitVerificationMutation.mutate({
      licenseFrontImage: images['license-front'],
      licenseBackImage: images['license-back'],
      selfieImage: images['selfie'],
      phoneNumber: phoneToSubmit,
    });
  };

  const canProceed = () => {
    if (currentStep === 'license-front') return !!images['license-front'];
    if (currentStep === 'license-back') return !!images['license-back'];
    if (currentStep === 'selfie') return !!images['selfie'];
    if (currentStep === 'phone') return isPhoneVerified;
    return false;
  };

  const isLastStep = currentStepIndex === activeSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const isLoading =
    requestOtpMutation.isPending || verifyOtpMutation.isPending || submitVerificationMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {STEP_INFO[currentStep].icon}
            {STEP_INFO[currentStep].title}
          </DialogTitle>
          <DialogDescription>{STEP_INFO[currentStep].description}</DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm text-muted-foreground'>
            <span>
              Step {currentStepIndex + 1} of {activeSteps.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>

        {/* Step Content */}
        <div className='py-4'>
          {currentStep !== 'phone' ? (
            <PhotoCapture
              stepKey={currentStep}
              image={images[currentStep]}
              onImageChange={(base64) => setImages((prev) => ({ ...prev, [currentStep]: base64 }))}
              onFileSelect={() => fileInputRef.current?.click()}
            />
          ) : (
            <PhoneVerification
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              otp={otp}
              setOtp={setOtp}
              isOtpSent={isOtpSent}
              isPhoneVerified={isPhoneVerified}
              onRequestOtp={handleRequestOtp}
              onVerifyOtp={handleVerifyOtp}
              isLoading={requestOtpMutation.isPending || verifyOtpMutation.isPending}
            />
          )}
        </div>

        {/* Hidden file input */}
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          accept='image/*'
          capture='environment'
          className='hidden'
        />

        {/* Navigation */}
        <div className='flex justify-between pt-4 border-t'>
          <Button variant='outline' onClick={handleBack} disabled={isFirstStep || isLoading}>
            <ChevronLeft className='size-4 mr-2' />
            Back
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isLoading}
              className='bg-green-600 hover:bg-green-700'
            >
              {submitVerificationMutation.isPending ? (
                <Loader2 className='size-4 mr-2 animate-spin' />
              ) : (
                <Check className='size-4 mr-2' />
              )}
              Submit Verification
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed() || isLoading}>
              Next
              <ChevronRight className='size-4 ml-2' />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Photo Capture Sub-component
interface PhotoCaptureProps {
  stepKey: string;
  image: string | undefined;
  onImageChange: (base64: string) => void;
  onFileSelect: () => void;
}

function PhotoCapture({ stepKey, image, onImageChange, onFileSelect }: PhotoCaptureProps) {
  if (image) {
    return (
      <div className='space-y-4'>
        <div className='relative aspect-[4/3] rounded-lg overflow-hidden border bg-muted'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt='Captured' className='w-full h-full object-cover' />
          <Button
            variant='destructive'
            size='icon'
            className='absolute top-2 right-2'
            onClick={() => onImageChange('')}
          >
            <X className='size-4' />
          </Button>
        </div>
        <div className='flex justify-center'>
          <Button variant='outline' onClick={onFileSelect}>
            <RefreshCw className='size-4 mr-2' />
            Retake Photo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'aspect-[4/3] rounded-lg border-2 border-dashed',
        'flex flex-col items-center justify-center gap-4',
        'bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer'
      )}
      onClick={onFileSelect}
    >
      <div className='p-4 rounded-full bg-primary/10'>
        <Camera className='size-8 text-primary' />
      </div>
      <div className='text-center'>
        <p className='font-medium'>Take a photo</p>
        <p className='text-sm text-muted-foreground'>or click to upload from device</p>
      </div>
      <div className='flex gap-2'>
        <Button
          variant='default'
          size='sm'
          onClick={(e) => {
            e.stopPropagation();
            onFileSelect();
          }}
        >
          <Camera className='size-4 mr-2' />
          Camera
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={(e) => {
            e.stopPropagation();
            onFileSelect();
          }}
        >
          <Upload className='size-4 mr-2' />
          Upload
        </Button>
      </div>
    </div>
  );
}

// Phone Verification Sub-component
interface PhoneVerificationProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  otp: string;
  setOtp: (value: string) => void;
  isOtpSent: boolean;
  isPhoneVerified: boolean;
  onRequestOtp: () => void;
  onVerifyOtp: () => void;
  isLoading: boolean;
}

function PhoneVerification({
  phoneNumber,
  setPhoneNumber,
  otp,
  setOtp,
  isOtpSent,
  isPhoneVerified,
  onRequestOtp,
  onVerifyOtp,
  isLoading,
}: PhoneVerificationProps) {
  if (isPhoneVerified) {
    return (
      <div className='flex flex-col items-center justify-center py-8 text-center'>
        <div className='p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-4'>
          <Check className='size-8 text-green-600 dark:text-green-400' />
        </div>
        <h3 className='text-lg font-semibold'>Phone Verified!</h3>
        <p className='text-sm text-muted-foreground mt-1'>Your phone number has been verified successfully.</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='phone'>Phone Number</Label>
        <div className='flex gap-2'>
          <Input
            id='phone'
            type='tel'
            placeholder='+971 50 123 4567'
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isOtpSent || isLoading}
            className='flex-1'
          />
          {!isOtpSent && (
            <Button onClick={onRequestOtp} disabled={!phoneNumber || isLoading}>
              {isLoading ? <Loader2 className='size-4 animate-spin' /> : 'Send OTP'}
            </Button>
          )}
        </div>
      </div>

      {isOtpSent && (
        <div className='space-y-2'>
          <Label htmlFor='otp'>Enter OTP</Label>
          <div className='flex gap-2'>
            <Input
              id='otp'
              type='text'
              placeholder='Enter 6-digit code'
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isLoading}
              className='flex-1 text-center tracking-widest font-mono text-lg'
              maxLength={6}
            />
            <Button onClick={onVerifyOtp} disabled={otp.length !== 6 || isLoading}>
              {isLoading ? <Loader2 className='size-4 animate-spin' /> : 'Verify'}
            </Button>
          </div>
          <p className='text-xs text-muted-foreground'>
            Didn&apos;t receive the code?{' '}
            <Button variant='link' className='p-0 h-auto text-xs' onClick={onRequestOtp} disabled={isLoading}>
              Resend OTP
            </Button>
          </p>
        </div>
      )}
    </div>
  );
}

export default VerificationModal;
