import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ONBOARDING_STEPS } from './data';
import { cn } from '@/lib/utils';
import { CheckCircle2Icon } from 'lucide-react';

interface OnboardingSidebarProps {
  currentStep: number;
  completedSteps: number[];
}

export default function OnboardingSidebar({ currentStep, completedSteps }: OnboardingSidebarProps) {
  return (
    <Card className='sticky top-4'>
      <CardHeader>
        <CardTitle>Onboarding Progress</CardTitle>
        <div className='mt-2'>
          <div className='text-sm text-muted-foreground'>
            Step {currentStep} of {ONBOARDING_STEPS.length}
          </div>
          <div className='mt-2 w-full bg-secondary rounded-full h-2'>
            <div
              className='bg-primary h-2 rounded-full transition-all duration-300'
              style={{ width: `${(completedSteps.length / ONBOARDING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-1'>
        {ONBOARDING_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.step);
          const isCurrent = currentStep === step.step;
          const isPast = step.step < currentStep;

          return (
            <div
              key={step.step}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg transition-all duration-200',
                isCurrent && 'bg-primary/5 border border-primary/20',
                !isCurrent && 'border border-transparent'
              )}
            >
              <div
                className={cn(
                  'shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all',
                  isCurrent && 'bg-primary text-primary-foreground',
                  isCompleted && !isCurrent && 'bg-green-500 text-white',
                  !isCurrent && !isCompleted && 'bg-secondary text-muted-foreground'
                )}
              >
                {isCompleted ? <CheckCircle2Icon className='w-4 h-4' /> : step.icon}
              </div>
              <div className='flex-1 min-w-0'>
                <div
                  className={cn(
                    'font-medium text-sm',
                    isCurrent && 'text-primary',
                    isCompleted && !isCurrent && 'text-green-600',
                    !isCurrent && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </div>
                {isCurrent && <div className='text-xs text-muted-foreground mt-1'>{step.description}</div>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
