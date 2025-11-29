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
    <section className='bg-secondary/20 py-16 lg:py-24'>
      <div className='container mx-auto px-4'>
        <div className='mb-16 text-center'>
          <h2 className='font-bold text-3xl tracking-tight md:text-4xl'>How It Works</h2>
          <p className='mt-4 text-muted-foreground'>
            A simple, streamlined process to get your fleet on the road.
          </p>
        </div>

        <div className='relative mx-auto max-w-4xl'>
          <div className='absolute top-0 bottom-0 left-8 hidden w-px bg-border md:block' />

          <div className='space-y-12'>
            {steps.map((step, index) => (
              <div key={index} className='relative flex gap-8 md:items-start'>
                <div className='relative z-10 flex size-16 shrink-0 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border'>
                  <step.icon className='size-7 text-primary' />
                </div>
                <div className='pt-2'>
                  <h3 className='mb-2 font-bold text-xl'>{step.title}</h3>
                  <p className='text-muted-foreground leading-relaxed'>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

