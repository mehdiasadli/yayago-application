'use client';

import { useState, useMemo } from 'react';
import OnboardingForm from './onboarding-form';
import OnboardingSidebar from './onboarding-sidebar';
import { ONBOARDING_STEPS } from './data';
import { GetOnboardingDataOutputType } from '@yayago-app/validators';

interface OnboardingCardProps {
  data: GetOnboardingDataOutputType;
}

export default function OnboardingCard({ data }: OnboardingCardProps) {
  // Start from the saved step (minimum 1)
  const initialStep = Math.min(Math.max(data.onboardingStep || 1, 1), ONBOARDING_STEPS.length);
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Calculate initially completed steps based on saved onboarding step
  const initialCompletedSteps = useMemo(() => {
    const steps: number[] = [];
    // Mark all steps before the current saved step as completed
    for (let i = 1; i < initialStep; i++) {
      steps.push(i);
    }
    return steps;
  }, [initialStep]);

  const [completedSteps, setCompletedSteps] = useState<number[]>(initialCompletedSteps);
  const currentStepData = ONBOARDING_STEPS[currentStep - 1];

  if (!currentStepData) {
    return <div>Error occured</div>;
  }

  const handleStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  return (
    <div className='flex gap-6 max-w-7xl mx-auto'>
      <div className='w-80 shrink-0'>
        <OnboardingSidebar currentStep={currentStep} completedSteps={completedSteps} />
      </div>
      <div className='flex-1 min-w-0'>
        <OnboardingForm
          data={data}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onStepComplete={handleStepComplete}
        />
      </div>
    </div>
  );
}
