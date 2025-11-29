import { Building2Icon, CheckCircleIcon, FileIcon, MapPinIcon, PhoneIcon } from 'lucide-react';

export const ONBOARDING_STEPS = [
  {
    step: 1,
    title: 'Organization Details',
    description: 'Tell us about your organization and create your unique identity.',
    icon: <Building2Icon className='w-4 h-4' />,
  },
  {
    step: 2,
    title: 'Location & City',
    description: 'Select your city to help customers find you.',
    icon: <MapPinIcon className='w-4 h-4' />,
  },
  {
    step: 3,
    title: 'Contact Information',
    description: 'Help customers reach you with your contact details and address.',
    icon: <PhoneIcon className='w-4 h-4' />,
  },
  {
    step: 4,
    title: 'Documents',
    description: 'Upload required documents for verification.',
    icon: <FileIcon className='w-4 h-4' />,
  },
  {
    step: 5,
    title: 'Review & Submit',
    description: 'Review your information before submitting for approval.',
    icon: <CheckCircleIcon className='w-4 h-4' />,
  },
];

export function isLastStep(step: number) {
  return step === ONBOARDING_STEPS.length;
}

export function isFirstStep(step: number) {
  return step === 1;
}

export function getNextStep(step: number) {
  if (isLastStep(step)) {
    return null;
  }

  return step + 1;
}

export function getPreviousStep(step: number) {
  if (isFirstStep(step)) {
    return null;
  }

  return step - 1;
}
