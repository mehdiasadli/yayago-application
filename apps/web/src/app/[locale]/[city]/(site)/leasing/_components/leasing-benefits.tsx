import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, CalendarCheck, Car, ShieldCheck, Wallet, Wrench } from 'lucide-react';

const benefits = [
  {
    title: 'Lower Monthly Payments',
    description: 'Lease payments are typically 30-60% lower than purchase loan payments for the same vehicle.',
    icon: Wallet,
  },
  {
    title: 'Drive New Cars',
    description: 'Drive the latest models with the newest technology and safety features every few years.',
    icon: Car,
  },
  {
    title: 'Warranty Coverage',
    description: 'Most lease terms fall within the manufacturer’s warranty period, reducing repair costs.',
    icon: ShieldCheck,
  },
  {
    title: 'Flexible Terms',
    description: 'Choose from 12, 24, or 36-month terms to match your lifestyle and budget needs.',
    icon: CalendarCheck,
  },
  {
    title: 'Maintenance Included',
    description: 'Optional maintenance packages available to cover routine service and wear-and-tear.',
    icon: Wrench,
  },
  {
    title: 'Tax Advantages',
    description: 'Business leasing may offer significant tax deductions compared to purchasing vehicles.',
    icon: Banknote,
  },
];

export function LeasingBenefits() {
  return (
    <section className='container mx-auto px-4 py-16'>
      <div className='mb-12 text-center'>
        <h2 className='font-bold text-3xl tracking-tight md:text-4xl'>Why Lease with YayaGO?</h2>
        <p className='mt-4 text-muted-foreground'>
          Experience the freedom of mobility with our comprehensive leasing benefits.
        </p>
      </div>
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {benefits.map((benefit, index) => (
          <Card key={index} className='border-none bg-muted/50 shadow-sm transition-colors hover:bg-muted/80'>
            <CardHeader>
              <benefit.icon className='mb-2 size-10 text-primary' />
              <CardTitle className='text-xl'>{benefit.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

