import { Eye, Heart, Shield, Target, Users, Zap } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Trust & Safety',
    description: 'Every rental company and vehicle on our platform is verified. Every customer is ID-checked.',
  },
  {
    icon: Zap,
    title: 'Simplicity',
    description: 'We believe renting a car should be as easy as booking a hotel room. No calls, no hassle.',
  },
  {
    icon: Users,
    title: 'Community',
    description: "We're building a community of trusted rental partners and satisfied customers.",
  },
];

export function AboutMission() {
  return (
    <section className='relative overflow-hidden py-20 lg:py-28'>
      {/* Background */}
      <div
        className='absolute inset-0 opacity-[0.02]'
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Gradient overlays */}
      <div className='absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl' />
      <div className='absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl' />

      <div className='container relative z-10 mx-auto px-4'>
        <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto'>
          {/* Left side - Mission & Vision */}
          <div>
            <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary'>
              Our Purpose
            </div>
            <h2 className='font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl mb-6'>
              Revolutionizing Car Rental in the UAE
            </h2>

            <div className='space-y-8'>
              <div className='flex gap-4'>
                <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white'>
                  <Target className='size-6' />
                </div>
                <div>
                  <h3 className='font-bold text-lg mb-2'>Our Mission</h3>
                  <p className='text-muted-foreground leading-relaxed'>
                    To democratize access to mobility by creating a seamless, secure, and transparent marketplace where
                    anyone can rent a car from verified partners with complete peace of mind.
                  </p>
                </div>
              </div>

              <div className='flex gap-4'>
                <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white'>
                  <Eye className='size-6' />
                </div>
                <div>
                  <h3 className='font-bold text-lg mb-2'>Our Vision</h3>
                  <p className='text-muted-foreground leading-relaxed'>
                    To become the region's most trusted platform for vehicle rental, where customers find the perfect
                    car and rental companies grow their business – all through one unified marketplace.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Values */}
          <div className='space-y-4'>
            <div className='mb-6'>
              <h3 className='font-bold text-2xl mb-2'>What We Believe In</h3>
              <p className='text-muted-foreground'>The principles that guide everything we do.</p>
            </div>

            {values.map((value, index) => (
              <div
                key={index}
                className='group flex gap-4 p-5 rounded-2xl border bg-card hover:shadow-xl hover:border-primary/30 transition-all duration-300'
              >
                <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300'>
                  <value.icon className='size-6' />
                </div>
                <div>
                  <h4 className='font-bold text-lg mb-1'>{value.title}</h4>
                  <p className='text-muted-foreground text-sm leading-relaxed'>{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
