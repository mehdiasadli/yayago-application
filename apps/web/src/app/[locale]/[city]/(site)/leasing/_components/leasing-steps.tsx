import { CheckCircle2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Select Your Vehicle',
    description: 'Browse our extensive inventory of premium vehicles and choose the one that fits your needs.',
  },
  {
    number: '02',
    title: 'Customize Your Plan',
    description: 'Choose your lease duration, mileage limit, and initial payment options.',
  },
  {
    number: '03',
    title: 'Submit Application',
    description: 'Complete our quick online application with your identification and income details.',
  },
  {
    number: '04',
    title: 'Approval & Delivery',
    description: 'Get approved within 24 hours and have your new car delivered to your doorstep.',
  },
];

export function LeasingSteps() {
  return (
    <section className='bg-secondary/20 py-16 lg:py-24'>
      <div className='container mx-auto px-4'>
        <div className='mb-16 text-center'>
          <h2 className='font-bold text-3xl tracking-tight md:text-4xl'>How It Works</h2>
          <p className='mt-4 text-muted-foreground'>Get on the road in four simple steps.</p>
        </div>
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {steps.map((step, index) => (
            <div key={index} className='relative flex flex-col items-center text-center'>
              <div className='mb-6 flex size-16 items-center justify-center rounded-full bg-background text-2xl font-bold shadow-sm'>
                {step.number}
              </div>
              <h3 className='mb-3 font-semibold text-xl'>{step.title}</h3>
              <p className='text-muted-foreground'>{step.description}</p>
              {index < steps.length - 1 && (
                <div className='absolute top-8 -right-[50%] hidden h-px w-full bg-border lg:block' />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

