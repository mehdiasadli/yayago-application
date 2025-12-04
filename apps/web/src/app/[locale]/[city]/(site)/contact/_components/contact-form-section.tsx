import { Clock, Headphones, MessageSquare, Shield } from 'lucide-react';
import { ContactForm } from './contact-form';

const features = [
  {
    icon: Clock,
    title: '24h Response Time',
    description: 'We respond to all inquiries within 24 hours.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    description: 'Our team is here to help with any questions.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your information is always kept confidential.',
  },
];

export function ContactFormSection() {
  return (
    <section className='relative overflow-hidden py-20 lg:py-28'>
      {/* Background pattern */}
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

      <div className='container relative z-10 mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid lg:grid-cols-5 gap-12'>
            {/* Left side - Info */}
            <div className='lg:col-span-2'>
              <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary'>
                <MessageSquare className='size-4' />
                Contact Form
              </div>
              <h2 className='font-bold text-3xl tracking-tight md:text-4xl mb-4'>Send Us a Message</h2>
              <p className='text-muted-foreground text-lg mb-8'>
                Fill out the form and our team will get back to you as soon as possible. We're here to help with any
                questions about rentals, partnerships, or general inquiries.
              </p>

              {/* Features */}
              <div className='space-y-4'>
                {features.map((feature, index) => (
                  <div key={index} className='flex gap-4 p-4 rounded-xl border bg-card'>
                    <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
                      <feature.icon className='size-5 text-primary' />
                    </div>
                    <div>
                      <h3 className='font-semibold'>{feature.title}</h3>
                      <p className='text-sm text-muted-foreground'>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Form */}
            <div className='lg:col-span-3'>
              <div className='rounded-3xl border-2 border-primary/20 bg-card p-6 sm:p-8 shadow-xl'>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

