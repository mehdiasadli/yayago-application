import { BarChart3, Globe2, LayoutDashboard, Layers, ShieldCheck, Smartphone } from 'lucide-react';

const benefits = [
  {
    title: 'Global Reach',
    description: 'Showcase your fleet to thousands of local and international customers looking for rentals.',
    icon: Globe2,
    stat: '50K+',
    statLabel: 'Monthly Visitors',
  },
  {
    title: 'Verified Customers',
    description: 'We screen all users, verifying their identity and driving license before they can book.',
    icon: ShieldCheck,
    stat: '100%',
    statLabel: 'ID Verified',
  },
  {
    title: 'Smart Dashboard',
    description: 'Manage your inventory, pricing, availability, and bookings from one intuitive platform.',
    icon: LayoutDashboard,
    stat: '24/7',
    statLabel: 'Access',
  },
  {
    title: 'Secure Payments',
    description: 'Get paid automatically. We handle payment processing and deposit earnings to your account.',
    icon: Layers,
    stat: '24h',
    statLabel: 'Fast Payouts',
  },
  {
    title: 'Mobile Ready',
    description: 'Manage your business on the go with our mobile-friendly partner dashboard.',
    icon: Smartphone,
    stat: 'iOS',
    statLabel: '& Android',
  },
  {
    title: 'Data & Analytics',
    description: 'Gain insights into your performance, popular cars, and revenue trends.',
    icon: BarChart3,
    stat: 'Real',
    statLabel: 'Time Data',
  },
];

export function HostBenefits() {
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
            Why Choose Us
          </div>
          <h2 className='font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl'>Why Partner with YayaGO?</h2>
          <p className='mt-4 text-muted-foreground text-lg max-w-2xl mx-auto'>
            We provide the tools and audience you need to grow your rental business.
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
