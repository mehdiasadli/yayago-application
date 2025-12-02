'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  Car,
  DollarSign,
  CalendarCheck,
  ImageIcon,
  Check,
  Loader2,
  AlertCircle,
  Upload,
  Fingerprint,
} from 'lucide-react';
import { CreateListingInputSchema } from '@yayago-app/validators';
import type { z } from 'zod';

// Use input type for form since we provide defaults
type FormValues = z.input<typeof CreateListingInputSchema>;
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import VinStep, { type VinDecodedData } from './steps/vin-step';
import VehicleStep from './steps/vehicle-step';
import PricingStep from './steps/pricing-step';
import BookingStep from './steps/booking-step';
import MediaStep from './steps/media-step';
import ReviewStep from './steps/review-step';

const STEPS = [
  {
    id: 1,
    title: 'VIN',
    icon: <Fingerprint className='size-4' />,
    description: 'Enter your vehicle identification number',
  },
  {
    id: 2,
    title: 'Vehicle',
    icon: <Car className='size-4' />,
    description: 'Verify vehicle details and specifications',
  },
  { id: 3, title: 'Pricing', icon: <DollarSign className='size-4' />, description: 'Set competitive rental rates' },
  { id: 4, title: 'Booking', icon: <CalendarCheck className='size-4' />, description: 'Configure booking rules' },
  { id: 5, title: 'Media', icon: <ImageIcon className='size-4' />, description: 'Upload photos of your vehicle' },
  { id: 6, title: 'Review', icon: <Check className='size-4' />, description: 'Review and submit your listing' },
];

export interface MediaItem {
  file: File;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  isPrimary: boolean;
  uploadProgress?: number;
  uploaded?: boolean;
  cloudinaryUrl?: string;
  width?: number;
  height?: number;
}

export default function CreateListingForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // Guard against double submission
  const [vinData, setVinData] = useState<VinDecodedData | null>(null);
  const [vinConfirmed, setVinConfirmed] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(CreateListingInputSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      vehicle: {
        modelId: '',
        year: new Date().getFullYear(),
        class: 'STANDARD',
        bodyType: 'SEDAN',
        fuelType: 'GASOLINE',
        transmissionType: 'AUTOMATIC',
        driveType: 'FWD',
        engineLayout: 'INLINE',
        doors: 4,
        seats: 5,
        interiorColors: [],
        exteriorColors: [],
        featureIds: [],
        vin: '',
        trim: '',
        style: '',
        manufacturer: '',
      },
      pricing: {
        currency: 'AED',
        pricePerDay: 0,
        securityDepositRequired: true,
        cancellationPolicy: 'STRICT',
      },
      bookingDetails: {
        hasInstantBooking: false,
        minAge: 21,
        maxAge: 120,
        minRentalDays: 1,
        mileageUnit: 'KM',
      },
    },
    mode: 'onChange',
  });

  // Create listing mutation
  const { mutateAsync: createListing, isPending: isCreating } = useMutation(
    orpc.listings.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message || 'Failed to create listing');
      },
    })
  );

  // Add media mutation
  const { mutateAsync: addMedia } = useMutation(orpc.listings.addMedia.mutationOptions());

  // Upload media to Cloudinary and save to listing
  const uploadMediaToListing = async (listingSlug: string) => {
    const itemsToUpload = mediaItems.filter((item) => !item.uploaded);
    if (itemsToUpload.length === 0) return;

    setIsUploading(true);
    let uploaded = 0;

    try {
      for (const item of itemsToUpload) {
        // Convert file to base64
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(item.file);
        });

        // Get image dimensions
        let width = 1920;
        let height = 1080;
        if (item.type === 'IMAGE') {
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => {
              width = img.width;
              height = img.height;
              resolve();
            };
            img.src = item.url;
          });
        }

        // Upload to Cloudinary via server
        await addMedia({
          slug: listingSlug,
          media: {
            type: item.type,
            url: dataUrl, // Server will upload this
            width,
            height,
            size: item.file.size,
            mimeType: item.file.type,
            isPrimary: item.isPrimary,
          },
        });

        uploaded++;
        setUploadProgress(Math.round((uploaded / itemsToUpload.length) * 100));

        // Update local state
        setMediaItems((prev) =>
          prev.map((m) => (m.file === item.file ? { ...m, uploaded: true, uploadProgress: 100 } : m))
        );
      }

      toast.success(`${uploaded} media file(s) uploaded successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload media');
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    setStepError(null);
    let isValid = false;

    switch (currentStep) {
      case 1: {
        // Validate VIN step - VIN must be decoded and confirmed
        if (!vinData || !vinConfirmed) {
          setStepError('Please decode your VIN and confirm the vehicle data');
          isValid = false;
        } else {
          // Check the actual form value for modelId
          const modelId = form.getValues('vehicle.modelId');
          if (!modelId || modelId === '') {
            setStepError('Please select a vehicle brand and model');
            isValid = false;
          } else {
            isValid = true;
          }
        }
        break;
      }
      case 2: {
        // First check if odometer is provided (it's required for this step)
        const odometer = form.getValues('vehicle.odometer');
        if (odometer === undefined || odometer === null) {
          setStepError('Please enter the odometer reading');
          isValid = false;
          break;
        }

        // Validate title and vehicle specs (modelId already validated in step 1)
        isValid = await form.trigger([
          'title',
          'vehicle.year',
          'vehicle.class',
          'vehicle.bodyType',
          'vehicle.fuelType',
          'vehicle.transmissionType',
          'vehicle.driveType',
          'vehicle.doors',
          'vehicle.seats',
        ]);
        if (!isValid) {
          const errors = form.formState.errors;
          if (errors.title) setStepError(errors.title.message || 'Please enter a listing title');
          else setStepError('Please fill in all required vehicle details');
        }
        break;
      }
      case 3: {
        isValid = await form.trigger(['pricing.pricePerDay', 'pricing.currency', 'pricing.cancellationPolicy']);
        if (!isValid) {
          const errors = form.formState.errors;
          if (errors.pricing?.pricePerDay) setStepError('Please enter a daily rental price');
          else setStepError('Please fill in all required pricing details');
        }
        // Also check if price is greater than 0
        const pricePerDay = form.getValues('pricing.pricePerDay');
        if (pricePerDay <= 0) {
          setStepError('Daily rental price must be greater than 0');
          isValid = false;
        }
        break;
      }
      case 4: {
        isValid = await form.trigger([
          'bookingDetails.minAge',
          'bookingDetails.minRentalDays',
          'bookingDetails.mileageUnit',
        ]);
        if (!isValid) {
          setStepError('Please fill in all required booking details');
        }
        break;
      }
      case 5: {
        if (mediaItems.filter((m) => m.type === 'IMAGE').length === 0) {
          setStepError('Please add at least one photo of your vehicle');
          isValid = false;
        } else {
          isValid = true;
        }
        break;
      }
      case 6: {
        isValid = true;
        break;
      }
    }

    return isValid;
  };

  const handleNext = async () => {
    try {
      const isValid = await validateCurrentStep();
      if (isValid) {
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Log validation errors for debugging
        console.log('Validation failed. Form errors:', form.formState.errors);
      }
    } catch (error) {
      console.error('Error during validation:', error);
      toast.error('An error occurred during validation');
    }
  };

  const handlePrevious = () => {
    setStepError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard against double submission
    if (isSubmittingForm) {
      return;
    }

    // Get form values
    const data = form.getValues();

    // Ensure modelId is set - use vinData as fallback (this is the fix for form.setValue not persisting)
    const finalModelId = data.vehicle.modelId || vinData?.matchedModelId || '';

    // Validate required fields manually
    if (!data.title || data.title.length < 3) {
      toast.error('Listing title is required (minimum 3 characters)');
      return;
    }
    if (!finalModelId) {
      toast.error('Vehicle brand and model are required');
      return;
    }
    if (!data.pricing.pricePerDay || data.pricing.pricePerDay <= 0) {
      toast.error('Daily rental price must be set');
      return;
    }
    if (mediaItems.filter((m) => m.type === 'IMAGE').length === 0) {
      toast.error('At least one image is required');
      return;
    }

    setIsSubmittingForm(true);

    try {
      // Build vehicle data with the correct modelId
      const vehicleData = {
        ...data.vehicle,
        modelId: finalModelId,
      };

      // Debug log
      console.log('[Create Listing] Submitting with vehicle data:', {
        formModelId: data.vehicle.modelId,
        vinDataModelId: vinData?.matchedModelId,
        finalModelId: vehicleData.modelId,
      });

      // First, create the listing (without media)
      const listing = await createListing({
        title: data.title,
        description: data.description,
        tags: data.tags,
        vehicle: vehicleData,
        pricing: data.pricing,
        bookingDetails: data.bookingDetails,
      });

      // Then upload media to the listing
      if (mediaItems.length > 0) {
        await uploadMediaToListing(listing.slug);
      }

      toast.success('Listing created successfully!');
      router.push(`/listings/${listing.slug}`);
    } catch (error: any) {
      console.error('[Create Listing] Error:', error);
      toast.error(error.message || 'Failed to create listing');
      setIsSubmittingForm(false); // Reset on error so user can retry
    }
  };

  const progress = (currentStep / STEPS.length) * 100;
  const currentStepData = STEPS[currentStep - 1];
  const isSubmitting = isCreating || isUploading || isSubmittingForm;

  return (
    <div className='max-w-5xl mx-auto space-y-6'>
      {/* Progress Header */}
      <Card className='border-0 shadow-lg bg-gradient-to-r from-primary/5 via-transparent to-primary/5'>
        <CardContent className='pt-6 pb-4'>
          {/* Step indicators */}
          <div className='flex items-center justify-between mb-6'>
            {STEPS.map((step, index) => (
              <div key={step.id} className='flex items-center flex-1'>
                <button
                  type='button'
                  onClick={() => {
                    if (currentStep > step.id) {
                      setCurrentStep(step.id);
                      setStepError(null);
                    }
                  }}
                  disabled={currentStep < step.id}
                  className={cn(
                    'flex flex-col items-center gap-2 transition-all',
                    currentStep >= step.id ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300',
                      currentStep > step.id
                        ? 'bg-primary border-primary text-primary-foreground'
                        : currentStep === step.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-muted-foreground/30 text-muted-foreground bg-muted/50'
                    )}
                  >
                    {currentStep > step.id ? <Check className='size-5' /> : step.icon}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium hidden md:block',
                      currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div className='flex-1 mx-2 md:mx-4'>
                    <div
                      className={cn(
                        'h-1 rounded-full transition-all duration-300',
                        currentStep > step.id ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overall Progress */}
          <Progress value={progress} className='h-2' />
          <p className='text-center text-sm text-muted-foreground mt-3'>
            Step {currentStep} of {STEPS.length}
          </p>
        </CardContent>
      </Card>

      {/* Step Error Alert */}
      {stepError && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{stepError}</AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Alert>
          <Upload className='h-4 w-4 animate-pulse' />
          <AlertDescription className='flex items-center gap-4'>
            <span>Uploading media files... {uploadProgress}%</span>
            <Progress value={uploadProgress} className='flex-1 h-2' />
          </AlertDescription>
        </Alert>
      )}

      {/* Form Content */}
      <Card className='border-0 shadow-lg'>
        <CardHeader className='border-b bg-muted/30'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md'>
              {currentStepData.icon}
            </div>
            <div>
              <CardTitle className='text-xl'>{currentStepData.title}</CardTitle>
              <CardDescription className='text-base'>{currentStepData.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-8'>
          <form onSubmit={handleSubmit}>
            <div className='min-h-[400px]'>
              {currentStep === 1 && (
                <VinStep
                  form={form}
                  vinData={vinData}
                  setVinData={setVinData}
                  onConfirm={() => setVinConfirmed(true)}
                />
              )}
              {currentStep === 2 && <VehicleStep form={form} vinData={vinData} />}
              {currentStep === 3 && <PricingStep form={form} />}
              {currentStep === 4 && <BookingStep form={form} />}
              {currentStep === 5 && <MediaStep mediaItems={mediaItems} setMediaItems={setMediaItems} />}
              {currentStep === 6 && <ReviewStep form={form} mediaItems={mediaItems} vinData={vinData} />}
            </div>

            {/* Navigation Buttons */}
            <div className='flex justify-between items-center mt-10 pt-6 border-t'>
              <Button
                type='button'
                variant='outline'
                size='lg'
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
                className='min-w-[140px]'
              >
                <ArrowLeft className='size-4 mr-2' />
                Previous
              </Button>

              {currentStep < STEPS.length ? (
                <Button type='button' size='lg' onClick={handleNext} disabled={isSubmitting} className='min-w-[140px]'>
                  Continue
                  <ArrowRight className='size-4 ml-2' />
                </Button>
              ) : (
                <Button type='submit' size='lg' disabled={isSubmitting} className='min-w-[180px]'>
                  {isSubmitting ? (
                    <>
                      <Loader2 className='size-4 animate-spin mr-2' />
                      {isUploading ? 'Uploading...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check className='size-4 mr-2' />
                      Create Listing
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
