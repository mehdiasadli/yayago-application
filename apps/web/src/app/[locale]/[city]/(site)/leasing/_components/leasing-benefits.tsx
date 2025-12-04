import { Banknote, CalendarCheck, Car, ShieldCheck, Wallet, Wrench } from 'lucide-react';

const benefits = [
  {
    title: 'Lower Monthly Payments',
    description: 'Lease payments are typically 30-60% lower than purchase loan payments for the same vehicle.',
    icon: Wallet,
    stat: '60%',
    statLabel: 'Lower',
  },
  {
    title: 'Drive New Cars',
    description: 'Drive the latest models with the newest technology and safety features every few years.',
    icon: Car,
    stat: 'New',
    statLabel: 'Models',
  },
  {
    title: 'Warranty Coverage',
    description: "Most lease terms fall within the manufacturer's warranty period, reducing repair costs.",
    icon: ShieldCheck,
    stat: '100%',
    statLabel: 'Covered',
  },
  {
    title: 'Flexible Terms',
    description: 'Choose from 12, 24, or 36-month terms to match your lifestyle and budget needs.',
    icon: CalendarCheck,
    stat: '12-48',
    statLabel: 'Months',
  },
  {
    title: 'Maintenance Included',
    description: 'Optional maintenance packages available to cover routine service and wear-and-tear.',
    icon: Wrench,
    stat: 'Full',
    statLabel: 'Service',
  },
  {
    title: 'Tax Advantages',
    description: 'Business leasing may offer significant tax deductions compared to purchasing vehicles.',
    icon: Banknote,
    stat: 'VAT',
    statLabel: 'Deductible',
  },
];

export function LeasingBenefits() {
  return (
    <section className='relative overflow-hidden py-20 lg:py-28'>
      {/* Background pattern */}
      <div className='absolute inset-0'>
        <div
          className='absolute inset-0 opacity-[0.02]'
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Gradient overlays */}
        <div className='absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl' />
        <div className='absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl' />
      </div>

      <div className='container relative z-10 mx-auto px-4'>
        <div className='mb-16 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary'>
            Benefits
          </div>
          <h2 className='font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl'>Why Lease with YayaGO?</h2>
          <p className='mt-4 text-muted-foreground text-lg max-w-2xl mx-auto'>
            Experience the freedom of mobility with our comprehensive leasing benefits.
          </p>
        </div>

        {/* Bento-style grid */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {/* Featured card - larger */}
          {(() => {
            const FeaturedIcon = benefits[0].icon;
            return (
              <div className='group relative md:col-span-2 lg:col-span-1 lg:row-span-2 rounded-3xl border bg-card p-8 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/30'>
                <div className='absolute inset-0 bg-linear-to-br from-primary/10 via-primary/5 to-transparent' />
                <div className='absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity' />

                <div className='relative h-full flex flex-col'>
                  <div className='mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30'>
                    <FeaturedIcon className='size-8' />
                  </div>
                  <div className='mb-2 flex items-baseline gap-2'>
                    <span className='text-4xl font-bold text-primary'>{benefits[0].stat}</span>
                    <span className='text-sm text-muted-foreground'>{benefits[0].statLabel}</span>
                  </div>
                  <h3 className='mb-3 font-bold text-2xl'>{benefits[0].title}</h3>
                  <p className='text-muted-foreground leading-relaxed flex-1'>{benefits[0].description}</p>
                </div>
              </div>
            );
          })()}

          {/* Regular cards */}
          {benefits.slice(1).map((benefit, index) => (
            <div
              key={index}
              className='group relative rounded-2xl border bg-card p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1'
            >
              {/* Hover gradient */}
              <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />

              <div className='relative flex gap-4'>
                <div className='shrink-0'>
                  <div className='inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300'>
                    <benefit.icon className='size-6' />
                  </div>
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='mb-1 flex items-baseline gap-2'>
                    <span className='text-xl font-bold text-primary'>{benefit.stat}</span>
                    <span className='text-xs text-muted-foreground'>{benefit.statLabel}</span>
                  </div>
                  <h3 className='mb-1 font-bold text-lg'>{benefit.title}</h3>
                  <p className='text-muted-foreground text-sm leading-relaxed'>{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
