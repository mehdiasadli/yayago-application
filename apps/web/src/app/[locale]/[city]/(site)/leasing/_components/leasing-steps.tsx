import { Car, ClipboardCheck, FileText, Truck } from 'lucide-react';

const steps = [
  {
    icon: Car,
    title: 'Select Your Vehicle',
    description: 'Browse our extensive inventory of premium vehicles and choose the one that fits your needs.',
  },
  {
    icon: FileText,
    title: 'Customize Your Plan',
    description: 'Choose your lease duration, mileage limit, and initial payment options.',
  },
  {
    icon: ClipboardCheck,
    title: 'Submit Application',
    description: 'Complete our quick online application with your identification and income details.',
  },
  {
    icon: Truck,
    title: 'Approval & Delivery',
    description: 'Get approved within 24 hours and have your new car delivered to your doorstep.',
  },
];

export function LeasingSteps() {
  return (
    <section className='relative overflow-hidden bg-muted/50 py-20 lg:py-28'>
      {/* Pattern background */}
      <div className='absolute inset-0 opacity-[0.02]'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='leasing-diagonal' width='20' height='20' patternUnits='userSpaceOnUse'>
              <path d='M 0 20 L 20 0' fill='none' stroke='currentColor' strokeWidth='1' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#leasing-diagonal)' />
        </svg>
      </div>

      {/* Gradient blobs */}
      <div className='absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl' />
      <div className='absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl' />

      <div className='container relative z-10 mx-auto px-4'>
        <div className='mb-16 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary'>
            Simple Process
          </div>
          <h2 className='font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl'>How It Works</h2>
          <p className='mt-4 text-muted-foreground text-lg max-w-2xl mx-auto'>
            Get on the road in four simple steps.
          </p>
        </div>

        {/* Mobile: Vertical layout */}
        <div className='md:hidden space-y-4'>
          {steps.map((step, index) => (
            <div key={index} className='flex gap-4'>
              <div className='flex flex-col items-center'>
                <div className='flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg'>
                  <step.icon className='size-6' />
                </div>
                {index < steps.length - 1 && <div className='w-0.5 flex-1 bg-primary/20 my-2' />}
              </div>
              <div className='flex-1 pb-6'>
                <div className='text-xs font-semibold text-primary mb-1'>Step {index + 1}</div>
                <h3 className='mb-2 font-bold text-lg'>{step.title}</h3>
                <p className='text-muted-foreground text-sm leading-relaxed'>{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Horizontal layout with connectors */}
        <div className='hidden md:block'>
          <div className='grid grid-cols-4 gap-6'>
            {steps.map((step, index) => (
              <div key={index} className='relative group'>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className='absolute top-10 left-[calc(50%+40px)] right-0 h-0.5 bg-linear-to-r from-primary/40 to-primary/20 -mr-3' />
                )}

                <div className='flex flex-col items-center text-center'>
                  {/* Step indicator */}
                  <div className='relative mb-6'>
                    <div className='flex size-20 items-center justify-center rounded-2xl bg-background shadow-xl ring-1 ring-border group-hover:ring-primary/50 group-hover:shadow-2xl transition-all duration-300'>
                      <step.icon className='size-8 text-primary' />
                    </div>
                    <div className='absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg'>
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className='mb-2 font-bold text-lg'>{step.title}</h3>
                  <p className='text-muted-foreground text-sm leading-relaxed'>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
