import { Check, X } from 'lucide-react';

const comparisons = [
  {
    feature: 'Browse multiple rental companies',
    traditional: false,
    aggregators: true,
    yayago: true,
  },
  {
    feature: 'Book directly on platform',
    traditional: true,
    aggregators: false,
    yayago: true,
  },
  {
    feature: 'Pay everything in one place',
    traditional: true,
    aggregators: false,
    yayago: true,
  },
  {
    feature: 'No redirects to external sites',
    traditional: true,
    aggregators: false,
    yayago: true,
  },
  {
    feature: 'Verified customer protection',
    traditional: false,
    aggregators: false,
    yayago: true,
  },
  {
    feature: 'Transparent pricing',
    traditional: false,
    aggregators: false,
    yayago: true,
  },
  {
    feature: '24/7 Platform support',
    traditional: false,
    aggregators: false,
    yayago: true,
  },
];

export function AboutDifference() {
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

      <div className='container relative z-10 mx-auto px-4'>
        <div className='mb-16 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary'>
            The Difference
          </div>
          <h2 className='font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl'>
            Not All Marketplaces Are Equal
          </h2>
          <p className='mt-4 text-muted-foreground text-lg max-w-3xl mx-auto'>
            Most car rental websites either own their own fleet or simply show you listings and redirect you elsewhere.
            YayaGO is different – we handle everything from booking to payment, giving you a seamless experience.
          </p>
        </div>

        {/* Comparison cards */}
        <div className='grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12'>
          {/* Traditional Rentals */}
          <div className='rounded-2xl border bg-card p-6'>
            <div className='mb-6'>
              <h3 className='font-bold text-lg text-muted-foreground'>Traditional Rentals</h3>
              <p className='text-sm text-muted-foreground mt-1'>Single company, limited options</p>
            </div>
            <div className='space-y-3'>
              {comparisons.map((item, index) => (
                <div key={index} className='flex items-center gap-3 text-sm'>
                  {item.traditional ? (
                    <div className='flex size-5 items-center justify-center rounded-full bg-muted'>
                      <Check className='size-3 text-muted-foreground' />
                    </div>
                  ) : (
                    <div className='flex size-5 items-center justify-center rounded-full bg-muted'>
                      <X className='size-3 text-muted-foreground' />
                    </div>
                  )}
                  <span className='text-muted-foreground'>{item.feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aggregator Sites */}
          <div className='rounded-2xl border bg-card p-6'>
            <div className='mb-6'>
              <h3 className='font-bold text-lg text-muted-foreground'>Aggregator Sites</h3>
              <p className='text-sm text-muted-foreground mt-1'>Just listings, no real service</p>
            </div>
            <div className='space-y-3'>
              {comparisons.map((item, index) => (
                <div key={index} className='flex items-center gap-3 text-sm'>
                  {item.aggregators ? (
                    <div className='flex size-5 items-center justify-center rounded-full bg-muted'>
                      <Check className='size-3 text-muted-foreground' />
                    </div>
                  ) : (
                    <div className='flex size-5 items-center justify-center rounded-full bg-muted'>
                      <X className='size-3 text-muted-foreground' />
                    </div>
                  )}
                  <span className='text-muted-foreground'>{item.feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* YayaGO */}
          <div className='rounded-2xl border-2 border-primary bg-primary/5 p-6 relative overflow-hidden'>
            <div className='absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-bl-lg'>
              Best Choice
            </div>
            <div className='mb-6'>
              <h3 className='font-bold text-lg text-primary'>YayaGO</h3>
              <p className='text-sm text-muted-foreground mt-1'>Complete marketplace experience</p>
            </div>
            <div className='space-y-3'>
              {comparisons.map((item, index) => (
                <div key={index} className='flex items-center gap-3 text-sm'>
                  <div className='flex size-5 items-center justify-center rounded-full bg-primary'>
                    <Check className='size-3 text-white' />
                  </div>
                  <span className='font-medium'>{item.feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom explanation */}
        <div className='max-w-3xl mx-auto text-center'>
          <p className='text-muted-foreground leading-relaxed'>
            With other platforms, you either get stuck with one company's limited fleet, or you browse listings only to
            be redirected elsewhere to complete your booking. YayaGO combines the best of both worlds: access to
            hundreds of rental companies with the convenience of booking and paying everything in one place.
          </p>
        </div>
      </div>
    </section>
  );
}

