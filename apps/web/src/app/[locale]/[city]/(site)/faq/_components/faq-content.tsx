'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation/navigation-client';
import { cn } from '@/lib/utils';
import { ArrowRight, Car, CreditCard, HelpCircle, MessageCircle, Search, Shield, Users } from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'booking', label: 'Booking', icon: Car },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'verification', label: 'Verification', icon: Shield },
  { id: 'partners', label: 'For Partners', icon: Users },
  { id: 'support', label: 'Support', icon: MessageCircle },
];

const faqs = [
  // Booking
  {
    id: 1,
    category: 'booking',
    title: 'How do I book a car on YayaGO?',
    content:
      "Simply search for cars by location, dates, and preferences. Browse listings from multiple rental companies, select your car, and complete the booking. You'll pay everything on our platform – no need to contact the rental company separately.",
  },
  {
    id: 2,
    category: 'booking',
    title: 'Can I modify or cancel my booking?',
    content:
      "Yes, you can modify or cancel your booking through your account dashboard. Cancellation policies vary by rental company, but you'll always see the terms before booking. Most bookings can be cancelled for free up to 24-48 hours before pickup.",
  },
  {
    id: 3,
    category: 'booking',
    title: 'What documents do I need to rent a car?',
    content:
      "You'll need a valid driver's license (UAE or international), Emirates ID or passport, and a credit card for the security deposit. Some rental companies may have additional requirements for specific vehicle categories.",
  },
  {
    id: 4,
    category: 'booking',
    title: 'Is delivery available?',
    content:
      'Many rental companies on YayaGO offer delivery and pickup services. You can filter for this option when searching, and delivery fees (if any) will be shown clearly before booking.',
  },
  {
    id: 5,
    category: 'booking',
    title: 'What happens if I return the car late?',
    content:
      'Late returns are charged based on the rental company\'s policy, typically on an hourly or daily basis. If you know you\'ll be late, contact support to extend your booking and avoid additional fees.',
  },
  // Payments
  {
    id: 6,
    category: 'payments',
    title: 'How does payment work on YayaGO?',
    content:
      "You pay the full rental amount through our secure platform when booking. This includes the rental fee and any add-ons you select. The security deposit is held separately by the rental company and released after your rental.",
  },
  {
    id: 7,
    category: 'payments',
    title: 'What payment methods do you accept?',
    content:
      'We accept all major credit and debit cards (Visa, Mastercard, American Express), as well as Apple Pay and Google Pay. Some regions may have additional local payment options.',
  },
  {
    id: 8,
    category: 'payments',
    title: 'Are there any hidden fees?',
    content:
      "No hidden fees! The price you see includes all mandatory charges. Optional extras like insurance upgrades, GPS, or child seats are shown separately so you know exactly what you're paying for.",
  },
  {
    id: 9,
    category: 'payments',
    title: 'How does the security deposit work?',
    content:
      "The security deposit is held by the rental company (not YayaGO) on your credit card. It's typically released within 7-14 business days after you return the car in good condition.",
  },
  // Verification
  {
    id: 10,
    category: 'verification',
    title: 'Why do I need to verify my identity?',
    content:
      'Identity verification helps keep our community safe. It ensures that only verified drivers can book vehicles, protecting both you and our rental partners. Verification is quick and only needs to be done once.',
  },
  {
    id: 11,
    category: 'verification',
    title: 'How do I verify my account?',
    content:
      "Go to your account settings and click on 'Verification'. Upload a clear photo of your driver's license and a selfie. Our team reviews submissions within 1-2 business days.",
  },
  {
    id: 12,
    category: 'verification',
    title: 'What if my verification is rejected?',
    content:
      "If rejected, you'll receive an email explaining why. Common reasons include blurry photos or expired documents. Simply resubmit with clearer images or updated documents.",
  },
  // Partners
  {
    id: 13,
    category: 'partners',
    title: 'How do I list my rental company on YayaGO?',
    content:
      "Sign up as a partner, complete your business profile with trade license and RTA permits, get verified, and start listing your vehicles. Our team will guide you through the onboarding process.",
  },
  {
    id: 14,
    category: 'partners',
    title: 'What fees does YayaGO charge partners?',
    content:
      "We charge a 5% commission on successful bookings. There are no listing fees, monthly fees, or hidden charges. You keep 95% of every booking.",
  },
  {
    id: 15,
    category: 'partners',
    title: 'How and when do partners get paid?',
    content:
      'Partners receive payouts within 24 hours of a completed rental. Payments are made directly to your registered bank account. You can track all earnings in your partner dashboard.',
  },
  {
    id: 16,
    category: 'partners',
    title: 'Are customers verified before they can book?',
    content:
      'Yes! All customers must verify their identity and driver\'s license before they can book any vehicle. This protects your fleet and ensures you\'re renting to legitimate drivers.',
  },
  // Support
  {
    id: 17,
    category: 'support',
    title: 'How do I contact customer support?',
    content:
      'You can reach our support team via email at support@yayago.ae, by phone at +971 50 123 4567, or through the in-app chat. We\'re available 7 days a week.',
  },
  {
    id: 18,
    category: 'support',
    title: 'What if I have an issue during my rental?',
    content:
      'Contact our 24/7 support line immediately. We\'ll coordinate with the rental company to resolve the issue. For emergencies like accidents or breakdowns, call our emergency hotline first.',
  },
  {
    id: 19,
    category: 'support',
    title: 'How do I report a problem with a vehicle?',
    content:
      "Document the issue with photos and report it through the app or call support. We take all reports seriously and will work with the rental company to address the problem and ensure you're compensated if needed.",
  },
];

interface FaqContentProps {
  searchTerm: string;
  onClearSearch: () => void;
}

export function FaqContent({ searchTerm, onClearSearch }: FaqContentProps) {
  const [activeCategory, setActiveCategory] = React.useState('all');

  const filtered = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className='relative overflow-hidden py-12 lg:py-16'>
      {/* Background pattern */}
      <div
        className='absolute inset-0 opacity-[0.02]'
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className='container relative z-10 mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          {/* Category tabs */}
          <div className='mb-8 flex flex-wrap gap-2'>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    activeCategory === cat.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-card border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className='size-4' />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search results info */}
          {searchTerm && (
            <div className='mb-6 flex items-center justify-between p-4 rounded-xl bg-muted/50 border'>
              <p className='text-sm text-muted-foreground'>
                Found <span className='font-semibold text-foreground'>{filtered.length}</span> results for "
                <span className='font-semibold text-foreground'>{searchTerm}</span>"
              </p>
              <Button variant='ghost' size='sm' onClick={onClearSearch}>
                Clear search
              </Button>
            </div>
          )}

          {/* FAQ Accordion */}
          {filtered.length > 0 ? (
            <Accordion type='single' collapsible className='space-y-3'>
              {filtered.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id.toString()}
                  className='rounded-2xl border bg-card shadow-sm overflow-hidden data-[state=open]:shadow-lg data-[state=open]:border-primary/30 transition-all duration-200'
                >
                  <AccordionTrigger className='px-6 py-5 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-primary/5'>
                    <span className='text-left font-semibold'>{faq.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className='px-6 pb-5 pt-0 text-muted-foreground leading-relaxed'>
                    {faq.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className='text-center py-16'>
              <div className='flex size-16 items-center justify-center rounded-2xl bg-muted mx-auto mb-6'>
                <Search className='size-8 text-muted-foreground' />
              </div>
              <h3 className='font-bold text-xl mb-2'>No results found</h3>
              <p className='text-muted-foreground mb-6'>
                We couldn't find any FAQs matching your search. Try different keywords or browse by category.
              </p>
              <Button variant='outline' onClick={onClearSearch}>
                Clear search
              </Button>
            </div>
          )}

          {/* Contact CTA */}
          <div className='mt-12 p-6 sm:p-8 rounded-2xl border-2 border-primary/20 bg-primary/5 text-center'>
            <h3 className='font-bold text-xl mb-2'>Still have questions?</h3>
            <p className='text-muted-foreground mb-6'>
              Can't find what you're looking for? Our support team is ready to help.
            </p>
            <Button asChild>
              <Link href='/contact'>
                Contact Support
                <ArrowRight className='ml-2 size-4' />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

