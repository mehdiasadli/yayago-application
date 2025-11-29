'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { orpc } from '@/utils/orpc';
import { ArrowLeftIcon, ArrowRightIcon, Loader2Icon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getNextStep, getPreviousStep, isFirstStep, isLastStep, ONBOARDING_STEPS } from './data';
import OrgDetailsForm from './org-details-form';
import CitySelectionForm from './city-selection-form';
import ContactInfoForm from './contact-info-form';
import DocumentsForm from './documents-form';
import ReviewForm from './review-form';
import { useEffect, useMemo, useState } from 'react';
import {
  FindCitiesForOnboardingOutputType,
  GetOnboardingDataOutputType,
  CompleteOnboardingInputSchema,
} from '@yayago-app/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OnboardingFormProps {
  data: GetOnboardingDataOutputType;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onStepComplete: (step: number) => void;
}

export interface UploadedDocument {
  documentType: string;
  file: File;
  url?: string;
}

export default function OnboardingForm({ data, currentStep, setCurrentStep, onStepComplete }: OnboardingFormProps) {
  const router = useRouter();

  // Initialize selected city from saved data
  const initialCity: FindCitiesForOnboardingOutputType[number] | null = data.city
    ? {
        code: data.city.code,
        name: data.city.name,
        lat: data.city.lat,
        lng: data.city.lng,
        googleMapsPlaceId: data.city.googleMapsPlaceId,
        country: data.city.country,
      }
    : null;

  const [selectedCity, setSelectedCity] = useState<FindCitiesForOnboardingOutputType[number] | null>(initialCity);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);

  const form = useForm({
    resolver: zodResolver(
      CompleteOnboardingInputSchema.omit({ cityCode: true, lat: true, lng: true, documents: true })
    ),
    defaultValues: {
      name: data.name || '',
      email: data.email || '',
      phoneNumber: data.phoneNumber || '',
      address: data.address || '',
      description: data.description || '',
      slug: data.slug || '',
      logo: data.logo || undefined,
      legalName: data.legalName || undefined,
      taxId: data.taxId || '',
      website: data.website || '',
    },
  });

  // Watch all form values to make validation reactive
  const formValues = form.watch();

  const { mutateAsync: completeOnboarding, isPending } = useMutation(
    orpc.organizations.completeOnboarding.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to submit onboarding');
      },
      onSuccess() {
        toast.success('Onboarding submitted successfully! Redirecting...');
        router.push('/');
      },
    })
  );

  const { mutateAsync: saveProgress, isPending: isSavingProgress } = useMutation(
    orpc.organizations.saveOnboardingProgress.mutationOptions({
      onError(error) {
        // Silent fail - don't block user flow
        console.error('Failed to save progress:', error.message);
      },
    })
  );

  const onSubmit = form.handleSubmit(async (formData) => {
    if (!selectedCity) {
      toast.error('Please select a city');
      return;
    }

    // Transform uploaded documents for API
    const documentsPayload = uploadedDocuments.map((doc) => ({
      documentType: doc.documentType,
      files: [
        {
          url: doc.url || '', // TODO: Implement actual file upload
          format: getFileFormat(doc.file.name),
        },
      ],
    }));

    await completeOnboarding({
      name: formData.name,
      slug: formData.slug,
      legalName: formData.legalName || undefined,
      description: formData.description || undefined,
      logo: formData.logo || undefined,
      cityCode: selectedCity.code,
      lat: selectedCity.lat,
      lng: selectedCity.lng,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      website: formData.website || undefined,
      address: formData.address,
      taxId: formData.taxId,
      documents: documentsPayload.length > 0 ? documentsPayload : undefined,
    });
  });

  // Memoize validation to avoid unnecessary recalculations
  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 1: // Organization Details
        return !!(formValues.name && formValues.slug);
      case 2: // City Selection
        return !!selectedCity;
      case 3: // Contact Information (with address)
        return !!(formValues.email && formValues.phoneNumber && formValues.address);
      case 4: // Documents
        return !!formValues.taxId;
      default:
        return true;
    }
  }, [
    currentStep,
    formValues.name,
    formValues.slug,
    selectedCity,
    formValues.email,
    formValues.phoneNumber,
    formValues.address,
    formValues.taxId,
  ]);

  // Save progress when step changes
  const saveCurrentStepProgress = async (nextStep: number) => {
    const values = form.getValues();
    try {
      await saveProgress({
        step: nextStep,
        name: values.name || undefined,
        slug: values.slug || undefined,
        legalName: values.legalName || undefined,
        description: values.description || undefined,
        logo: values.logo || undefined,
        cityCode: selectedCity?.code || undefined,
        email: values.email || undefined,
        phoneNumber: values.phoneNumber || undefined,
        website: values.website || undefined,
        address: values.address || undefined,
        taxId: values.taxId || undefined,
      });
    } catch (e) {
      // Silent fail
      console.error('Failed to save progress', e);
    }
  };

  const handleNextStep = async () => {
    if (isCurrentStepValid) {
      onStepComplete(currentStep);
      const nextStep = getNextStep(currentStep);
      if (nextStep) {
        // Save progress before moving to next step
        await saveCurrentStepProgress(nextStep);
        setCurrentStep(nextStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePreviousStep = () => {
    const previousStep = getPreviousStep(currentStep);
    if (previousStep) {
      setCurrentStep(previousStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep - 1];

  const forms = {
    1: <OrgDetailsForm form={form} />,
    2: <CitySelectionForm setSelectedCity={setSelectedCity} selectedCity={selectedCity} />,
    3: <ContactInfoForm form={form} />,
    4: (
      <DocumentsForm
        form={form}
        selectedCity={selectedCity}
        uploadedDocuments={uploadedDocuments}
        setUploadedDocuments={setUploadedDocuments}
      />
    ),
    5: <ReviewForm form={form} data={data} selectedCity={selectedCity} uploadedDocuments={uploadedDocuments} />,
  };

  return (
    <Card className='shadow-lg border-0 bg-card/50 backdrop-blur'>
      {/* Rejection Alert */}
      {data.status === 'REJECTED' && data.rejectionReason && (
        <Alert variant='destructive' className='m-6 mb-0'>
          <AlertCircleIcon className='h-4 w-4' />
          <AlertTitle>Application Rejected</AlertTitle>
          <AlertDescription>
            Your previous application was rejected. Please review the feedback and make the necessary corrections:
            <p className='mt-2 font-medium'>{data.rejectionReason}</p>
          </AlertDescription>
        </Alert>
      )}

      <CardHeader className='border-b bg-muted/30'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground'>
              {currentStepData.icon}
            </div>
            <div>
              <CardTitle className='text-xl'>{currentStepData.title}</CardTitle>
              <CardDescription className='mt-1'>{currentStepData.description}</CardDescription>
            </div>
          </div>
          <div className='hidden md:flex items-center gap-2 text-sm text-muted-foreground'>
            Step {currentStep} of {ONBOARDING_STEPS.length}
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-6'>
        <form onSubmit={onSubmit} className='space-y-6'>
          <div className='min-h-[400px]'>{forms[currentStep as keyof typeof forms]}</div>

          <div className='pt-6 border-t flex justify-between items-center gap-4'>
            <div>
              {!isFirstStep(currentStep) && (
                <Button type='button' variant='outline' onClick={handlePreviousStep} size='lg'>
                  <ArrowLeftIcon className='w-4 h-4' />
                  Previous
                </Button>
              )}
            </div>

            <div className='flex gap-2'>
              {!isLastStep(currentStep) && (
                <Button
                  type='button'
                  onClick={handleNextStep}
                  disabled={!isCurrentStepValid || isSavingProgress}
                  size='lg'
                >
                  {isSavingProgress ? (
                    <Loader2Icon className='w-4 h-4 animate-spin' />
                  ) : (
                    <>
                      Continue
                      <ArrowRightIcon className='w-4 h-4' />
                    </>
                  )}
                </Button>
              )}
              {isLastStep(currentStep) && (
                <Button type='submit' disabled={isPending} size='lg' className='min-w-[200px]'>
                  {isPending ? (
                    <>
                      <Loader2Icon className='w-4 h-4 animate-spin' />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className='w-4 h-4' />
                      Submit for Review
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {isLastStep(currentStep) && (
            <div className='bg-primary/5 border border-primary/20 rounded-lg p-4'>
              <p className='text-sm text-foreground'>
                <strong>What happens next?</strong> Our team will review your application within 2-3 business days.
                You'll receive an email notification once your application is approved. If we need any additional
                information, we'll reach out to you directly.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function getFileFormat(filename: string): 'PDF' | 'DOCX' | 'JPEG' | 'PNG' {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'PDF';
    case 'docx':
      return 'DOCX';
    case 'jpg':
    case 'jpeg':
      return 'JPEG';
    case 'png':
      return 'PNG';
    default:
      return 'PDF';
  }
}
