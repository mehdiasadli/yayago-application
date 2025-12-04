import { CheckCircle2, FileText, LayoutDashboard, ShieldCheck, Wallet } from 'lucide-react';

const steps = [
  {
    icon: LayoutDashboard,
    title: 'Subscribe & Join',
    description: 'Create your partner account and choose a subscription plan that fits your fleet size.',
  },
  {
    icon: FileText,
    title: 'Onboard Your Business',
    description: 'Complete your profile with company details, trade license, and RTA permits.',
  },
  {
    icon: ShieldCheck,
    title: 'Get Verified',
    description: 'Our team reviews your documents to ensure quality and trust. Once approved, you are ready to go.',
  },
  {
    icon: CheckCircle2,
    title: 'List Your Fleet',
    description: 'Add your vehicles with photos and details. Each listing is verified before going live.',
  },
  {
    icon: Wallet,
    title: 'Start Earning',
    description: 'Receive bookings instantly. We handle payments and transfer your earnings minus a 5% fee.',
  },
];

export function HostHowItWorks() {
  return (
    <section className='relative overflow-hidden bg-muted/50 py-20 lg:py-28'>
      {/* Pattern background */}
      <div className='absolute inset-0 opacity-[0.02]'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='diagonal-lines' width='20' height='20' patternUnits='userSpaceOnUse'>
              <path d='M 0 20 L 20 0' fill='none' stroke='currentColor' strokeWidth='1' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#diagonal-lines)' />
        </svg>
      </div>

      {/* Gradient blobs */}
      <div className='absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl' />
      <div className='absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl' />

      <div className='container relative z-10 mx-auto px-4'>
        <div className='mb-16 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary'>
            Getting Started
          </div>
          <h2 className='font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl'>How It Works</h2>
          <p className='mt-4 text-muted-foreground text-lg max-w-2xl mx-auto'>
            A simple, streamlined process to get your fleet on the road.
          </p>
        </div>

        {/* Mobile: Linear layout */}
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

        {/* Desktop: Zigzag layout */}
        <div className='hidden md:block max-w-5xl mx-auto'>
          <div className='relative'>
            {/* SVG connector line */}
            <svg
              className='absolute inset-0 w-full h-full pointer-events-none'
              preserveAspectRatio='none'
              style={{ zIndex: 0 }}
            >
              <defs>
                <linearGradient id='line-gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                  <stop offset='0%' stopColor='hsl(var(--primary))' stopOpacity='0.3' />
                  <stop offset='50%' stopColor='hsl(var(--primary))' stopOpacity='0.5' />
                  <stop offset='100%' stopColor='hsl(var(--primary))' stopOpacity='0.3' />
                </linearGradient>
              </defs>
            </svg>

            {/* Steps grid */}
            <div className='grid grid-cols-3 gap-y-8'>
              {/* Row 1: Steps 1-3 (left to right) */}
              {steps.slice(0, 3).map((step, index) => (
                <div key={index} className='relative'>
                  {/* Connector to next */}
                  {index < 2 && (
                    <div className='absolute top-10 left-[calc(50%+40px)] right-0 h-0.5 bg-linear-to-r from-primary/40 to-primary/20' />
                  )}
                  <StepCard step={step} index={index} />
                </div>
              ))}

              {/* Vertical connector from step 3 to step 4 */}
              <div className='col-span-3 flex justify-end pr-[calc(16.67%-40px)]'>
                <div className='w-0.5 h-8 bg-linear-to-b from-primary/20 to-primary/40' />
              </div>

              {/* Row 2: Steps 4-5 (right to left) */}
              <div className='col-span-3 grid grid-cols-3'>
                <div /> {/* Empty cell */}
                <div className='relative'>
                  {/* Connector from step 5 to step 4 */}
                  <div className='absolute top-10 left-[calc(50%+40px)] right-0 h-0.5 bg-linear-to-r from-primary/40 to-primary/20' />
                  <StepCard step={steps[4]} index={4} />
                </div>
                <div className='relative'>
                  <StepCard step={steps[3]} index={3} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  return (
    <div className='group flex flex-col items-center text-center'>
      {/* Step indicator */}
      <div className='relative mb-4'>
        <div className='flex size-20 items-center justify-center rounded-2xl bg-background shadow-xl ring-1 ring-border group-hover:ring-primary/50 group-hover:shadow-2xl transition-all duration-300'>
          <step.icon className='size-8 text-primary' />
        </div>
        <div className='absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg'>
          {index + 1}
        </div>
      </div>

      {/* Content */}
      <div className='max-w-[200px]'>
        <h3 className='mb-2 font-bold text-lg'>{step.title}</h3>
        <p className='text-muted-foreground text-sm leading-relaxed'>{step.description}</p>
      </div>
    </div>
  );
}
