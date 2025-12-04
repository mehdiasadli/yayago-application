import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

export function ContactHero() {
  return (
    <section className='relative overflow-hidden bg-primary py-24 lg:py-32'>
      {/* Grid pattern background */}
      <div className='absolute inset-0 opacity-10'>
        <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
          <defs>
            <pattern id='contact-hero-grid' width='40' height='40' patternUnits='userSpaceOnUse'>
              <path d='M 40 0 L 0 0 0 40' fill='none' stroke='white' strokeWidth='1' />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#contact-hero-grid)' />
        </svg>
      </div>

      {/* Decorative blurred circles */}
      <div className='absolute top-20 right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl' />
      <div className='absolute bottom-10 left-10 h-64 w-64 rounded-full bg-white/5 blur-3xl' />

      <div className='container relative z-10 mx-auto px-4'>
        <div className='max-w-3xl mx-auto text-center mb-16'>
          <div className='mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm'>
            <MessageCircle className='size-4 text-white' />
            <span className='font-medium text-white'>Get in Touch</span>
          </div>

          <h1 className='mb-6 font-bold text-4xl text-white tracking-tight sm:text-5xl lg:text-6xl'>
            We'd Love to
            <br />
            <span className='text-white/80'>Hear From You</span>
          </h1>

          <p className='mx-auto max-w-2xl text-lg text-white/80 sm:text-xl'>
            Have questions about our platform? Need help with a booking? Our team is here to help you with anything you
            need.
          </p>
        </div>

        {/* Contact cards */}
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto'>
          <ContactCard icon={Mail} title='Email Us' value='support@yayago.ae' href='mailto:support@yayago.ae' />
          <ContactCard icon={Phone} title='Call Us' value='+971 50 123 4567' href='tel:+971501234567' />
          <ContactCard
            icon={MapPin}
            title='Visit Us'
            value='Al Karama, Dubai, UAE'
            href='https://maps.google.com'
            external
          />
          <ContactCard icon={Clock} title='Working Hours' value='Mon-Fri, 9AM-6PM' />
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon: Icon,
  title,
  value,
  href,
  external,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <div className='flex flex-col items-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors group'>
      <div className='flex size-12 items-center justify-center rounded-xl bg-white/20 mb-4 group-hover:scale-110 transition-transform'>
        <Icon className='size-6 text-white' />
      </div>
      <p className='text-sm text-white/70 mb-1'>{title}</p>
      <p className='text-white font-medium text-center'>{value}</p>
    </div>
  );

  if (href) {
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
        {content}
      </a>
    );
  }

  return content;
}

